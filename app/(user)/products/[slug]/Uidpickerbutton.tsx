"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { SquareUser } from "lucide-react";

type SavedUid = {
    id: string;
    uid: string;
    label: string;
};

type UidPickerButtonProps = {
    gameSlug: string;
    onSelect: (uid: string) => void;
};

const STORAGE_PREFIX = "uid_save_v2_";

function loadSavedUids(storageKey: string): SavedUid[] {
    try {
        const raw = localStorage.getItem(storageKey);
        if (!raw) return [];
        return JSON.parse(raw) as SavedUid[];
    } catch {
        return [];
    }
}

export function UidPickerButton({ gameSlug, onSelect }: UidPickerButtonProps) {
    const storageKey = `${STORAGE_PREFIX}${gameSlug}`;
    const [isOpen, setIsOpen] = useState(false);
    const [savedUids, setSavedUids] = useState<SavedUid[]>([]);
    const [showTooltip, setShowTooltip] = useState(false);
    const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});

    const buttonRef = useRef<HTMLButtonElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const refresh = () => setSavedUids(loadSavedUids(storageKey));

    useEffect(() => { refresh(); }, [storageKey]);

    // ---------- position ----------
    const calcPos = () => {
        if (buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            setDropdownStyle({
                position: "fixed",
                top: rect.bottom + 8,
                right: window.innerWidth - rect.right,
            });
        }
    };

    useEffect(() => { if (isOpen) { refresh(); calcPos(); } }, [isOpen]);

    useEffect(() => {
        if (!isOpen) return;
        window.addEventListener("scroll", calcPos, true);
        return () => window.removeEventListener("scroll", calcPos, true);
    }, [isOpen]);

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            const target = e.target as Node;
            if (
                dropdownRef.current && !dropdownRef.current.contains(target) &&
                buttonRef.current && !buttonRef.current.contains(target)
            ) {
                setIsOpen(false);
            }
        }
        if (isOpen) document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isOpen]);

    const handleSelect = (uid: string) => {
        onSelect(uid);
        setIsOpen(false);
    };

    // ---------- render ----------
    const dropdown = isOpen ? (
        <div
            ref={dropdownRef}
            style={{ ...dropdownStyle, zIndex: 9999, width: 280 }}
            className="rounded-xl border border-white/15 bg-black shadow-2xl overflow-hidden"
        >
            <div className="border-b border-white/10 px-4 py-3">
                <p className="text-xs font-semibold text-white/60 uppercase tracking-wider">
                    UID ที่บันทึกไว้ — {gameSlug}
                </p>
            </div>

            <div className="px-4 py-3">
                {savedUids.length > 0 ? (
                    <div className="space-y-1.5 max-h-60 overflow-y-auto">
                        <p className="text-[11px] text-white/50 mb-2">กดเพื่อใส่ UID ลงในช่องกรอก</p>
                        {savedUids.map((item) => (
                            <button
                                key={item.id}
                                type="button"
                                onClick={() => handleSelect(item.uid)}
                                className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2.5 text-left transition hover:border-[#ff334b]/60 hover:bg-[#ff334b]/10 group"
                            >
                                <p className="text-[11px] text-white/40 mb-0.5 group-hover:text-white/60 transition">
                                    {item.label}
                                </p>
                                <p className="text-sm font-mono text-white font-semibold tracking-wide group-hover:text-[#ff7080] transition truncate">
                                    {item.uid}
                                </p>
                            </button>
                        ))}
                    </div>
                ) : (
                    <div className="py-4 text-center">
                        <SquareUser size={28} className="mx-auto mb-2 text-white/50" />
                        <p className="text-sm text-white/50">ยังไม่มี UID ที่บันทึก</p>
                        <p className="text-xs text-white/50 mt-1">กดไอคอนดาวเพื่อบันทึก UID</p>
                    </div>
                )}
            </div>
        </div>
    ) : null;

    return (
        <div className="relative ml-0.5">
            {showTooltip && !isOpen && (
                <div
                style={{ top: -23 , left: '-2.25rem' }} className="absolute bg-black  -translate-x-1/2 whitespace-nowrap rounded-md  border border-white/15 px-2.5 py-1 text-[11px] text-white/80 shadow-lg z-50 pointer-events-none">
                    เลือกUIDที่บันทึกไว้
                    <span className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-[#1e1e2e]" />
                </div>
            )}

            <button
                ref={buttonRef}
                type="button"
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
                onClick={() => { setShowTooltip(false); setIsOpen((prev) => !prev); }}
                className={[
                    "flex h-11 w-10 items-center justify-center rounded-xl border border-l-0 border-white/20 bg-white/5 transition hover:bg-white/10",
                    savedUids.length > 0 ? "text-[#ff334b]" : "text-white",
                ].join(" ")}
                aria-label="เลือก UID ที่บันทึก"
            >
                <SquareUser size={18} />
               
            </button>

            {typeof document !== "undefined" && createPortal(dropdown, document.body)}
        </div>
    );
}