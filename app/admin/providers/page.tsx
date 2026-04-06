"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { toApiUrl } from "@/lib/api-url";
import CreateProviderModal, { type CreateProviderPayload } from "./create-provider-modal";

type ProviderItem = {
  id: string;
  slug: string;
  displayName: string;
  baseUrl: string;
  isActive: boolean;
  callbackIps: string[];
  createdAt: string;
  updatedAt: string;
};

type ProvidersResponse = {
  ok: boolean;
  items: ProviderItem[];
};

type ProviderConnectionState = {
  status: "connected" | "disconnected" | "error";
  ok: boolean;
  balance: number | null;
  message: string;
};

type ProviderConnectionMap = Record<string, ProviderConnectionState>;

type ProviderTestResponse = {
  ok: boolean;
  balance?: number;
  message?: string;
};

const defaultConnectionState: ProviderConnectionState = {
  status: "error",
  ok: false,
  balance: null,
  message: "ยังไม่ได้ทดสอบ",
};

export default function AdminProvidersPage() {
  const [providers, setProviders] = useState<ProviderItem[]>([]);
  const [connections, setConnections] = useState<ProviderConnectionMap>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const testProviderConnection = useCallback(
    async (providerId: string): Promise<ProviderConnectionState> => {
      try {
        const response = await fetch(toApiUrl(`/api/admin/providers/${providerId}/test`), {
          method: "POST",
          credentials: "include",
          cache: "no-store",
        });

        if (!response.ok) {
          return {
            status: "error",
            ok: false,
            balance: null,
            message: "ทดสอบการเชื่อมต่อไม่สำเร็จ",
          };
        }

        const json = (await response.json()) as ProviderTestResponse;

        if (!json.ok) {
          return {
            status: "disconnected",
            ok: false,
            balance: null,
            message: json.message ?? "ไม่สามารถเชื่อมต่อได้",
          };
        }

        return {
          status: "connected",
          ok: true,
          balance: typeof json.balance === "number" ? json.balance : null,
          message: "เชื่อมต่อสำเร็จ",
        };
      } catch {
        return {
          status: "error",
          ok: false,
          balance: null,
          message: "เกิดข้อผิดพลาดระหว่างเชื่อมต่อ",
        };
      }
    },
    [],
  );

  const fetchProvidersWithConnection = useCallback(async () => {
    setError(null);

    try {
      const providersResponse = await fetch(toApiUrl("/api/admin/providers"), {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });

      if (providersResponse.status === 401 || providersResponse.status === 403) {
        throw new Error("ไม่มีสิทธิ์เข้าถึงข้อมูลผู้ให้บริการ");
      }

      if (!providersResponse.ok) {
        throw new Error("โหลดรายการผู้ให้บริการไม่สำเร็จ");
      }

      const providersJson = (await providersResponse.json()) as ProvidersResponse;

      if (!providersJson.ok || !Array.isArray(providersJson.items)) {
        throw new Error("ข้อมูลผู้ให้บริการไม่ถูกต้อง");
      }

      const nextProviders = providersJson.items;
      setProviders(nextProviders);

      if (nextProviders.length === 0) {
        setConnections({});
        return;
      }

      const tests = await Promise.all(
        nextProviders.map(async (provider) => {
          const connection = await testProviderConnection(provider.id);
          return [provider.id, connection] as const;
        }),
      );

      const connectionMap = tests.reduce<ProviderConnectionMap>((acc, [id, state]) => {
        acc[id] = state;
        return acc;
      }, {});

      setConnections(connectionMap);
    } catch (fetchError) {
      setProviders([]);
      setConnections({});
      setError(
        fetchError instanceof Error ? fetchError.message : "เกิดข้อผิดพลาดขณะโหลดข้อมูล provider",
      );
    }
  }, [testProviderConnection]);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      setIsLoading(true);
      await fetchProvidersWithConnection();
      if (!cancelled) {
        setIsLoading(false);
      }
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [fetchProvidersWithConnection]);

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await fetchProvidersWithConnection();
    setIsRefreshing(false);
  }, [fetchProvidersWithConnection]);

  const onOpenCreateModal = useCallback(() => {
    setIsCreateModalOpen(true);
  }, []);

  const onCloseCreateModal = useCallback(() => {
    if (isCreating) {
      return;
    }

    setIsCreateModalOpen(false);
  }, [isCreating]);

  const onCreateProvider = useCallback(
    async (payload: CreateProviderPayload) => {
      if (!payload.slug || !payload.displayName || !payload.baseUrl || !payload.username || !payload.password) {
        toast.error("กรุณากรอกข้อมูลที่จำเป็นให้ครบ");
        return;
      }

      setIsCreating(true);
      try {
        const response = await fetch(toApiUrl("/api/admin/providers"), {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        if (response.status === 401 || response.status === 403) {
          throw new Error("ไม่มีสิทธิ์สร้าง provider");
        }

        if (!response.ok) {
          let message = "สร้าง provider ไม่สำเร็จ";
          try {
            const json = (await response.json()) as { message?: string };
            if (typeof json.message === "string" && json.message.trim()) {
              message = json.message;
            }
          } catch {
            // Ignore JSON parse errors and fallback to default message
          }

          throw new Error(message);
        }

        toast.success("สร้าง provider สำเร็จ");
        setIsCreateModalOpen(false);
        await fetchProvidersWithConnection();
      } catch (createError) {
        toast.error(createError instanceof Error ? createError.message : "สร้าง provider ไม่สำเร็จ");
      } finally {
        setIsCreating(false);
      }
    },
    [fetchProvidersWithConnection],
  );

  const summary = useMemo(() => {
    const connectedCount = Object.values(connections).filter((item) => item.status === "connected").length;
    return {
      total: providers.length,
      connected: connectedCount,
      disconnected: Math.max(providers.length - connectedCount, 0),
    };
  }, [connections, providers.length]);

  return (
    <main className="min-h-screen bg-[#000000] px-4 py-8 text-white md:px-8">
      <div className="mx-auto w-full max-w-6xl">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold md:text-3xl">Provider Connections</h1>
            <p className="mt-1 text-sm text-gray-400">
              หน้าเปิดมาจะเช็กทั้งรายการ provider และทดสอบการเชื่อมต่อของแต่ละ provider อัตโนมัติ
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={onOpenCreateModal}
              disabled={isLoading || isCreating}
              className="rounded-lg border border-[#35552a] bg-[#1f2b18] px-4 py-2 text-sm font-semibold text-[#9ee37d] transition-colors hover:bg-[#2a3a23] disabled:cursor-not-allowed disabled:opacity-60"
            >
              + เพิ่ม Provider
            </button>

            <button
              type="button"
              onClick={onRefresh}
              disabled={isRefreshing || isLoading || isCreating}
              className="rounded-lg border border-[#2f4c77] bg-[#1a1f2b] px-4 py-2 text-sm font-semibold text-[#8dc3ff] transition-colors hover:bg-[#20293a] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isRefreshing ? "กำลังทดสอบใหม่..." : "ทดสอบการเชื่อมต่ออีกครั้ง"}
            </button>
          </div>
        </div>

        <div className="mb-6 grid gap-3 md:grid-cols-3">
          <div className="rounded-xl border border-[#1f2937] bg-[#0b0f14] p-4">
            <p className="text-xs uppercase tracking-wide text-gray-400">ทั้งหมด</p>
            <p className="mt-2 text-2xl font-bold">{summary.total}</p>
          </div>
          <div className="rounded-xl border border-[#285336] bg-[#13261a] p-4">
            <p className="text-xs uppercase tracking-wide text-[#8de3ab]">เชื่อมต่อสำเร็จ</p>
            <p className="mt-2 text-2xl font-bold text-[#8de3ab]">{summary.connected}</p>
          </div>
          <div className="rounded-xl border border-[#7a2a34] bg-[#2b1418] p-4">
            <p className="text-xs uppercase tracking-wide text-[#ff9ca8]">ยังไม่เชื่อมต่อ</p>
            <p className="mt-2 text-2xl font-bold text-[#ff9ca8]">{summary.disconnected}</p>
          </div>
        </div>

        {isLoading ? (
          <div className="rounded-xl border border-[#222222] bg-[#0a0a0a] p-6 text-gray-300">
            กำลังโหลด providers และทดสอบการเชื่อมต่อ...
          </div>
        ) : error ? (
          <div className="rounded-xl border border-[#7a2a34] bg-[#2b1418] p-6 text-[#ff9ca8]">{error}</div>
        ) : providers.length === 0 ? (
          <div className="rounded-xl border border-[#222222] bg-[#0a0a0a] p-6 text-gray-300">ไม่พบ provider</div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-[#222222] bg-[#0a0a0a]">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-[#1a1a1a]">
                <thead className="bg-[#0f0f0f]">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">
                      Display Name
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">
                      Slug
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">
                      Base URL
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">
                      สถานะเชื่อมต่อ
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">
                      Balance
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1a1a1a]">
                  {providers.map((provider) => {
                    const state = connections[provider.id] ?? defaultConnectionState;
                    const statusClass =
                      state.status === "connected"
                        ? "border-[#285336] bg-[#13261a] text-[#8de3ab]"
                        : "border-[#7a2a34] bg-[#2b1418] text-[#ff9ca8]";

                    return (
                      <tr key={provider.id} className="hover:bg-[#111111]">
                        <td className="px-4 py-3 text-sm font-semibold text-white">{provider.displayName}</td>
                        <td className="px-4 py-3 text-sm text-gray-300">{provider.slug}</td>
                        <td className="px-4 py-3 text-sm text-gray-300">{provider.baseUrl}</td>
                        <td className="px-4 py-3 text-sm">
                          <div className="flex flex-col gap-1">
                            <span className={`inline-flex w-fit rounded-full border px-2 py-1 text-xs font-semibold ${statusClass}`}>
                              {state.status === "connected" ? "เชื่อมต่อแล้ว" : "ไม่เชื่อมต่อ"}
                            </span>
                            <span className="text-xs text-gray-500">{state.message}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-200">
                          {typeof state.balance === "number" ? state.balance.toFixed(2) : "-"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <CreateProviderModal
        isOpen={isCreateModalOpen}
        isSubmitting={isCreating}
        onClose={onCloseCreateModal}
        onSubmit={onCreateProvider}
      />
    </main>
  );
}