"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Star, Pencil, Trash2, Plus, Check } from "lucide-react";

type SavedUid = {
    id: string;
    uid: string;
    label: string;
};

type UidSaveButtonProps = {
    uid: string;
    gameSlug: string;
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

function persistUids(storageKey: string, uids: SavedUid[]) {
    try {
        localStorage.setItem(storageKey, JSON.stringify(uids));
    } catch { /* storage error */ }
}

export function UidSaveButton({ uid, gameSlug }: UidSaveButtonProps) {
    const storageKey = `${STORAGE_PREFIX}${gameSlug}`;
    const [isOpen, setIsOpen] = useState(false);
    const [savedUids, setSavedUids] = useState<SavedUid[]>([]);
    const [showTooltip, setShowTooltip] = useState(false);
    const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editLabel, setEditLabel] = useState("");
    const [justSavedId, setJustSavedId] = useState<string | null>(null);

    const buttonRef = useRef<HTMLButtonElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const trimmedUid = uid.trim();

    const refresh = () => setSavedUids(loadSavedUids(storageKey));

    useEffect(() => { refresh(); }, [storageKey]);

    const isCurrentSaved = savedUids.some((s) => s.uid === trimmedUid);

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
                setEditingId(null);
            }
        }
        if (isOpen) document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isOpen]);

    // ---------- actions ----------
    const handleSave = () => {
        if (!trimmedUid) return;
        const existing = savedUids.find((s) => s.uid === trimmedUid);
        if (existing) return; // already saved
        const next: SavedUid[] = [
            ...savedUids,
            {
                id: Date.now().toString(),
                uid: trimmedUid,
                label: `UID ${savedUids.length + 1}`,
            },
        ];
        persistUids(storageKey, next);
        setSavedUids(next);
        setJustSavedId(next[next.length - 1].id);
        setTimeout(() => setJustSavedId(null), 1500);
    };

    const handleDelete = (id: string) => {
        const next = savedUids.filter((s) => s.id !== id);
        persistUids(storageKey, next);
        setSavedUids(next);
    };

    const handleEditStart = (item: SavedUid) => {
        setEditingId(item.id);
        setEditLabel(item.label);
    };

    const handleEditSave = (id: string) => {
        const next = savedUids.map((s) =>
            s.id === id ? { ...s, label: editLabel.trim() || s.label } : s
        );
        persistUids(storageKey, next);
        setSavedUids(next);
        setEditingId(null);
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
                    บันทึก UID — {gameSlug}
                </p>
            </div>

            {/* current uid row */}
            <div className="px-4 pt-3 pb-2">
                <p className="text-[11px] text-white/45 mb-1">UID ปัจจุบัน</p>
                <div className="flex items-center gap-2">
                    <div className="flex-1 rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white font-mono tracking-wide min-h-[36px] flex items-center overflow-hidden">
                        {trimmedUid ? (
                            <span className="truncate">{trimmedUid}</span>
                        ) : (
                            <span className="text-white/30 italic text-xs">ยังไม่ได้กรอก UID</span>
                        )}
                    </div>
                     <button
                        type="button"
                        disabled={!trimmedUid || isCurrentSaved}
                        onClick={handleSave}
                        className={` flex items-center p-1 rounded-lg text-xs font-bold text-white transition ${isCurrentSaved ? "bg-white/15 cursor-not-allowed" : "bg-[#e01230] hover:bg-[#c90f2a] disabled:opacity-40 disabled:cursor-not-allowed"}`}
                    >
                        <Plus size={13} />
                        {isCurrentSaved ? "บันทึกแล้ว" : "บันทึก"}
                    </button>
                </div>
            </div>

            {/* saved list */}
            {savedUids.length > 0 && (
                <div className="px-4 pb-3 space-y-1.5 max-h-52 overflow-y-auto">
                    <p className="text-[11px] text-white/50 mb-1.5 mt-1">UID ที่บันทึกไว้ ({savedUids.length})</p>
                    {savedUids.map((item) => (
                        <div
                            key={item.id}
                            className={[
                                "rounded-lg border px-3 py-2 transition",
                                item.uid === trimmedUid
                                    ? "border-[#e01230]/50 bg-[#e01230]/10"
                                    : "border-white/10 bg-white/3",
                                justSavedId === item.id ? "ring-1 ring-green-400/40" : "",
                            ].join(" ")}
                        >
                            {editingId === item.id ? (
                                <div className="flex items-center gap-1.5">
                                    <input
                                        autoFocus
                                        value={editLabel}
                                        onChange={(e) => setEditLabel(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") handleEditSave(item.id);
                                            if (e.key === "Escape") setEditingId(null);
                                        }}
                                        className="flex-1 bg-transparent text-xs text-white outline-none border-b border-white/30 pb-0.5"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => handleEditSave(item.id)}
                                        className="text-green-400 hover:text-green-300"
                                    >
                                        <Check size={13} />
                                    </button>
                                </div>
                            ) : (
                                <div className="flex items-center justify-between gap-2">
                                    <div className="overflow-hidden">
                                        <p className="text-[11px] text-white/40 leading-none mb-0.5">{item.label}</p>
                                        <p className="text-sm font-mono text-white font-semibold tracking-wide truncate">
                                            {item.uid}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-1 flex-shrink-0">
                                        {justSavedId === item.id && (
                                            <Check size={13} className="text-green-400" />
                                        )}
                                    
                                        <button
                                            type="button"
                                            onClick={() => handleDelete(item.id)}
                                            className="text-white hover:text-red-400 transition p-0.5"
                                            title="ลบ"
                                        >
                                            <Trash2 size={12} />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {savedUids.length === 0 && (
                <div className="px-4 pb-4 pt-1 text-center text-white text-xs">
                    ยังไม่มี UID ที่บันทึก
                </div>
            )}
        </div>
    ) : null;

    return (
        <div className="relative ml-1">
            {showTooltip && !isOpen && (
                <div
                    className="absolute left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-black border border-white/15 px-2.5 py-1 text-[11px] text-white/80 shadow-lg z-50 pointer-events-none"
                    style={{ top: -23 }}
                >
                    {isCurrentSaved ? "UID บันทึกแล้ว" : "บันทึก UID"}
                    <span className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-[#1e1e2e]" />
                </div>
            )}

            <button
                ref={buttonRef}
                type="button"
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
                onClick={() => { setShowTooltip(false); setIsOpen((prev) => !prev); }}
                className="flex h-11 w-10 items-center justify-center rounded-xl border border-l-0 border-white/20 bg-white/5 transition hover:bg-white/10"
                aria-label="บันทึก UID"
            >
                {isCurrentSaved ? (
                    <Star size={18} className="fill-yellow-400 text-yellow-400" />
                ) : (
                    <Star size={18} className="text-white hover:text-yellow-300 transition" />
                )}
           
            </button>

            {typeof document !== "undefined" && createPortal(dropdown, document.body)}
        </div>
    );
}