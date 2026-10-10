import { useMemo } from "react";
import { useAuth } from "../auth/useAuth";

export type UseBranchRestrictionResult = {
  isRestricted: boolean;
  restrictedBranchId: string | null;
  userBranchName: string | null;
};

export default function useBranchRestriction(): UseBranchRestrictionResult {
  const { user } = useAuth();

  return useMemo(() => {
    const isRestricted = user?.role === "branch_manager" || user?.role === "secretary" || user?.role === "officer";
    const userBranchName = user?.branch || null;
    
    let restrictedBranchId: string | null = null;
    if (isRestricted && userBranchName) {
      // We return the branch name; pages should resolve to ID via supabase
      // or pass the name to fetch functions that handle it
      restrictedBranchId = userBranchName;
    }

    return {
      isRestricted,
      restrictedBranchId,
      userBranchName,
    };
  }, [user?.role, user?.branch]);
}
