import { useState, useEffect, useCallback, useMemo } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import createContextHook from "@nkzw/create-context-hook";
import { supabase } from "@/lib/supabase";
import { Session, User } from "@supabase/supabase-js";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  avatar_url: string | null;
  country: string;
  currency: string;
  created_at: string;
  updated_at: string;
}

export const [AuthProvider, useAuth] = createContextHook(() => {
  const queryClient = useQueryClient();
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  const fetchProfile = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
        console.log("Error fetching profile:", error.message);
        return null;
      }
      return data as UserProfile;
    } catch (err) {
      console.log("Profile fetch exception:", err);
      return null;
    }
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        console.log("Initial session:", currentSession ? "exists" : "none");
        setSession(currentSession);
        setUser(currentSession?.user ?? null);

        if (currentSession?.user) {
          const p = await fetchProfile(currentSession.user.id);
          setProfile(p);
        }
      } catch (err) {
        console.log("Auth init error:", err);
      } finally {
        setIsLoading(false);
        setIsInitialized(true);
      }
    };

    void initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        console.log("Auth state changed:", event);
        setSession(newSession);
        setUser(newSession?.user ?? null);

        if (newSession?.user) {
          const p = await fetchProfile(newSession.user.id);
          setProfile(p);
        } else {
          setProfile(null);
        }
        setIsLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  const signUpMutation = useMutation({
    mutationFn: async ({
      email,
      password,
      fullName,
      country,
      currency,
    }: {
      email: string;
      password: string;
      fullName: string;
      country?: string;
      currency?: string;
    }) => {
      console.log("[Auth] Signing up:", email);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName, country: country ?? "", currency: currency ?? "" },
        },
      });

      if (error) {
        console.log("[Auth] Sign up error:", error.message, "status:", error.status);
        const msg = error.message.toLowerCase();
        if (
          msg.includes("already registered") ||
          msg.includes("already exists") ||
          msg.includes("already been registered") ||
          msg.includes("user already") ||
          msg.includes("email address is already") ||
          error.status === 422
        ) {
          throw new Error("Email already exists, try another email.");
        }
        throw new Error(error.message || "Sign up failed. Please try again.");
      }
      console.log("[Auth] Sign up successful:", data.user?.id);

      const identities = data.user?.identities;
      if (data.user && Array.isArray(identities) && identities.length === 0) {
        console.log("[Auth] Empty identities array — email already exists");
        throw new Error("Email already exists, try another email.");
      }

      let finalData = data;
      if (!data.session) {
        console.log("[Auth] No session after signUp, attempting auto sign-in...");
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) {
          console.log("[Auth] Auto sign-in after signup failed:", signInError.message);
          const sMsg = signInError.message.toLowerCase();
          if (sMsg.includes("invalid login") || sMsg.includes("invalid credentials")) {
            throw new Error("Email already exists, try another email.");
          }
          throw signInError;
        }
        console.log("[Auth] Auto sign-in after signup successful");
        finalData = signInData;
      }

      const userId = finalData.user?.id;
      if (userId) {
        try {
          console.log("[Auth] Upserting profile row for:", userId);
          const { error: profileError } = await supabase
            .from("profiles")
            .upsert(
              {
                id: userId,
                full_name: fullName,
                email,
                country: country ?? "",
                currency: currency ?? "",
                updated_at: new Date().toISOString(),
              },
              { onConflict: "id" }
            );
          if (profileError) {
            console.log("[Auth] Profile upsert error (non-fatal):", profileError.message);
          } else {
            console.log("[Auth] Profile row created/updated successfully");
          }
        } catch (e) {
          console.log("[Auth] Profile upsert exception (non-fatal):", e);
        }
      }

      return finalData;
    },
  });

  const signInMutation = useMutation({
    mutationFn: async ({
      email,
      password,
    }: {
      email: string;
      password: string;
    }) => {
      console.log("[Auth] Attempting sign in for:", email);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.log("[Auth] Sign in error:", error.message, "status:", error.status);
        const msg = error.message.toLowerCase();
        if (msg.includes("email not confirmed")) {
          throw new Error("Please confirm your email before signing in. Check your inbox for a verification link.");
        }
        if (msg.includes("invalid login") || msg.includes("invalid credentials")) {
          throw new Error("Incorrect email or password. Please try again.");
        }
        if (msg.includes("network") || msg.includes("fetch")) {
          throw new Error("Network error. Please check your connection and try again.");
        }
        throw new Error(error.message || "Login failed. Please try again.");
      }

      if (!data.session || !data.user) {
        throw new Error("Login failed. No session returned.");
      }

      console.log("[Auth] Sign in successful:", data.user?.id);
      return data;
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (updates: Partial<Pick<UserProfile, "full_name" | "country" | "currency" | "avatar_url">>) => {
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("profiles")
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id)
        .select()
        .single();

      if (error) throw error;
      console.log("Profile updated:", data);
      setProfile(data as UserProfile);
      return data as UserProfile;
    },
  });

  const signOutMutation = useMutation({
    mutationFn: async () => {
      console.log("[Auth] Starting sign out...");
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setProfile(null);
      setSession(null);
      setUser(null);
      queryClient.clear();
      try {
        await AsyncStorage.multiRemove([
          "wishlists_data",
          "notifications_data",
          "chat_messages_v2",
          "item_assignments_v2",
        ]);
      } catch (e) {
        console.log("[Auth] Error clearing AsyncStorage:", e);
      }
      console.log("[Auth] Sign out successful, all data cleared");
    },
  });

  const deleteAccountMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Not authenticated");
      console.log("[Auth] Starting account deletion for:", user.id);

      try {
        const { error: profileError } = await supabase
          .from("profiles")
          .delete()
          .eq("id", user.id);
        if (profileError) console.log("[Auth] Profile delete error:", profileError.message);

        const { data: userWishlists } = await supabase
          .from("wishlists")
          .select("id")
          .eq("user_id", user.id);

        if (userWishlists && userWishlists.length > 0) {
          const wIds = userWishlists.map((w: { id: string }) => w.id);
          await supabase.from("wishlist_items").delete().in("wishlist_id", wIds);
          await supabase.from("collaborators").delete().in("wishlist_id", wIds);
          await supabase.from("chat_messages").delete().in("wishlist_id", wIds);
          await supabase.from("item_assignments").delete().in("wishlist_id", wIds);
          await supabase.from("wishlists").delete().eq("user_id", user.id);
        }

        await supabase.from("collaborators").delete().eq("user_id", user.id);
        await supabase.from("price_alerts").delete().eq("user_id", user.id);
      } catch (dbErr) {
        console.log("[Auth] DB cleanup error (non-fatal):", dbErr);
      }

      const { error: signOutError } = await supabase.auth.signOut();
      if (signOutError) console.log("[Auth] Sign out error during delete:", signOutError.message);

      setProfile(null);
      setSession(null);
      setUser(null);
      queryClient.clear();

      try {
        await AsyncStorage.multiRemove([
          "wishlists_data",
          "notifications_data",
          "chat_messages_v2",
          "item_assignments_v2",
          "recently_viewed_v1",
          "search_history_v1",
          "price_alerts_v2",
          "price_history_v2",
          "price_drops_v2",
          "price_last_check_v2",
          "chat_last_read_v1",
          "has_onboarded_v1",
          "user_country_code",
          "user_currency_code",
          "user_city",
          "theme_preference",
        ]);
      } catch (e) {
        console.log("[Auth] Error clearing AsyncStorage:", e);
      }

      console.log("[Auth] Account deleted and all data cleared");
    },
  });

  const isAuthenticated = useMemo(() => !!session?.user, [session]);

  return useMemo(
    () => ({
      session,
      user,
      profile,
      isLoading,
      isInitialized,
      isAuthenticated,
      signUp: signUpMutation.mutateAsync,
      signIn: signInMutation.mutateAsync,
      signOut: signOutMutation.mutateAsync,
      deleteAccount: deleteAccountMutation.mutateAsync,
      updateProfile: updateProfileMutation.mutateAsync,
      isSigningUp: signUpMutation.isPending,
      isSigningIn: signInMutation.isPending,
      isSigningOut: signOutMutation.isPending,
      isDeletingAccount: deleteAccountMutation.isPending,
      isUpdatingProfile: updateProfileMutation.isPending,
      signUpError: signUpMutation.error,
      signInError: signInMutation.error,
    }),
    [
      session,
      user,
      profile,
      isLoading,
      isInitialized,
      isAuthenticated,
      signUpMutation.mutateAsync,
      signInMutation.mutateAsync,
      signOutMutation.mutateAsync,
      deleteAccountMutation.mutateAsync,
      updateProfileMutation.mutateAsync,
      signUpMutation.isPending,
      signInMutation.isPending,
      signOutMutation.isPending,
      deleteAccountMutation.isPending,
      updateProfileMutation.isPending,
      signUpMutation.error,
      signInMutation.error,
    ]
  );
});
