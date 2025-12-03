import { useCallback, useState } from "react";
import { useSupabase } from "./useSupabase";

export interface WalletInfo {
  user_id: string;
  balance_cents: number;
  currency?: string;
}

export const useWallet = () => {
  const { supabase } = useSupabase();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getWallet = useCallback(async (): Promise<WalletInfo | null> => {
    if (!supabase) return null;
    try {
      setIsLoading(true);
      setError(null);
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return null;
      const { data, error } = await supabase
        .from("wallets")
        .select("user_id,balance_cents,currency")
        .eq("user_id", user.id)
        .single();
      if (error) throw error;
      return data as WalletInfo;
    } catch (e: any) {
      setError(e?.message || "Failed to load wallet");
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [supabase]);

  const isSeriesUnlocked = useCallback(
    async (seriesId: string): Promise<boolean> => {
      if (!supabase || !seriesId) return false;
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return false;
        const { data, error } = await supabase
          .from("series_unlocks")
          .select("series_id")
          .eq("user_id", user.id)
          .eq("series_id", seriesId)
          .maybeSingle();
        if (error) return false;
        return !!data;
      } catch {
        return false;
      }
    },
    [supabase],
  );

  const purchaseSeriesUnlock = useCallback(
    async (seriesId: string, priceCents = 4999) => {
      if (!supabase) throw new Error("Supabase not available");
      const { data, error } = await supabase.rpc("purchase_series_unlock", {
        p_series_id: seriesId,
        p_price_cents: priceCents,
      });
      if (error) throw error;
      // Supabase returns array rows for set-returning functions
      const row = Array.isArray(data) ? data[0] : data;
      return row as { new_balance_cents: number; unlocked: boolean } | null;
    },
    [supabase],
  );

  return {
    getWallet,
    isSeriesUnlocked,
    purchaseSeriesUnlock,
    isLoading,
    error,
    clearError: () => setError(null),
  };
};








