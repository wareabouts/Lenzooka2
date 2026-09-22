import { create } from "zustand";
import { lensSchema, type Lens, type Pose } from "./schema";
export const exhibit =
  import.meta.env.PROD ||
  new URLSearchParams(location.search).get("mode") === "exhibit";
export const asset = (p: string) => import.meta.env.BASE_URL + p;
let timer: ReturnType<typeof setTimeout>;
let saving = false;
let revision = 0;
interface State {
  data: Lens | null;
  error: string;
  saveState: string;
  selected: string;
  edit: boolean;
  lines: boolean;
  mode: "translate" | "rotate" | "scale";
  axis: string;
  snap: boolean;
  past: Lens[];
  future: Lens[];
  focus: { position: number[]; target: number[]; stamp: number } | null;
  camera: { position: number[]; target: number[] };
  highlight: string[];
  mutate: (fn: (d: Lens) => void) => void;
  load: () => Promise<void>;
  undo: () => void;
  redo: () => void;
  select: (id: string, fly?: boolean) => void;
  set: (s: Partial<State>) => void;
  save: () => Promise<void>;
}
export const useStore = create<State>((set, get) => ({
  data: null,
  error: "",
  saveState: "Loading",
  selected: "B7",
  edit: false,
  lines: true,
  mode: "translate",
  axis: "",
  snap: false,
  past: [],
  future: [],
  focus: null,
  camera: { position: [-550, 370, 900], target: [0, 0, 260] },
  highlight: [],
  set,
  load: async () => {
    if (saving) {
      set({
        error:
          "A disk save is still finishing. Wait for Saved, then reload JSON.",
      });
      return;
    }
    clearTimeout(timer);
    try {
      const r = await fetch(asset("data/lens.json") + "?t=" + Date.now());
      if (!r.ok) throw Error("Could not read data/lens.json");
      const data = lensSchema.parse(await r.json());
      set({ data, error: "", saveState: "Saved", past: [], future: [] });
    } catch (e) {
      set({ error: String(e), saveState: "Load failed" });
    }
  },
  mutate: (fn) => {
    if (exhibit || !get().data) return;
    const old = get().data!;
    const d = structuredClone(old);
    try {
      fn(d);
      d.meta.updated = new Date().toISOString();
      lensSchema.parse(d);
      revision++;
      set({
        data: d,
        past: [...get().past, old].slice(-75),
        future: [],
        saveState: "Unsaved",
        error: "",
      });
      try {
        localStorage.setItem("lenzooka2-recovery", JSON.stringify(d));
      } catch {
        set({
          error:
            "Browser backup is full. Download a JSON backup; disk saving is still available.",
        });
      }
      clearTimeout(timer);
      timer = setTimeout(() => get().save(), 500);
    } catch (e) {
      set({ error: String(e) });
    }
  },
  save: async () => {
    if (exhibit || saving || !get().data) return;
    saving = true;
    const rev = revision;
    set({ saveState: "Saving" });
    try {
      const r = await fetch("/api/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(get().data),
      });
      if (!r.ok) throw Error((await r.json()).error || "Disk save failed");
      set({ saveState: rev === revision ? "Saved" : "Unsaved" });
      if (rev === revision) {
        try {
          localStorage.removeItem("lenzooka2-recovery");
        } catch {}
      }
    } catch (e) {
      set({
        saveState: "Save failed",
        error: `Your changes are still in this browser. Retry saving or download a backup. ${String(e)}`,
      });
    } finally {
      saving = false;
      if (rev !== revision) timer = setTimeout(() => get().save(), 500);
    }
  },
  undo: () => {
    const s = get();
    if (exhibit || !s.past.length) return;
    const d = s.past.at(-1)!;
    set({
      data: d,
      past: s.past.slice(0, -1),
      future: [s.data!, ...s.future],
      saveState: "Unsaved",
    });
    revision++;
    try {
      localStorage.setItem("lenzooka2-recovery", JSON.stringify(d));
    } catch {
      set({
        error:
          "Browser recovery storage is full. Download a JSON backup while disk saving finishes.",
      });
    }
    clearTimeout(timer);
    timer = setTimeout(() => get().save(), 500);
  },
  redo: () => {
    const s = get();
    if (exhibit || !s.future.length) return;
    const d = s.future[0];
    set({
      data: d,
      past: [...s.past, s.data!],
      future: s.future.slice(1),
      saveState: "Unsaved",
    });
    revision++;
    try {
      localStorage.setItem("lenzooka2-recovery", JSON.stringify(d));
    } catch {
      set({
        error:
          "Browser recovery storage is full. Download a JSON backup while disk saving finishes.",
      });
    }
    clearTimeout(timer);
    timer = setTimeout(() => get().save(), 500);
  },
  select: (id, fly = false) => {
    const d = get().data;
    const p =
      d?.pins.find((x) => x.id === id) ||
      d?.components.find(
        (x) => x.id === id || x.pins?.some((p) => p.id === id),
      );
    const obj = [...(d?.objects || []), ...(d?.compartments || [])].find(
      (x) => x.id === (p?.object || id),
    );
    set({ selected: p?.object || id, highlight: [] });
    if (fly && obj) {
      const [x, y, z] = obj.pose.position;
      set({
        focus: {
          position: [x + 160, y + 100, z + 300],
          target: [x, y, z],
          stamp: Date.now(),
        },
      });
    }
  },
}));
export function updatePose(id: string, pose: Pose) {
  useStore.getState().mutate((d) => {
    const x = [...d.objects, ...d.compartments].find((x) => x.id === id);
    if (x) x.pose = pose;
  });
}
export function backup() {
  const d = useStore.getState().data;
  if (!d) return;
  const a = document.createElement("a");
  a.href = URL.createObjectURL(
    new Blob([JSON.stringify(d, null, 2)], { type: "application/json" }),
  );
  a.download = "lenzooka2-backup.json";
  a.click();
  URL.revokeObjectURL(a.href);
}
