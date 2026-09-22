import { useEffect, useState, useRef } from "react";
import {
  Box,
  Search,
  SlidersHorizontal,
  Undo2,
  Redo2,
  Download,
  RotateCcw,
  Save,
  Check,
  AlertTriangle,
  Camera,
  ChevronRight,
  Network,
  Activity,
  MessageSquare,
  Focus,
  Move,
  Rotate3D,
  Scaling,
  Plus,
  Trash2,
  Copy,
  X,
  ArrowRight,
  Link2,
  Unplug,
  BookOpen,
  Keyboard,
  Eye,
  Layers,
  CheckCircle2,
  Upload,
} from "lucide-react";
import { Scene, colors, netColor } from "./Scene";
import { SceneBoundary } from "./SceneBoundary";
import { Face, uploadPhoto } from "./Face";
import { useStore, exhibit, backup, asset } from "./store";
import { deriveNets } from "./nets";
import { lensSchema, type Obj, type Measurement } from "./schema";
const wireColors = ["WH", "YE", "RD", "BN", "OG", "BU", "BK", "GN", "VT", "GY"];
const wireHex = [
  "#fff",
  "#e5c55b",
  "#be5550",
  "#8b6250",
  "#d48b45",
  "#577ead",
  "#37433e",
  "#61956b",
  "#9874ac",
  "#9da49f",
];
const Badge = ({ status }: { status: string }) => (
  <span className={"badge " + status.toLowerCase()}>
    <i />
    {status}
  </span>
);
function Field({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string | number;
  onChange: (s: string) => void;
  type?: string;
}) {
  return (
    <label className="field">
      {label}
      <input
        type={type}
        key={String(value)}
        defaultValue={value}
        onBlur={(e) => {
          if (e.target.value !== String(value)) onChange(e.target.value);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") e.currentTarget.blur();
        }}
      />
    </label>
  );
}
export function App() {
  const s = useStore(),
    d = s.data;
  const [tab, setTab] = useState("inspect"),
    [search, setSearch] = useState(""),
    [a, setA] = useState(""),
    [b, setB] = useState(""),
    [sticky, setSticky] = useState(false),
    [result, setResult] = useState<"beep" | "open">("beep"),
    [type, setType] = useState<Measurement["type"]>("continuity"),
    [value, setValue] = useState(""),
    [wire, setWire] = useState(""),
    [route, setRoute] = useState(""),
    [photoRef, setPhotoRef] = useState(""),
    [flash, setFlash] = useState<string[]>([]),
    [lightbox, setLightbox] = useState(""),
    [help, setHelp] = useState(false),
    [modal, setModal] = useState<any>(null),
    [answer, setAnswer] = useState(""),
    [activeRequest, setActiveRequest] = useState(""),
    [tourIndex, setTourIndex] = useState(0),
    [recovery, setRecovery] = useState<string | null>(null),
    [logEdit, setLogEdit] = useState("");
  const searchRef = useRef<HTMLInputElement>(null),
    valueRef = useRef<HTMLInputElement>(null),
    held = useRef<"beep" | "open" | null>(null),
    lastDrop = useRef("");
  useEffect(() => {
    s.load();
    if (!exhibit) setRecovery(localStorage.getItem("lenzooka2-recovery"));
  }, []);
  const objects = d?.objects || [],
    selected = [...objects, ...(d?.compartments || [])].find(
      (o) => o.id === s.selected,
    ),
    obj = objects.find((o) => o.id === s.selected);
  const matches =
    search && d
      ? [...d.objects, ...d.compartments, ...d.pins, ...d.components]
          .filter((x) =>
            (x.id + " " + x.label).toLowerCase().includes(search.toLowerCase()),
          )
          .slice(0, 12)
      : [];
  const tours = d?.viewRequests.filter((x) => x.tour) || [];
  function mutateObj(key: string, v: unknown) {
    s.mutate((data) => {
      const o = [...data.objects, ...data.compartments].find(
        (x) => x.id === s.selected,
      );
      if (o) (o as any)[key] = v;
    });
  }
  function focusRequest(id: string) {
    const req = d?.viewRequests.find((x) => x.id === id);
    if (!req) return;
    setActiveRequest(id);
    setAnswer(req.answer || "");
    s.set({
      focus: { ...req.camera, stamp: Date.now() },
      highlight: req.highlight,
    });
  }
  function log(
    endA = a,
    endB = b,
    res: Measurement["result"] = type === "continuity" ? result : Number(value),
    readingType: Measurement["type"] = typeof res === "string"
      ? "continuity"
      : type,
  ) {
    if (!endA || !endB || endA === endB) return;
    if (
      readingType !== "continuity" &&
      (value.trim() === "" ||
        !Number.isFinite(Number(value)) ||
        Number(value) < 0)
    ) {
      s.set({
        error: "Enter a non-negative meter reading before recording this pair.",
      });
      valueRef.current?.focus();
      return;
    }
    s.mutate((data) => {
      data.measurements.push({
        id: "m-" + crypto.randomUUID().slice(0, 8),
        a: endA,
        b: endB,
        type: readingType,
        result: res,
        ...(readingType !== "continuity"
          ? {
              unit: readingType === "diode" ? "V" : "ohm",
              ...(readingType === "diode" ? { polarity: "a+" as const } : {}),
            }
          : {}),
        ...(wire ? { wireColor: wire } : {}),
        ...(route ? { route } : {}),
        ...(photoRef ? { photo: photoRef } : {}),
        powered: false,
        by: "alex",
        ts: new Date().toISOString(),
      });
      data.nets = deriveNets(data.measurements, data.nets);
    });
    setFlash([endA, endB]);
    setTimeout(() => setFlash([]), 550);
    if (!sticky) setA("");
    setB("");
    setValue("");
  }
  function onPin(id: string) {
    if (exhibit) {
      const p = d?.pins.find((x) => x.id === id);
      if (p) s.select(p.object);
      return;
    }
    if (!a) {
      setA(id);
      return;
    }
    if (id === a) {
      setA("");
      setB("");
      return;
    }
    setB(id);
    if (sticky && type === "continuity") log(a, id, held.current || result);
  }
  function onFace(id: string, uv: [number, number], component: boolean) {
    if (exhibit) return;
    s.set({ error: "" });
    setModal({
      kind: component ? "component" : "pin",
      object: id,
      uv,
      id: id + (component ? ".IC" : "."),
      label: "",
      count: 8,
    });
  }
  function duplicate() {
    if (!selected) return;
    s.mutate((data) => {
      const copy = structuredClone(selected);
      let id = copy.id + "-copy";
      while ([...data.objects, ...data.compartments].some((x) => x.id === id))
        id += "-copy";
      copy.id = id;
      copy.label += " (copy)";
      copy.pose.position[0] += 20;
      if ("kind" in copy) data.objects.push(copy as Obj);
      else data.compartments.push(copy);
    });
  }
  function remove() {
    if (selected) setModal({ kind: "delete", id: selected.id });
  }
  function reset() {
    s.set({
      focus: {
        position: [-550, 370, 900],
        target: [0, 0, 260],
        stamp: Date.now(),
      },
      highlight: [],
    });
  }
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      const input = (e.target as HTMLElement).closest("input,textarea,select");
      if (e.key === "Control") s.set({ snap: true });
      if (input || modal || help || lightbox) return;
      if (e.key === "/") {
        e.preventDefault();
        searchRef.current?.focus();
        return;
      }
      if (e.key === "?" || e.key === "F1") {
        e.preventDefault();
        setHelp((x) => !x);
      }
      if (e.key.toLowerCase() === "l") s.set({ lines: !s.lines });
      if (e.key === "Home") {
        e.preventDefault();
        reset();
      }
      if (exhibit) {
        if (["ArrowRight", "ArrowLeft"].includes(e.key) && tours.length) {
          const i =
            (tourIndex + (e.key === "ArrowRight" ? 1 : -1) + tours.length) %
            tours.length;
          setTourIndex(i);
          focusRequest(tours[i].id);
        }
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
        e.preventDefault();
        e.shiftKey ? s.redo() : s.undo();
        return;
      }
      if (e.key === "Tab") {
        e.preventDefault();
        s.set({ edit: !s.edit });
      }
      if (e.key === "Escape") {
        setA("");
        setB("");
        setModal(null);
        setLightbox("");
        s.set({ highlight: [] });
      }
      if (s.edit) {
        if (e.shiftKey && e.key.toLowerCase() === "d") duplicate();
        else if (e.key === "Delete" || e.key === "Backspace") remove();
        else if (["g", "r", "s"].includes(e.key.toLowerCase()))
          s.set({
            mode: ({ g: "translate", r: "rotate", s: "scale" } as const)[
              e.key.toLowerCase() as "g"
            ],
          });
        else if (["x", "y", "z"].includes(e.key.toLowerCase()))
          s.set({ axis: e.key.toUpperCase() });
        return;
      }
      if (e.key.toLowerCase() === "p") setSticky((x) => !x);
      if (["b", "o"].includes(e.key.toLowerCase())) {
        const r = e.key.toLowerCase() === "b" ? "beep" : "open";
        held.current = r;
        setResult(r);
        setType("continuity");
        if (a && b) log(a, b, r);
      }
      if (["v", "d"].includes(e.key.toLowerCase())) {
        setType(e.key.toLowerCase() === "v" ? "resistance" : "diode");
        setTimeout(() => valueRef.current?.focus(), 0);
      }
      if (/^[0-9]$/.test(e.key)) setWire(wireColors[(Number(e.key) + 9) % 10]);
      if (e.key === "Enter" && a && b) log();
    };
    const up = (e: KeyboardEvent) => {
      if (e.key === "Control") s.set({ snap: false });
      if (["b", "o"].includes(e.key.toLowerCase())) held.current = null;
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  });
  function submitModal() {
    if (!modal) return;
    const m = modal;
    s.set({ error: "" });
    if (m.kind === "delete") {
      s.mutate((data) => {
        const ids = new Set([
          m.id,
          ...data.objects
            .filter((o) => o.compartment === m.id)
            .map((o) => o.id),
        ]);
        const endpoints = new Set([
          ...data.pins.filter((p) => ids.has(p.object)).map((p) => p.id),
          ...data.components
            .filter((c) => ids.has(c.object))
            .flatMap((c) => (c.pins || []).map((p) => p.id)),
        ]);
        data.compartments = data.compartments.filter((o) => !ids.has(o.id));
        data.objects = data.objects.filter((o) => !ids.has(o.id));
        data.pins = data.pins.filter((p) => !ids.has(p.object));
        data.components = data.components.filter((p) => !ids.has(p.object));
        data.measurements = data.measurements.filter(
          (p) => !endpoints.has(p.a) && !endpoints.has(p.b),
        );
        data.photos.forEach((p) => {
          if (p.object && ids.has(p.object)) delete p.object;
        });
        data.viewRequests.forEach(
          (r) =>
            (r.highlight = r.highlight.filter(
              (id) => !ids.has(id) && !endpoints.has(id),
            )),
        );
        data.nets = deriveNets(data.measurements, data.nets);
      });
      s.select("B7");
    } else if (m.kind === "pin" || m.kind === "component") {
      s.mutate((data) => {
        const base = {
          id: m.id.trim(),
          object: m.object,
          label: m.label || m.id.split(".").at(-1),
          local: m.uv,
        };
        if (m.kind === "pin") data.pins.push({ ...base, localSpace: "uv" });
        else
          data.components.push({
            ...base,
            status: "GUESS",
            part: m.part || "",
            pins: Array.from(
              { length: Math.max(0, Math.min(64, Number(m.count))) },
              (_, i) => ({ id: m.id + "." + (i + 1), label: String(i + 1) }),
            ),
          });
      });
    } else if (m.kind === "new") {
      s.mutate((data) => {
        const base = {
          id: m.id.trim(),
          label: m.label || m.id,
          pose: {
            position: [0, 0, 260] as [number, number, number],
            rotation: [0, 0, 0] as [number, number, number],
            scale: [1, 1, 1] as [number, number, number],
          },
          size: [80, 60, 2] as [number, number, number],
          status: "GUESS" as const,
        };
        if (m.entity === "compartment")
          data.compartments.push({ ...base, size: [100, 100, 100] });
        else
          data.objects.push({
            ...base,
            kind: m.entity,
            compartment: m.compartment,
          });
      });
      s.select(m.id, true);
    } else if (m.kind === "request") {
      s.mutate((data) =>
        data.viewRequests.push({
          id: "vr-" + crypto.randomUUID().slice(0, 8),
          from: "alex",
          camera: s.camera as any,
          highlight: [s.selected],
          question: m.question,
          status: "open",
          created: new Date().toISOString(),
          tour: !!m.tour,
        }),
      );
    }
    if (!useStore.getState().error) setModal(null);
  }
  if (!d)
    return (
      <div className="loading">
        <Box size={40} />
        <h1>Lenzooka2</h1>
        <p>{s.error || "Opening the circuit atlas…"}</p>
        <button onClick={s.load}>Reload lens.json</button>
      </div>
    );
  const conflicts = d.nets.filter((n) => n.status === "CONFLICT");
  return (
    <div className="app">
      <header className="app-header">
        <div className="brand">
          <div className="brand-mark">
            <Focus size={24} />
          </div>
          <div>
            <h1>
              lenzooka<span>2</span>
            </h1>
            <p>THE BROADCAST LENS ATLAS</p>
          </div>
        </div>
        <div className="project-name">
          <span className="eyebrow">FUJI PHOTO OPTICAL · 1979</span>
          <strong>
            P14×16.5 <span>Studio zoom</span>
          </strong>
        </div>
        <div className="header-right">
          <span className="mode-pill">
            <i />
            {exhibit ? "EXHIBIT" : "BENCH LIVE"}
          </span>
          {!exhibit && (
            <>
              <button
                className="icon-button"
                title="Undo · Ctrl Z"
                disabled={!s.past.length}
                onClick={s.undo}
              >
                <Undo2 size={17} />
              </button>
              <button
                className="icon-button"
                title="Redo · Ctrl Shift Z"
                disabled={!s.future.length}
                onClick={s.redo}
              >
                <Redo2 size={17} />
              </button>
              <button
                className={
                  "save-status " + (s.saveState === "Saved" ? "ok" : "")
                }
                onClick={s.save}
              >
                {s.saveState === "Saved" ? (
                  <CheckCircle2 size={15} />
                ) : (
                  <Save size={15} />
                )}{" "}
                {s.saveState}
              </button>
            </>
          )}
          <button
            className="icon-button"
            title="Keyboard shortcuts"
            onClick={() => setHelp(true)}
          >
            <Keyboard size={18} />
          </button>
        </div>
      </header>
      {s.error && (
        <div className="error-banner">
          <AlertTriangle size={18} />
          <div>
            <strong>Action needs attention</strong>
            <p>{s.error}</p>
          </div>
          {!exhibit && (
            <>
              <button onClick={s.save}>Retry save</button>
              <button onClick={backup}>Download backup</button>
            </>
          )}
          <button title="Dismiss" onClick={() => s.set({ error: "" })}>
            <X size={16} />
          </button>
        </div>
      )}
      {recovery && !exhibit && (
        <div className="recovery-banner">
          <Save size={17} />
          <span>Unsaved work from your last session is available.</span>
          <button
            onClick={() => {
              try {
                const recovered = lensSchema.parse(JSON.parse(recovery));
                s.mutate((data) => Object.assign(data, recovered));
                setRecovery(null);
              } catch (e) {
                s.set({ error: `Recovery data could not be loaded: ${e}` });
              }
            }}
          >
            Restore work
          </button>
          <button
            onClick={() => {
              setRecovery(null);
              localStorage.removeItem("lenzooka2-recovery");
            }}
          >
            Use disk version
          </button>
        </div>
      )}
      <div className="workspace">
        <aside className="navigator">
          <div className="nav-title">
            <span className="eyebrow">EXPLORER</span>
            <span className="count">{objects.length}</span>
          </div>
          <div className="search">
            <Search size={16} />
            <input
              ref={searchRef}
              placeholder="Find a board, pin, signal…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && matches[0]) {
                  s.select(matches[0].id, true);
                  setSearch("");
                }
              }}
            />
            <kbd>/</kbd>
          </div>
          {search ? (
            <div className="search-results">
              {matches.map((m) => (
                <button
                  key={m.id}
                  onClick={() => {
                    s.select(m.id, true);
                    setSearch("");
                  }}
                >
                  <strong>{m.id}</strong>
                  <span>{m.label}</span>
                </button>
              ))}
              {!matches.length && <p>No matching items.</p>}
            </div>
          ) : (
            <div className="tree">
              {d.compartments
                .filter((c) => c.id !== "OPTICS")
                .map((c) => (
                  <div className="tree-group" key={c.id}>
                    <button
                      className={
                        "tree-heading " + (s.selected === c.id ? "active" : "")
                      }
                      onClick={() => s.select(c.id, true)}
                    >
                      <ChevronRight size={12} />
                      <Layers size={14} />
                      {c.id}
                      <span>
                        {objects.filter((o) => o.compartment === c.id).length}
                      </span>
                    </button>
                    {objects
                      .filter((o) => o.compartment === c.id)
                      .map((o) => (
                        <button
                          className={
                            "tree-item " + (s.selected === o.id ? "active" : "")
                          }
                          key={o.id}
                          onClick={() => s.select(o.id)}
                          onDoubleClick={() => s.select(o.id, true)}
                        >
                          <span
                            className="evidence-dot"
                            style={{ background: colors[o.status] }}
                          />
                          {o.kind === "connector" ? (
                            <Link2 size={13} />
                          ) : o.kind === "board" ? (
                            <Box size={13} />
                          ) : (
                            <SlidersHorizontal size={13} />
                          )}
                          <strong>{o.id}</strong>
                          <span>{o.fujiName || o.label}</span>
                        </button>
                      ))}
                  </div>
                ))}
            </div>
          )}
          <div className="nav-bottom">
            {!exhibit && (
              <button
                onClick={() =>
                  setModal({
                    kind: "new",
                    entity: "board",
                    id: "",
                    label: "",
                    compartment: obj?.compartment || "BAY-L",
                  })
                }
              >
                <Plus size={15} /> Add to atlas
              </button>
            )}
            <div className="evidence-key">
              <span>
                <i style={{ background: colors.PHOTO }} />
                Photo
              </span>
              <span>
                <i style={{ background: colors.MEAS }} />
                Measured
              </span>
              <span>
                <i style={{ background: colors.GUESS }} />
                Unverified
              </span>
            </div>
          </div>
        </aside>
        <main className="main-panel">
          <div className="scene-top">
            <div>
              <span className="eyebrow">SPATIAL ATLAS</span>
              <h2>Inside the Fujinon</h2>
            </div>
            <div className="segmented">
              {!exhibit && (
                <button
                  className={s.edit ? "selected" : ""}
                  onClick={() => s.set({ edit: !s.edit })}
                >
                  <Move size={14} />
                  {s.edit ? "Positioning" : "Position"}
                  <kbd>Tab</kbd>
                </button>
              )}
              <button
                className={s.lines ? "selected" : ""}
                onClick={() => s.set({ lines: !s.lines })}
              >
                <Network size={14} /> Nets
              </button>
              <button title="Reset view · Home" onClick={reset}>
                <RotateCcw size={15} />
              </button>
            </div>
          </div>
          <div
            className="scene"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              if (!exhibit && obj && e.dataTransfer.files[0])
                uploadPhoto(e.dataTransfer.files[0], obj.id);
            }}
          >
            <SceneBoundary>
              <Scene onPin={onPin} onFace={onFace} />
            </SceneBoundary>
            <div className="scene-context">
              <span className="scene-chip">
                <Box size={13} />
                {d.compartments.length} zones
              </span>
              <span className="scene-chip">mm · operator frame</span>
            </div>
            {s.edit && (
              <div className="transform-toolbar">
                {[
                  ["translate", Move, "G"],
                  ["rotate", Rotate3D, "R"],
                  ["scale", Scaling, "S"],
                ].map(([mode, Icon, key]) => (
                  <button
                    key={String(mode)}
                    className={s.mode === mode ? "selected" : ""}
                    onClick={() => s.set({ mode: mode as any })}
                  >
                    {typeof Icon !== "string" && <Icon size={15} />}
                    <kbd>{String(key)}</kbd>
                  </button>
                ))}
                <span>{s.axis || "XYZ"} · Hold Ctrl to snap</span>
              </div>
            )}
            <div className="scene-hint">
              Drag to orbit · Right-drag to pan · Scroll to zoom
            </div>
            <button
              className="focus-button"
              onClick={() => s.select(s.selected, true)}
            >
              <Focus size={15} /> Focus {s.selected}
            </button>
          </div>
          {exhibit ? (
            <div className="tour-bar">
              <BookOpen size={21} />
              <div>
                <span className="eyebrow">A GUIDED LOOK INSIDE</span>
                <strong>
                  {tours[tourIndex]?.question ||
                    "Explore the lens by selecting an object"}
                </strong>
                <p>{tours[tourIndex]?.answer}</p>
              </div>
              <button
                onClick={() => {
                  const i = (tourIndex + 1) % tours.length;
                  setTourIndex(i);
                  if (tours[i]) focusRequest(tours[i].id);
                }}
              >
                {tourIndex + 1} / {tours.length}
                <ArrowRight size={17} />
              </button>
            </div>
          ) : (
            <section className="probe-panel">
              <div className="probe-heading">
                <span className="eyebrow">
                  <Activity size={14} /> PROBE STATION
                </span>
                <div className="segmented">
                  <button
                    className={!sticky ? "selected" : ""}
                    onClick={() => setSticky(false)}
                  >
                    Two-click
                  </button>
                  <button
                    className={sticky ? "selected" : ""}
                    onClick={() => setSticky(true)}
                  >
                    Sticky anchor <kbd>P</kbd>
                  </button>
                </div>
              </div>
              <div className="probe-pair">
                <div className={"probe-end " + (a ? "filled" : "")}>
                  <span className="probe-dot red" />
                  <span>
                    <small>PROBE A · RED</small>
                    <strong>{a || "Select first endpoint"}</strong>
                  </span>
                  {a && (
                    <button
                      title="Clear endpoints"
                      onClick={() => {
                        setA("");
                        setB("");
                      }}
                    >
                      <X size={13} />
                    </button>
                  )}
                </div>
                <span className="pair-line" />
                <div className={"probe-end " + (b ? "filled" : "")}>
                  <span className="probe-dot black" />
                  <span>
                    <small>PROBE B · BLACK</small>
                    <strong>{b || "Select second endpoint"}</strong>
                  </span>
                </div>
              </div>
              <div className="probe-actions">
                <button
                  className={
                    "result beep " +
                    (result === "beep" && type === "continuity"
                      ? "selected"
                      : "")
                  }
                  onClick={() => {
                    setType("continuity");
                    setResult("beep");
                    if (a && b) log(a, b, "beep");
                  }}
                >
                  <Link2 size={17} /> Beep <kbd>B</kbd>
                </button>
                <button
                  className={
                    "result " +
                    (result === "open" && type === "continuity"
                      ? "selected"
                      : "")
                  }
                  onClick={() => {
                    setType("continuity");
                    setResult("open");
                    if (a && b) log(a, b, "open");
                  }}
                >
                  <Unplug size={17} /> Open <kbd>O</kbd>
                </button>
                <button
                  className={type === "resistance" ? "selected" : ""}
                  onClick={() => {
                    setType("resistance");
                    setTimeout(() => valueRef.current?.focus(), 0);
                  }}
                >
                  Ω <span>Resistance</span>
                  <kbd>V</kbd>
                </button>
                <button
                  className={type === "diode" ? "selected" : ""}
                  onClick={() => {
                    setType("diode");
                    setTimeout(() => valueRef.current?.focus(), 0);
                  }}
                >
                  ▷| <span>Diode</span>
                  <kbd>D</kbd>
                </button>
                {type !== "continuity" && (
                  <>
                    <input
                      className="meter-value"
                      type="number"
                      min="0"
                      ref={valueRef}
                      placeholder={type === "diode" ? "Volts" : "Ohms"}
                      value={value}
                      onChange={(e) => setValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") log();
                      }}
                    />
                    <button disabled={!a || !b} onClick={() => log()}>
                      Record
                    </button>
                  </>
                )}
              </div>
              <details className="probe-details">
                <summary>
                  Wire color & routing <span>{wire || "optional"}</span>
                </summary>
                <div className="wire-palette">
                  {wireColors.map((w, i) => (
                    <button
                      title={`${w} · ${(i + 1) % 10}`}
                      key={w}
                      className={wire === w ? "selected" : ""}
                      onClick={() => setWire(wire === w ? "" : w)}
                    >
                      <i style={{ background: wireHex[i] }} />
                      {w}
                    </button>
                  ))}
                </div>
                <input
                  placeholder="Harness route or bench note"
                  value={route}
                  onChange={(e) => setRoute(e.target.value)}
                />
                <select
                  value={photoRef}
                  onChange={(e) => setPhotoRef(e.target.value)}
                >
                  <option value="">No reference photo</option>
                  {d.photos.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.id} · {p.note}
                    </option>
                  ))}
                </select>
              </details>
              <div className="probe-foot">
                <span>
                  <i />
                  {sticky
                    ? "Anchor stays selected · each next pin logs the chosen result"
                    : "Select two endpoints, then press B or O"}
                </span>
                <span>{d.measurements.length} readings recorded</span>
              </div>
            </section>
          )}
          {obj?.id === "CAM50" && (
            <div className="uncertainty-note">
              <AlertTriangle size={14} /> CAM50 numbering is provisional.
              Confirm the keyway and pin order before relying on this map.
            </div>
          )}
          {obj ? (
            <Face
              key={obj.id}
              obj={obj}
              onPin={onPin}
              a={a}
              b={b}
              flash={flash}
              onFace={onFace}
              onLightbox={setLightbox}
            />
          ) : (
            <div className="empty-face">
              <Layers size={25} />
              <p>Select a board or connector to open its focused face.</p>
            </div>
          )}
        </main>
        <aside className="inspector">
          <div className="inspector-tabs">
            {[
              ["inspect", SlidersHorizontal, "Inspect"],
              ["nets", Network, "Nets"],
              ["log", Activity, "Log"],
              ["requests", MessageSquare, "Notes"],
            ].map(([id, Icon, label]) => (
              <button
                key={String(id)}
                title={String(label)}
                className={tab === id ? "active" : ""}
                onClick={() => setTab(String(id))}
              >
                {typeof Icon !== "string" && <Icon size={17} />}
                <span>{String(label)}</span>
                {id === "requests" && (
                  <i>
                    {d.viewRequests.filter((r) => r.status === "open").length}
                  </i>
                )}
              </button>
            ))}
          </div>
          <div className="inspector-content">
            {tab === "inspect" && selected && (
              <>
                <div className="object-heading">
                  <span className="eyebrow">
                    {"kind" in selected ? String(selected.kind) : "COMPARTMENT"}
                  </span>
                  <div>
                    <h2>{selected.id}</h2>
                    <Badge status={selected.status} />
                  </div>
                  <h3>
                    {"fujiName" in selected
                      ? String(selected.fujiName || selected.label)
                      : selected.label}
                  </h3>
                </div>
                {!exhibit ? (
                  <>
                    <Field
                      label="Display label"
                      value={selected.label}
                      onChange={(v) => mutateObj("label", v)}
                    />
                    <label className="field">
                      Evidence
                      <select
                        value={selected.status}
                        onChange={(e) => mutateObj("status", e.target.value)}
                      >
                        {Object.keys(colors).map((v) => (
                          <option key={v}>{v}</option>
                        ))}
                      </select>
                    </label>
                    {obj && (
                      <label className="field">
                        Compartment
                        <select
                          value={obj.compartment}
                          onChange={(e) =>
                            mutateObj("compartment", e.target.value)
                          }
                        >
                          {d.compartments.map((c) => (
                            <option key={c.id}>{c.id}</option>
                          ))}
                        </select>
                      </label>
                    )}
                  </>
                ) : (
                  <p className="object-description">{selected.label}</p>
                )}
                {selected.notes && (
                  <div className="notes-card">
                    <BookOpen size={16} />
                    <p>{selected.notes}</p>
                  </div>
                )}
                {!exhibit && (
                  <>
                    <label className="field">
                      Bench notes
                      <textarea
                        key={selected.id + selected.notes}
                        defaultValue={selected.notes || ""}
                        onBlur={(e) => {
                          if (e.target.value !== selected.notes)
                            mutateObj("notes", e.target.value);
                        }}
                      />
                    </label>
                    <details className="placement" open={s.edit}>
                      <summary>
                        <Move size={15} /> Placement <span>mm / radians</span>
                      </summary>
                      {(["position", "rotation", "scale"] as const).map(
                        (key) => (
                          <div className="vector-field" key={key}>
                            <label>{key}</label>
                            <div>
                              {selected.pose[key].map((v, i) => (
                                <label key={i}>
                                  <span>{"XYZ"[i]}</span>
                                  <input
                                    type="number"
                                    step={key === "rotation" ? 0.1 : 1}
                                    key={v}
                                    defaultValue={Math.round(v * 1000) / 1000}
                                    onBlur={(e) => {
                                      const n = +e.target.value;
                                      if (Number.isFinite(n) && n !== v) {
                                        const pose = structuredClone(
                                          selected.pose,
                                        );
                                        pose[key][i] = n;
                                        mutateObj("pose", pose);
                                      }
                                    }}
                                  />
                                </label>
                              ))}
                            </div>
                          </div>
                        ),
                      )}
                      <div className="vector-field">
                        <label>size</label>
                        <div>
                          {selected.size.map((v, i) => (
                            <label key={i}>
                              <span>{"WHD"[i]}</span>
                              <input
                                type="number"
                                min=".1"
                                key={v}
                                defaultValue={v}
                                onBlur={(e) => {
                                  if (+e.target.value > 0) {
                                    const size = [...selected.size];
                                    size[i] = +e.target.value;
                                    mutateObj("size", size);
                                  }
                                }}
                              />
                            </label>
                          ))}
                        </div>
                      </div>
                    </details>
                    <div className="object-actions">
                      <button onClick={duplicate}>
                        <Copy size={14} /> Duplicate
                      </button>
                      <button className="danger" onClick={remove}>
                        <Trash2 size={14} /> Delete
                      </button>
                    </div>
                  </>
                )}
                <div className="panel-heading">
                  <Camera size={16} />
                  <h3>Reference photos</h3>
                  <span className="count">
                    {d.photos.filter((p) => p.object === selected.id).length}
                  </span>
                </div>
                <div className="photo-grid">
                  {d.photos
                    .filter((p) => p.object === selected.id)
                    .map((p) => (
                      <div key={p.id}>
                        <button
                          className="photo-thumb"
                          onClick={() => setLightbox(p.file)}
                        >
                          <img src={asset(p.file)} />
                          <span>{p.id}</span>
                        </button>
                        {!exhibit && (
                          <>
                            <button
                              className="text-button"
                              disabled={!obj}
                              onClick={() => mutateObj("faceTexture", p.id)}
                            >
                              {obj?.faceTexture === p.id
                                ? "✓ Face texture"
                                : "Use as texture"}
                            </button>
                            <select
                              aria-label={`Attach photo ${p.id} to object`}
                              value={p.object || ""}
                              onChange={(e) =>
                                s.mutate((data) => {
                                  data.photos.find(
                                    (x) => x.id === p.id,
                                  )!.object = e.target.value;
                                })
                              }
                            >
                              {[...d.objects, ...d.compartments].map((x) => (
                                <option key={x.id}>{x.id}</option>
                              ))}
                            </select>
                          </>
                        )}
                      </div>
                    ))}
                </div>
                {!exhibit && obj && (
                  <label className="upload-area">
                    <Upload size={18} />
                    <span>
                      Drop a JPEG on the face
                      <br />
                      or click to attach a photo
                    </span>
                    <input
                      type="file"
                      hidden
                      accept="image/jpeg"
                      onChange={(e) => {
                        if (e.target.files?.[0])
                          uploadPhoto(e.target.files[0], obj.id);
                      }}
                    />
                  </label>
                )}
                <div className="panel-heading">
                  <Network size={16} />
                  <h3>Connected nets</h3>
                </div>
                {d.nets
                  .filter((n) =>
                    n.members.some(
                      (id) =>
                        d.pins.find((p) => p.id === id)?.object === selected.id,
                    ),
                  )
                  .map((n) => (
                    <button
                      className="net-link"
                      key={n.id}
                      onClick={() => setTab("nets")}
                    >
                      {n.name}
                      <ChevronRight size={14} />
                    </button>
                  ))}
                {!d.nets.length && (
                  <p className="muted">No measured connections yet.</p>
                )}
              </>
            )}
            {tab === "nets" && (
              <>
                <div className="panel-heading">
                  <Network size={18} />
                  <h2>Measured networks</h2>
                  <span className="count">{d.nets.length}</span>
                </div>
                {conflicts.length > 0 && (
                  <div className="conflict-card">
                    <AlertTriangle size={18} />
                    <strong>Named nets overlap</strong>
                    <p>
                      A beep joins differently named networks. Review the
                      connecting measurement in Log, or give the networks the
                      same name if they belong together.
                    </p>
                  </div>
                )}
                {!d.nets.length && (
                  <div className="empty-state">
                    <Network size={36} />
                    <h3>Every beep builds the map.</h3>
                    <p>
                      Log continuity between two pins to create your first
                      measured net.
                    </p>
                  </div>
                )}
                {d.nets.map((n, i) => (
                  <div className="net-card" key={n.id}>
                    <div className="net-title">
                      <i style={{ background: netColor(i) }} />
                      {exhibit ? (
                        <strong>{n.name}</strong>
                      ) : (
                        <input
                          aria-label="Net name"
                          key={n.name}
                          defaultValue={n.name}
                          onBlur={(e) => {
                            if (e.target.value !== n.name)
                              s.mutate((data) => {
                                data.nets.find((x) => x.id === n.id)!.name =
                                  e.target.value;
                                data.nets = deriveNets(
                                  data.measurements,
                                  data.nets,
                                );
                              });
                          }}
                        />
                      )}
                      <Badge status={n.status} />
                    </div>
                    <div className="member-list">
                      {n.members.map((id) => (
                        <button
                          key={id}
                          onClick={() => {
                            s.select(id, true);
                            if (!exhibit) onPin(id);
                          }}
                        >
                          {id}
                        </button>
                      ))}
                    </div>
                    <small>{n.derivedFrom.length} continuity readings</small>
                    <details>
                      <summary>Source measurements</summary>
                      {n.derivedFrom.map((id) => {
                        const m = d.measurements.find((x) => x.id === id);
                        return (
                          <p key={id}>
                            {m?.a} ↔ {m?.b}
                          </p>
                        );
                      })}
                    </details>
                  </div>
                ))}
              </>
            )}
            {tab === "log" && (
              <>
                <div className="panel-heading">
                  <Activity size={18} />
                  <h2>Bench log</h2>
                  <span className="count">{d.measurements.length}</span>
                </div>
                {!d.measurements.length && (
                  <div className="empty-state">
                    <Activity size={36} />
                    <h3>A clean bench sheet.</h3>
                    <p>
                      Beep, open, resistance and diode readings will appear
                      here. Every result is saved, including open circuits.
                    </p>
                  </div>
                )}
                {[...d.measurements].reverse().map((m) => (
                  <div className="measurement" key={m.id}>
                    <div className="measurement-top">
                      <span
                        className={
                          "reading " + (m.result === "beep" ? "positive" : "")
                        }
                      >
                        {m.result === "beep" ? (
                          <Link2 size={14} />
                        ) : (
                          <Activity size={14} />
                        )}{" "}
                        {m.result} {m.unit === "ohm" ? "Ω" : m.unit || ""}
                      </span>
                      <time>
                        {new Date(m.ts).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </time>
                    </div>
                    <strong>{m.a}</strong>
                    <span className="log-connection">↳ {m.b}</span>
                    {m.route && <p>{m.route}</p>}
                    {m.wireColor && <small>Wire {m.wireColor}</small>}
                    {!exhibit && (
                      <div className="measurement-actions">
                        <button
                          onClick={() =>
                            setLogEdit(logEdit === m.id ? "" : m.id)
                          }
                        >
                          Edit
                        </button>
                        <button
                          onClick={() =>
                            s.mutate((data) => {
                              data.measurements = data.measurements.filter(
                                (x) => x.id !== m.id,
                              );
                              data.nets = deriveNets(
                                data.measurements,
                                data.nets,
                              );
                            })
                          }
                        >
                          Delete
                        </button>
                      </div>
                    )}
                    {logEdit === m.id && !exhibit && (
                      <>
                        <Field
                          label="Result (beep, open, or number)"
                          value={m.result}
                          onChange={(v) =>
                            s.mutate((data) => {
                              const x = data.measurements.find(
                                (x) => x.id === m.id,
                              )!;
                              x.result =
                                v === "beep" || v === "open" ? v : Number(v);
                              data.nets = deriveNets(
                                data.measurements,
                                data.nets,
                              );
                            })
                          }
                        />
                        <Field
                          label="Note"
                          value={m.note || ""}
                          onChange={(v) =>
                            s.mutate((data) => {
                              data.measurements.find(
                                (x) => x.id === m.id,
                              )!.note = v;
                            })
                          }
                        />
                      </>
                    )}
                  </div>
                ))}
              </>
            )}
            {tab === "requests" && (
              <>
                <div className="panel-heading">
                  <MessageSquare size={18} />
                  <h2>View requests</h2>
                  {!exhibit && (
                    <button
                      title="Create request from current view"
                      onClick={() =>
                        setModal({ kind: "request", question: "", tour: false })
                      }
                    >
                      <Plus size={16} />
                    </button>
                  )}
                </div>
                <p className="muted">Questions tied to a place in the lens.</p>
                {d.viewRequests.map((r) => (
                  <div
                    className={
                      "request-card " + (activeRequest === r.id ? "active" : "")
                    }
                    key={r.id}
                  >
                    <button onClick={() => focusRequest(r.id)}>
                      <div>
                        <span className="eyebrow">
                          {r.from} · {r.id}
                        </span>
                        {r.status === "answered" ? (
                          <CheckCircle2 size={15} />
                        ) : (
                          <span className="open-dot" />
                        )}
                      </div>
                      <p>{r.question}</p>
                      <span className="text-link">
                        <Focus size={13} /> Go to view
                      </span>
                    </button>
                    {r.answer && <blockquote>{r.answer}</blockquote>}
                    {!exhibit && activeRequest === r.id && (
                      <div className="answer-form">
                        <textarea
                          placeholder="Record what you found…"
                          value={answer}
                          onChange={(e) => setAnswer(e.target.value)}
                        />
                        <button
                          disabled={!answer.trim()}
                          onClick={() =>
                            s.mutate((data) => {
                              const x = data.viewRequests.find(
                                (x) => x.id === r.id,
                              )!;
                              x.answer = answer;
                              x.status = "answered";
                              x.answered = new Date().toISOString();
                            })
                          }
                        >
                          <Check size={14} /> Save answer
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </>
            )}
          </div>
          <div className="inspector-footer">
            {!exhibit && (
              <>
                <button
                  title="Reload changes made by Claude; download a backup first if needed"
                  onClick={() => {
                    if (s.saveState === "Saved") s.load();
                    else setModal({ kind: "reload" });
                  }}
                >
                  <RotateCcw size={14} /> Reload JSON
                </button>
                <button title="Download JSON backup" onClick={backup}>
                  <Download size={15} />
                </button>
              </>
            )}
            <span>SCHEMA 01</span>
          </div>
        </aside>
      </div>
      <footer className="status-bar">
        <span>
          <i className="live-dot" />
          {exhibit ? "READ-ONLY EXHIBIT" : "LOCAL WORKSPACE"}{" "}
          <span className="divider">/</span> LENZOOKA2
        </span>
        <span>
          {d.pins.length} pins <span className="divider">·</span>{" "}
          {d.nets.length} nets <span className="divider">·</span>{" "}
          {d.photos.length} photos
        </span>
        <span>
          {exhibit ? "WAREABOUTS · FIELD NOTES" : "UNPOWERED MEASUREMENTS"}
          <kbd>?</kbd>
        </span>
      </footer>
      {lightbox && (
        <div className="modal-backdrop" onClick={() => setLightbox("")}>
          <button className="lightbox-close" onClick={() => setLightbox("")}>
            <X />
          </button>
          <img
            className="lightbox"
            src={asset(lightbox)}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
      {help && (
        <div className="modal-backdrop" onClick={() => setHelp(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setHelp(false)}>
              <X size={18} />
            </button>
            <span className="eyebrow">ONE HAND ON THE PROBE</span>
            <h2>Keyboard field guide</h2>
            {[
              ["/", "Search IDs and labels"],
              ["Home", "Reset the camera"],
              ["L", "Toggle net lines"],
              ["Tab", "Toggle placement mode"],
              ["G / R / S", "Move / rotate / scale"],
              ["X / Y / Z", "Constrain transform axis"],
              ["Ctrl", "Snap 10 mm / 15°"],
              ["Esc / Enter", "Cancel / confirm transform"],
              ["Shift D", "Duplicate selected object"],
              ["Ctrl Z / Ctrl Shift Z", "Undo / redo"],
              ["P", "Toggle sticky anchor"],
              ["B / O", "Continuity beep / open"],
              ["V / D", "Resistance / diode reading"],
              ["1–9 / 0", "Wire color palette"],
              ["Shift / Alt + click", "Add pin / component on face"],
            ].map(([k, v]) => (
              <div className="shortcut" key={k}>
                <kbd>{k}</kbd>
                <span>{v}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      {modal && !exhibit && (
        <div className="modal-backdrop">
          <div className="modal">
            <button className="modal-close" onClick={() => setModal(null)}>
              <X size={18} />
            </button>
            <span className="eyebrow">ATLAS EDITOR</span>
            <h2>
              {
                (
                  {
                    pin: "Place a pin",
                    component: "Place a component",
                    new: "Add to atlas",
                    delete: "Delete " + modal.id,
                    request: "Leave a view request",
                    reload: "Reload from disk?",
                  } as any
                )[modal.kind]
              }
            </h2>
            {modal.kind === "delete" ? (
              <p>
                This removes the item, its contained objects and dependent pins
                and readings. Photos remain in the library. You can undo this
                change.
              </p>
            ) : modal.kind === "reload" ? (
              <p>
                You have unsaved changes. Download a backup before replacing
                this session with the file on disk.
              </p>
            ) : modal.kind === "request" ? (
              <>
                <label className="field">
                  Question
                  <textarea
                    value={modal.question}
                    onChange={(e) =>
                      setModal({ ...modal, question: e.target.value })
                    }
                  />
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={modal.tour}
                    onChange={(e) =>
                      setModal({ ...modal, tour: e.target.checked })
                    }
                  />{" "}
                  Include in exhibit tour
                </label>
              </>
            ) : (
              <>
                {modal.kind === "new" && (
                  <>
                    <label className="field">
                      Type
                      <select
                        value={modal.entity}
                        onChange={(e) =>
                          setModal({ ...modal, entity: e.target.value })
                        }
                      >
                        {[
                          "board",
                          "connector",
                          "assembly",
                          "switch",
                          "psu",
                          "other",
                          "compartment",
                        ].map((k) => (
                          <option key={k}>{k}</option>
                        ))}
                      </select>
                    </label>
                    <label className="field">
                      Compartment
                      <select
                        value={modal.compartment}
                        onChange={(e) =>
                          setModal({ ...modal, compartment: e.target.value })
                        }
                      >
                        {d.compartments.map((c) => (
                          <option key={c.id}>{c.id}</option>
                        ))}
                      </select>
                    </label>
                  </>
                )}
                <label className="field">
                  Stable ID
                  <input
                    autoFocus
                    value={modal.id}
                    onChange={(e) => setModal({ ...modal, id: e.target.value })}
                  />
                </label>
                <label className="field">
                  Label
                  <input
                    value={modal.label}
                    onChange={(e) =>
                      setModal({ ...modal, label: e.target.value })
                    }
                  />
                </label>
                {modal.kind === "component" && (
                  <>
                    <label className="field">
                      Part number
                      <input
                        value={modal.part || ""}
                        onChange={(e) =>
                          setModal({ ...modal, part: e.target.value })
                        }
                      />
                    </label>
                    <label className="field">
                      Pin count
                      <input
                        type="number"
                        min="0"
                        max="64"
                        value={modal.count}
                        onChange={(e) =>
                          setModal({ ...modal, count: e.target.value })
                        }
                      />
                    </label>
                  </>
                )}
              </>
            )}
            {s.error && <p className="modal-error">{s.error}</p>}
            <div className="modal-actions">
              <button
                onClick={() => {
                  setModal(null);
                  s.set({ error: "" });
                }}
              >
                Cancel
              </button>
              {modal.kind === "reload" ? (
                <>
                  <button onClick={backup}>Download backup</button>
                  <button
                    className="primary"
                    onClick={() => {
                      s.load();
                      setModal(null);
                    }}
                  >
                    Reload disk version
                  </button>
                </>
              ) : (
                <button
                  className={modal.kind === "delete" ? "danger" : "primary"}
                  onClick={submitModal}
                >
                  {modal.kind === "delete" ? "Delete item" : "Save"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
