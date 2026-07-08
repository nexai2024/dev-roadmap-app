import { api } from "@/convex/_generated/api";
import { useAuth as useClerkAuth } from "@clerk/clerk-react";
import { useConvexAuth, useQuery, useMutation } from "convex/react";
import { useEffect } from "react";

export function useAuth() {
  const { isLoading: isAuthLoading, isAuthenticated } = useConvexAuth();
  const { signOut } = useClerkAuth();
  const user = useQuery(api.users.currentUser);
  const storeUser = useMutation(api.users.storeUser);

  // Derive isLoading directly from the dependencies instead of managing separate state
  const isLoading = isAuthLoading || user === undefined;

  useEffect(() => {
    if (isAuthenticated) {
      storeUser();
    }
  }, [isAuthenticated, storeUser]);

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
