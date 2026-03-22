import { useState, useEffect, useMemo, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import AsyncStorage from "@react-native-async-storage/async-storage";
import createContextHook from "@nkzw/create-context-hook";
import {
  COUNTRIES,
  CURRENCIES,
  CountryData,
  CurrencyData,
  getCountryByCode,
  getCountryByName,
  getCurrencyByCode,
  getCurrencySymbol,
  convertCurrency,
  formatPrice,
  EXCHANGE_RATES,
} from "@/constants/countries";
import { useAuth } from "@/providers/AuthProvider";

const LOCATION_COUNTRY_KEY = "user_country_code";
const LOCATION_CITY_KEY = "user_city";
const LOCATION_CURRENCY_KEY = "user_currency_code";
const CONFIRMED_STORES_KEY = "confirmed_stores_by_country_v1";

export const [LocationProvider, useLocation] = createContextHook(() => {
  const queryClient = useQueryClient();
  const { profile, updateProfile } = useAuth();

  const [countryCode, setCountryCodeState] = useState<string>("");
  const [city, setCityState] = useState<string>("");
  const [currencyCode, setCurrencyCodeState] = useState<string>("");
  const [isLoaded, setIsLoaded] = useState(false);
  const [confirmedByCountry, setConfirmedByCountry] = useState<Record<string, string[]>>({});

  useEffect(() => {
    const load = async () => {
      try {
        const [storedCountry, storedCity, storedCurrency, storedConfirmed] =
          await Promise.all([
            AsyncStorage.getItem(LOCATION_COUNTRY_KEY),
            AsyncStorage.getItem(LOCATION_CITY_KEY),
            AsyncStorage.getItem(LOCATION_CURRENCY_KEY),
            AsyncStorage.getItem(CONFIRMED_STORES_KEY),
          ]);

        if (storedCountry) setCountryCodeState(storedCountry);
        if (storedCity) setCityState(storedCity);
        if (storedCurrency) setCurrencyCodeState(storedCurrency);
        if (storedConfirmed) {
          try {
            setConfirmedByCountry(
              JSON.parse(storedConfirmed) as Record<string, string[]>
            );
            console.log("[Location] Loaded confirmed stores from storage");
          } catch {
            console.log("[Location] Failed to parse confirmed stores");
          }
        }

        console.log("[Location] Loaded:", { storedCountry, storedCity, storedCurrency });
      } catch (err) {
        console.log("[Location] Error loading:", err);
      } finally {
        setIsLoaded(true);
      }
    };
    void load();
  }, []);

  useEffect(() => {
    if (!isLoaded || !profile) return;

    const profileCountry = getCountryByCode(profile.country) ?? getCountryByName(profile.country);
    if (!profileCountry) return;

    const syncFromProfile = async () => {
      const storedCountry = await AsyncStorage.getItem(LOCATION_COUNTRY_KEY);

      if (!storedCountry || storedCountry !== profileCountry.code) {
        console.log("[Location] Syncing from profile:", profileCountry.name);
        setCountryCodeState(profileCountry.code);
        setCurrencyCodeState(profileCountry.currency);
        await AsyncStorage.setItem(LOCATION_COUNTRY_KEY, profileCountry.code);
        await AsyncStorage.setItem(LOCATION_CURRENCY_KEY, profileCountry.currency);
      }
    };

    void syncFromProfile();
  }, [profile, isLoaded]);

  const country = useMemo<CountryData | undefined>(
    () => (countryCode ? getCountryByCode(countryCode) : undefined),
    [countryCode]
  );

  const currency = useMemo<CurrencyData | undefined>(
    () => (currencyCode ? getCurrencyByCode(currencyCode) : undefined),
    [currencyCode]
  );

  const setCountry = useCallback(
    async (code: string) => {
      const c = getCountryByCode(code);
      if (!c) return;

      setCountryCodeState(code);
      await AsyncStorage.setItem(LOCATION_COUNTRY_KEY, code);

      if (c.currency !== currencyCode) {
        setCurrencyCodeState(c.currency);
        await AsyncStorage.setItem(LOCATION_CURRENCY_KEY, c.currency);
      }

      try {
        await updateProfile({ country: c.code, currency: c.currency });
      } catch {
        console.log("[Location] Profile sync skipped");
      }

      void queryClient.invalidateQueries({ queryKey: ["search"] });
      console.log("[Location] Country set to:", c.name, c.currency);
    },
    [currencyCode, updateProfile, queryClient]
  );

  const setCity = useCallback(async (newCity: string) => {
    setCityState(newCity);
    await AsyncStorage.setItem(LOCATION_CITY_KEY, newCity);
    console.log("[Location] City set to:", newCity);
  }, []);

  const setCurrency = useCallback(
    async (code: string) => {
      setCurrencyCodeState(code);
      await AsyncStorage.setItem(LOCATION_CURRENCY_KEY, code);

      try {
        await updateProfile({ currency: code });
      } catch {
        console.log("[Location] Currency profile sync skipped");
      }

      console.log("[Location] Currency set to:", code);
    },
    [updateProfile]
  );

  const convert = useCallback(
    (amount: number, fromCurrency: string): number => {
      const toCurr = currencyCode || "USD";
      return convertCurrency(amount, fromCurrency, toCurr);
    },
    [currencyCode]
  );

  const format = useCallback(
    (amount: number, fromCurrency?: string): string => {
      const toCurr = currencyCode || "USD";
      if (fromCurrency && fromCurrency !== toCurr) {
        const converted = convertCurrency(amount, fromCurrency, toCurr);
        return formatPrice(converted, toCurr);
      }
      return formatPrice(amount, toCurr);
    },
    [currencyCode]
  );

  const serpApiCountryCode = useMemo(
    () => country?.serpApiCode ?? "us",
    [country]
  );

  const availableStores = useMemo(
    () => country?.stores ?? [],
    [country]
  );

  const availableCities = useMemo(
    () => country?.cities ?? [],
    [country]
  );

  const confirmedStores = useMemo(
    () => confirmedByCountry[countryCode] ?? [],
    [confirmedByCountry, countryCode]
  );

  const addConfirmedStores = useCallback(
    (stores: string[], forCountryCode: string) => {
      setConfirmedByCountry((prev) => {
        const existing = new Set<string>(prev[forCountryCode] ?? []);
        const newStores = stores.filter((s) => s.trim().length > 0 && !existing.has(s));
        if (newStores.length === 0) return prev;
        newStores.forEach((s) => existing.add(s));
        const updated = { ...prev, [forCountryCode]: Array.from(existing) };
        void AsyncStorage.setItem(CONFIRMED_STORES_KEY, JSON.stringify(updated));
        console.log(
          `[Location] +${newStores.length} confirmed stores for ${forCountryCode} (total: ${existing.size})`
        );
        return updated;
      });
    },
    []
  );

  const hasCountry = useMemo(() => Boolean(countryCode), [countryCode]);

  return useMemo(
    () => ({
      countryCode,
      country,
      city,
      currencyCode: currencyCode || "USD",
      currency,
      isLoaded,
      hasCountry,
      serpApiCountryCode,
      availableStores,
      availableCities,
      confirmedStores,
      addConfirmedStores,
      setCountry,
      setCity,
      setCurrency,
      convert,
      format,
      allCountries: COUNTRIES,
      allCurrencies: CURRENCIES,
      exchangeRates: EXCHANGE_RATES,
      getCurrencySymbol,
    }),
    [
      countryCode, country, city, currencyCode, currency, isLoaded, hasCountry,
      serpApiCountryCode, availableStores, availableCities,
      confirmedStores, addConfirmedStores,
      setCountry, setCity, setCurrency, convert, format,
    ]
  );
});
