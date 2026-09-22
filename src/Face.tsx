import { useState, useRef, useEffect } from "react";
import {
  Plus,
  Rows3,
  Microchip,
  RotateCw,
  FlipHorizontal,
  Upload,
  Maximize2,
  Move,
} from "lucide-react";
import { asset, useStore, exhibit } from "./store";
import { netColor } from "./Scene";
import { usePhotoAspect } from "./faceGeometry";
import type { Obj } from "./schema";
export async function uploadPhoto(file: File, objId: string) {
  const s = useStore.getState();
  try {
    const form = new FormData();
    form.append("photo", file);
    const r = await fetch("/api/photo", { method: "POST", body: form });
    const p = await r.json();
    if (!r.ok) throw Error(p.error);
    s.mutate((d) => {
      d.photos.push({ ...p, object: objId, note: file.name });
      const o = d.objects.find((x) => x.id === objId);
      if (o) o.faceTexture = p.id;
    });
  } catch (e) {
    s.set({
      error: `Photo upload failed for ${file.name}. Your board is unchanged. Choose the photo again to retry. ${e}`,
    });
  }
}
export function Face({
  obj,
  onPin,
  a,
  b,
  flash,
  onFace,
  onLightbox,
}: {
  obj: Obj;
  onPin: (id: string) => void;
  a: string;
  b: string;
  flash: string[];
  onFace: (id: string, uv: [number, number], component: boolean) => void;
  onLightbox: (file: string) => void;
}) {
  const s = useStore(),
    d = s.data!;
  const [tool, setTool] = useState("probe"),
    [start, setStart] = useState<[number, number] | null>(null),
    [count, setCount] = useState(15),
    [prefix, setPrefix] = useState(obj.id + "."),
    [width, setWidth] = useState(600),
    [editPin, setEditPin] = useState("");
  const input = useRef<HTMLInputElement>(null),
    surface = useRef<HTMLDivElement>(null),
    drag = useRef<string | null>(null);
  const photo = d.photos.find((x) => x.id === obj.faceTexture),
    aspect =
      usePhotoAspect(photo ? asset(photo.file) : undefined) ||
      obj.size[0] / obj.size[1];
  const pins = d.pins.filter((x) => x.object === obj.id),
    components = d.components.filter((x) => x.object === obj.id);
  const rotation = obj.textureRotation || 0,
    rotated = rotation % 180 !== 0;
  let w = rotated ? 320 : width - 40,
    h = w / aspect;
  const maxH = rotated ? width - 40 : 320;
  if (h > maxH) {
    h = maxH;
    w = h * aspect;
  }
  useEffect(() => {
    if (!surface.current) return;
    const ro = new ResizeObserver((entries) =>
      setWidth(entries[0].contentRect.width),
    );
    ro.observe(surface.current);
    return () => ro.disconnect();
  }, []);
  function uv(e: { clientX: number; clientY: number }): [number, number] {
    const r = surface.current!.getBoundingClientRect(),
      x = e.clientX - r.left - r.width / 2,
      y = e.clientY - r.top - r.height / 2,
      angle = (rotation * Math.PI) / 180;
    return [
      Math.max(
        0,
        Math.min(
          1,
          ((x * Math.cos(angle) - y * Math.sin(angle)) *
            (obj.textureFlip ? -1 : 1)) /
            w +
            0.5,
        ),
      ),
      Math.max(
        0,
        Math.min(1, (x * Math.sin(angle) + y * Math.cos(angle)) / h + 0.5),
      ),
    ];
  }
  function click(e: React.MouseEvent<HTMLDivElement>) {
    if (exhibit) return;
    const pos = uv(e);
    if (tool === "row") {
      if (!start) {
        setStart(pos);
        return;
      }
      s.mutate((data) => {
        for (let i = 0; i < count; i++) {
          const id = prefix + (i + 1);
          if (data.pins.some((p) => p.id === id))
            throw Error(
              `${id} already exists. Change the row prefix before adding this row.`,
            );
          data.pins.push({
            id,
            object: obj.id,
            label: String(i + 1),
            local: [
              start[0] + ((pos[0] - start[0]) * i) / (count - 1),
              start[1] + ((pos[1] - start[1]) * i) / (count - 1),
            ],
            localSpace: "uv",
          });
        }
      });
      if (!useStore.getState().error) {
        setStart(null);
        setTool("probe");
      }
    } else if (tool === "pin" || tool === "component" || e.shiftKey || e.altKey)
      onFace(obj.id, pos, tool === "component" || e.altKey);
  }
  const position = (local: number[], mm = false) => ({
    left: `${(mm ? local[0] / obj.size[0] + 0.5 : local[0]) * 100}%`,
    top: `${(mm ? 0.5 - local[1] / obj.size[1] : local[1]) * 100}%`,
  });
  const editing = pins.find((p) => p.id === editPin);
  return (
    <section className="face-section">
      <div className="section-heading">
        <div>
          <span className="eyebrow">FOCUSED FACE</span>
          <h2>
            {obj.id} <span>{obj.fujiName || obj.label}</span>
          </h2>
        </div>
        <span className="count">{pins.length} pins</span>
      </div>
      {!exhibit && (
        <div className="face-toolbar">
          <button
            className={tool === "probe" ? "selected" : ""}
            onClick={() => setTool("probe")}
          >
            Probe
          </button>
          <button
            title="Add pin · Shift-click"
            className={tool === "pin" ? "selected" : ""}
            onClick={() => setTool("pin")}
          >
            <Plus size={14} /> Pin
          </button>
          <button
            className={tool === "row" ? "selected" : ""}
            onClick={() => {
              setPrefix(obj.id + ".");
              setTool("row");
              setStart(null);
            }}
          >
            <Rows3 size={14} /> Row
          </button>
          <button
            title="Add component · Alt-click"
            className={tool === "component" ? "selected" : ""}
            onClick={() => setTool("component")}
          >
            <Microchip size={14} />
          </button>
          <button
            title="Move or edit pins and components"
            className={tool === "arrange" ? "selected" : ""}
            onClick={() => setTool("arrange")}
          >
            <Move size={14} /> Arrange
          </button>
          <span className="spacer" />
          <button
            title="Rotate photo"
            onClick={() =>
              s.mutate((data) => {
                const o = data.objects.find((x) => x.id === obj.id)!;
                o.textureRotation = ((o.textureRotation || 0) + 90) % 360;
              })
            }
          >
            <RotateCw size={14} />
          </button>
          <button
            title="Flip photo"
            onClick={() =>
              s.mutate((data) => {
                const o = data.objects.find((x) => x.id === obj.id)!;
                o.textureFlip = !o.textureFlip;
              })
            }
          >
            <FlipHorizontal size={14} />
          </button>
          <button title="Attach JPEG" onClick={() => input.current?.click()}>
            <Upload size={14} />
          </button>
          <input
            hidden
            type="file"
            accept="image/jpeg"
            ref={input}
            onChange={(e) => {
              if (e.target.files?.[0]) uploadPhoto(e.target.files[0], obj.id);
            }}
          />
        </div>
      )}
      {tool === "row" && (
        <div className="row-options">
          <label>
            Prefix
            <input value={prefix} onChange={(e) => setPrefix(e.target.value)} />
          </label>
          <label>
            Count
            <input
              type="number"
              min="2"
              max="100"
              value={count}
              onChange={(e) =>
                setCount(Math.max(2, Math.min(100, +e.target.value)))
              }
            />
          </label>
          <span>
            {start
              ? "Click the last pin position"
              : "Click the first pin position"}
          </span>
        </div>
      )}
      <div
        ref={surface}
        className={"face-canvas " + (!photo ? "synthetic" : "")}
        onClick={click}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          if (!exhibit && e.dataTransfer.files[0])
            uploadPhoto(e.dataTransfer.files[0], obj.id);
        }}
        onPointerUp={(e) => {
          if (!drag.current) return;
          const id = drag.current;
          drag.current = null;
          const pos = uv(e);
          s.mutate((data) => {
            const p = data.pins.find((p) => p.id === id);
            if (p) {
              p.local = pos;
              p.localSpace = "uv";
            } else {
              const c = data.components.find((c) => c.id === id);
              if (c) c.local = pos;
            }
          });
        }}
      >
        <div
          className="face-plane"
          style={{
            width: w,
            height: h,
            transform: `translate(-50%,-50%) rotate(${-rotation}deg) scaleX(${obj.textureFlip ? -1 : 1})`,
          }}
        >
          {photo && <img draggable={false} src={asset(photo.file)} />}{" "}
          {!photo && (
            <span className="face-watermark">
              {obj.id}
              <small>POSITIONAL REFERENCE · UNVERIFIED</small>
            </span>
          )}
          {pins.map((p) => {
            const ni = d.nets.findIndex((n) => n.members.includes(p.id));
            return (
              <button
                key={p.id}
                className={
                  "pin " +
                  (a === p.id ? "anchor " : "") +
                  (b === p.id ? "target " : "") +
                  (flash.includes(p.id) ? "flash" : "")
                }
                style={
                  {
                    ...position(p.local, p.localSpace === "mm"),
                    "--pin-color": ni < 0 ? "#75857d" : netColor(ni),
                  } as React.CSSProperties
                }
                title={`${p.id}${p.notes ? " · " + p.notes : ""}`}
                onPointerDown={(e) => {
                  if (tool === "arrange" && !exhibit) {
                    drag.current = p.id;
                    e.currentTarget.setPointerCapture(e.pointerId);
                    setEditPin(p.id);
                  }
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  if (tool !== "arrange") onPin(p.id);
                }}
              >
                <span
                  style={{
                    transform: `translateX(-50%) scaleX(${obj.textureFlip ? -1 : 1}) rotate(${rotation}deg)`,
                  }}
                >
                  {p.label.replaceAll("_", " ")}
                </span>
              </button>
            );
          })}
          {components.map((c) => (
            <div
              key={c.id}
              className="component-marker"
              style={position(c.local)}
              onPointerDown={(e) => {
                if (tool === "arrange" && !exhibit) {
                  drag.current = c.id;
                  e.currentTarget.setPointerCapture(e.pointerId);
                }
              }}
            >
              <span title={c.part}>{c.label}</span>
              <div>
                {c.pins?.map((p) => (
                  <button
                    key={p.id}
                    title={p.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      onPin(p.id);
                    }}
                    className={a === p.id ? "selected" : ""}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      <footer className="face-caption">
        <span>
          {photo ? `PHOTO ${photo.id}` : "PLACEHOLDER LAYOUT"} ·{" "}
          {exhibit
            ? "REFERENCE VIEW"
            : tool === "probe"
              ? "Click an endpoint to probe"
              : tool === "arrange"
                ? "Drag markers to correct placement"
                : `Click to add ${tool}`}
        </span>
        {photo && (
          <button
            title="Open original photo"
            onClick={() => onLightbox(photo.file)}
          >
            <Maximize2 size={13} />
          </button>
        )}
      </footer>
      {editing && tool === "arrange" && !exhibit && (
        <div className="pin-editor">
          <strong>{editing.id}</strong>
          <label>
            Label
            <input
              key={editing.id + editing.label}
              defaultValue={editing.label}
              onBlur={(e) =>
                s.mutate((data) => {
                  data.pins.find((p) => p.id === editing.id)!.label =
                    e.target.value;
                })
              }
            />
          </label>
          <label>
            Notes
            <input
              key={editing.id + editing.notes}
              defaultValue={editing.notes || ""}
              onBlur={(e) =>
                s.mutate((data) => {
                  data.pins.find((p) => p.id === editing.id)!.notes =
                    e.target.value;
                })
              }
            />
          </label>
        </div>
      )}
    </section>
  );
}
