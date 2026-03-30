"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { toApiUrl } from "@/lib/api-url";

type WalletApiResponse = {
  ok?: boolean;
  wallet?: {
    balance?: {
      cents?: number;
      baht?: string;
      formatted?: string;
    };
  };
};

type PointsApiResponse = {
  ok?: boolean;
  points?: {
    balance?: {
      points?: number;
    };
  };
};

type WalletContextValue = {
  walletCents: number;
  walletBaht: string;
  points: number;
  isLoading: boolean;
  error: string | null;
  refreshBalances: () => Promise<void>;
  setWalletCents: (cents: number) => void;
  setPoints: (points: number) => void;
  clearBalances: () => void;
};

const WalletContext = createContext<WalletContextValue | undefined>(undefined);

function centsToBahtString(cents: number) {
  return (Math.max(0, cents) / 100).toFixed(2);
}

type WalletProviderProps = {
  children: ReactNode;
};

export function WalletProvider({ children }: WalletProviderProps) {
  const [walletCents, setWalletCentsState] = useState(0);
  const [points, setPointsState] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearBalances = useCallback(() => {
    setWalletCentsState(0);
    setPointsState(0);
    setError(null);
  }, []);

  const setWalletCents = useCallback((cents: number) => {
    setWalletCentsState(Math.max(0, Math.trunc(cents)));
  }, []);

  const setPoints = useCallback((nextPoints: number) => {
    setPointsState(Math.max(0, Math.trunc(nextPoints)));
  }, []);

  const refreshBalances = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [walletResponse, pointsResponse] = await Promise.all([
        fetch(toApiUrl("/api/wallet"), {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        }),
        fetch(toApiUrl("/api/points"), {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        }),
      ]);

      const unauthorized =
        walletResponse.status === 401 || pointsResponse.status === 401;

      if (unauthorized) {
        clearBalances();
        return;
      }

      if (!walletResponse.ok || !pointsResponse.ok) {
        throw new Error("ไม่สามารถโหลดข้อมูลกระเป๋าเงินได้");
      }

      const walletJson = (await walletResponse.json()) as WalletApiResponse;
      const pointsJson = (await pointsResponse.json()) as PointsApiResponse;
      const nextWalletCents = walletJson.wallet?.balance?.cents;
      const nextPoints = pointsJson.points?.balance?.points;

      if (typeof nextWalletCents === "number") {
        setWalletCentsState(Math.max(0, Math.trunc(nextWalletCents)));
      }

      if (typeof nextPoints === "number") {
        setPointsState(Math.max(0, Math.trunc(nextPoints)));
      }
    } catch (unknownError) {
      clearBalances();
      const nextError =
        unknownError instanceof Error
          ? unknownError.message
          : "เกิดข้อผิดพลาดในการโหลดข้อมูลกระเป๋าเงิน";
      setError(nextError);
    } finally {
      setIsLoading(false);
    }
  }, [clearBalances]);

  const value = useMemo<WalletContextValue>(
    () => ({
      walletCents,
      walletBaht: centsToBahtString(walletCents),
      points,
      isLoading,
      error,
      refreshBalances,
      setWalletCents,
      setPoints,
      clearBalances,
    }),
    [
      walletCents,
      points,
      isLoading,
      error,
      refreshBalances,
      setWalletCents,
      setPoints,
      clearBalances,
    ],
  );

  return (
    <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
  );
}

export function useWalletContext() {
  const context = useContext(WalletContext);

  if (!context) {
    throw new Error("useWalletContext must be used within WalletProvider");
  }

  return context;
}
