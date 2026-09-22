import { useEffect, useState } from "react";
import type { Obj, Pin } from "./schema";
const sizes = new Map<string, number>();
export function usePhotoAspect(file?: string) {
  const [aspect, setAspect] = useState(file ? sizes.get(file) : undefined);
  useEffect(() => {
    if (!file) {
      setAspect(undefined);
      return;
    }
    let cancelled = false;
    const img = new Image();
    img.onload = () => {
      const a = img.naturalWidth / img.naturalHeight;
      sizes.set(file, a);
      if (!cancelled) setAspect(a);
    };
    img.src = file;
    return () => {
      cancelled = true;
    };
  }, [file]);
  return aspect;
}
export function faceSize(o: Obj, aspect?: number): [number, number] {
  if (!aspect) return [o.size[0], o.size[1]];
  const r = (o.textureRotation || 0) % 180 !== 0;
  let w = o.size[r ? 1 : 0],
    h = w / aspect;
  if (h > o.size[r ? 0 : 1]) {
    h = o.size[r ? 0 : 1];
    w = h * aspect;
  }
  return [w, h];
}
export function facePoint(
  o: Obj,
  local: number[],
  space = "uv",
  aspect?: number,
): [number, number, number] {
  if (space === "mm") return [local[0], local[1], o.size[2] / 2 + 1];
  const [w, h] = faceSize(o, aspect),
    r = ((o.textureRotation || 0) * Math.PI) / 180;
  const x = (local[0] - 0.5) * w * (o.textureFlip ? -1 : 1),
    y = (0.5 - local[1]) * h;
  return [
    x * Math.cos(r) - y * Math.sin(r),
    x * Math.sin(r) + y * Math.cos(r),
    o.size[2] / 2 + 1,
  ];
}
export function faceUV(
  o: Obj,
  x: number,
  y: number,
  aspect?: number,
): [number, number] {
  const [w, h] = faceSize(o, aspect),
    r = (-(o.textureRotation || 0) * Math.PI) / 180;
  return [
    Math.max(
      0,
      Math.min(
        1,
        ((x * Math.cos(r) - y * Math.sin(r)) * (o.textureFlip ? -1 : 1)) / w +
          0.5,
      ),
    ),
    Math.max(0, Math.min(1, 0.5 - (x * Math.sin(r) + y * Math.cos(r)) / h)),
  ];
}
export function knownAspect(file?: string) {
  return file ? sizes.get(file) : undefined;
}
