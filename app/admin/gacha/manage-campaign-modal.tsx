"use client";

import EditGachaPanel, { type EditGachaUpdatedData } from "./(mange_gacha)/edit-gacha-panel";
import CreateRewardPanel from "./(mange_gacha)/create-reward-panel";
import RewardSettingsPanel from "./(mange_gacha)/reward-settings-panel";

type ManageMenuKey = "edit" | "rewards" | "reward-settings";

type CampaignPreview = {
  id: string;
  title: string;
  description: string;
  imageUrl: string | null;
  spinPrice: {
    baht: string;
    formatted: string;
  };
  jackpotPercent: number;
  smallPrizePercent: number;
  profitPercent: number;
  status: string;
};

type ManageCampaignModalProps = {
  isOpen: boolean;
  campaign: CampaignPreview | null;
  activeMenu: ManageMenuKey;
  onChangeMenu: (menu: ManageMenuKey) => void;
  onCampaignUpdated?: (updated: EditGachaUpdatedData) => Promise<void> | void;
  onClose: () => void;
};

const menuItems: Array<{ key: ManageMenuKey; label: string }> = [
  { key: "edit", label: "แก้ไข้ gacha" },
  { key: "rewards", label: "รางวัล" },
  { key: "reward-settings", label: "ตังค่าการให้รางวัล" },
];

export default function ManageCampaignModal({
  isOpen,
  campaign,
  activeMenu,
  onChangeMenu,
  onCampaignUpdated,
  onClose,
}: ManageCampaignModalProps) {
  if (!isOpen || !campaign) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-80 flex items-center justify-center bg-black/65 p-4">
      <div className="flex h-[80vh] w-full max-w-5xl overflow-hidden rounded-2xl border border-white/15 bg-[#0b0b0b] shadow-2xl">
        <aside className="w-64 shrink-0 border-r border-white/10 bg-[#0a0a0a]">
          <div className="border-b border-white/10 px-4 py-4">
            <h2 className="text-base font-semibold text-white">จัดการแคมเปญ</h2>
            <p className="mt-1 line-clamp-2 text-xs text-white/55">{campaign.title}</p>
          </div>

          <nav className="p-3">
            <div className="space-y-1">
              {menuItems.map((item) => {
                const isActive = activeMenu === item.key;

                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => onChangeMenu(item.key)}
                    className={`w-full rounded-lg px-3 py-2 text-left text-sm transition ${
                      isActive
                        ? "bg-[#1b1b1b] text-white"
                        : "text-white/65 hover:bg-[#111111] hover:text-white"
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
          </nav>
        </aside>

        <section className="flex min-w-0 flex-1 flex-col">
          <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
            <div>
              <h3 className="text-sm font-semibold text-white">Campaign Panel</h3>
              <p className="mt-1 text-xs text-white/55">จัดการข้อมูลแคมเปญและ reward ภายใน modal เดียว</p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-white/20 px-3 py-1.5 text-sm font-medium text-white/80 transition hover:bg-white/10"
            >
              ปิด
            </button>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
            {activeMenu === "edit" ? (
              <EditGachaPanel campaign={campaign} onUpdated={onCampaignUpdated} />
            ) : activeMenu === "rewards" ? (
              <CreateRewardPanel campaignId={campaign.id} />
            ) : activeMenu === "reward-settings" ? (
              <RewardSettingsPanel campaignId={campaign.id} />
            ) : (
              <div className="mt-4 rounded-xl border border-dashed border-white/15 bg-white/3 p-4">
                <p className="text-sm text-white/70">
                  ตอนนี้เป็น mock ของเมนู: <span className="font-semibold text-white">{menuItems.find((item) => item.key === activeMenu)?.label}</span>
                </p>
                <p className="mt-2 text-sm text-white/55">
                  ภายหลังสามารถแยกเป็นไฟล์ เช่น rewards-panel.tsx และ reward-settings-panel.tsx แล้ว import มารวมที่ popup นี้ได้
                </p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}