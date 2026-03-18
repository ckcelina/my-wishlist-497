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
    }: {
      email: string;
      password: string;
      fullName: string;
    }) => {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName },
        },
      });

      if (error) throw error;
      console.log("Sign up successful:", data.user?.id);
      return data;
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
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      console.log("Sign in successful:", data.user?.id);
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
      updateProfile: updateProfileMutation.mutateAsync,
      isSigningUp: signUpMutation.isPending,
      isSigningIn: signInMutation.isPending,
      isSigningOut: signOutMutation.isPending,
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
      updateProfileMutation.mutateAsync,
      signUpMutation.isPending,
      signInMutation.isPending,
      signOutMutation.isPending,
      updateProfileMutation.isPending,
      signUpMutation.error,
      signInMutation.error,
    ]
  );
});
