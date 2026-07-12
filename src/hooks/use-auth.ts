import { api } from "@/convex/_generated/api";
import { useAuth as useClerkAuth, useUser } from "@clerk/clerk-react";
import { useConvexAuth, useQuery, useMutation } from "convex/react";
import { useEffect } from "react";

export function useAuth() {
  const { isLoading: isAuthLoading, isAuthenticated } = useConvexAuth();
  const { signOut } = useClerkAuth();
  const { user: clerkUser } = useUser();
  const user = useQuery(api.users.currentUser);
  const storeUser = useMutation(api.users.storeUser);

  // Derive isLoading directly from the dependencies instead of managing separate state
  const isLoading = isAuthLoading || user === undefined;

  // Get the real email from Clerk's frontend SDK (always available here,
  // unlike the Convex JWT which may omit the email claim).
  const clerkEmail = clerkUser?.primaryEmailAddress?.emailAddress;

  useEffect(() => {
    if (isAuthenticated) {
      storeUser({ clerkEmail: clerkEmail || undefined });
    }
  }, [isAuthenticated, storeUser, clerkEmail]);

  return {
    isLoading,
    isAuthenticated,
    user,
    signIn: () => {
      window.location.href = "/auth";
    },
    signOut,
  };
}
