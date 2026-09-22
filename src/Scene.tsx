import { Suspense, useRef, useEffect, useState } from "react";
import {
  Canvas,
  useFrame,
  useThree,
  type ThreeEvent,
} from "@react-three/fiber";
import {
  OrbitControls,
  Html,
  Edges,
  TransformControls,
  GizmoHelper,
  GizmoViewport,
  Line,
} from "@react-three/drei";
import * as THREE from "three";
import { useStore, exhibit, asset, updatePose } from "./store";
import { usePhotoAspect, facePoint, faceUV, knownAspect } from "./faceGeometry";
import type { Obj, Compartment, Pose } from "./schema";
export const colors = {
  PHOTO: "#438397",
  MEAS: "#258374",
  GUESS: "#b18b45",
  CONFLICT: "#c15454",
};
export const netColor = (i: number) =>
  ["#14877a", "#bf7642", "#597abd", "#aa61a0", "#8e943c", "#408caa"][i % 6];
function Texture({ obj }: { obj: Obj }) {
  const data = useStore((s) => s.data)!;
  const photo = data.photos.find((p) => p.id === obj.faceTexture);
  const [texture, setTexture] = useState<THREE.Texture>();
  useEffect(() => {
    let cancelled = false;
    let t: THREE.Texture | undefined;
    if (!photo) return;
    new THREE.TextureLoader().load(
      asset(photo.file),
      (original) => {
        const img = original.image;
        const canvas = document.createElement("canvas");
        const scale = Math.min(1, 2048 / Math.max(img.width, img.height));
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        canvas
          .getContext("2d")!
          .drawImage(img, 0, 0, canvas.width, canvas.height);
        original.dispose();
        t = new THREE.CanvasTexture(canvas);
        t.colorSpace = THREE.SRGBColorSpace;
        if (!cancelled) setTexture(t);
        else t.dispose();
      },
      undefined,
      () =>
        useStore.getState().set({
          error: `Photo ${photo.id} could not load on ${obj.id}. Select the object and attach the JPEG again, or restore public/${photo.file} and reload the page.`,
        }),
    );
    return () => {
      cancelled = true;
      t?.dispose();
    };
  }, [photo?.file]);
  if (!texture) return null;
  const rotated = (obj.textureRotation || 0) % 180 !== 0;
  const aspect = rotated
    ? texture.image.height / texture.image.width
    : texture.image.width / texture.image.height;
  let w = obj.size[0],
    h = w / aspect;
  if (h > obj.size[1]) {
    h = obj.size[1];
    w = h * aspect;
  }
  return (
    <mesh
      position={[0, 0, obj.size[2] / 2 + 0.15]}
      rotation={[0, 0, ((obj.textureRotation || 0) * Math.PI) / 180]}
      scale={[obj.textureFlip ? -1 : 1, 1, 1]}
    >
      <planeGeometry args={rotated ? [h, w] : [w, h]} />
      <meshBasicMaterial map={texture} side={THREE.DoubleSide} />
    </mesh>
  );
}
function Item({
  obj,
  shell = false,
  onPin,
  onFace,
}: {
  obj: Obj | Compartment;
  shell?: boolean;
  onPin: (id: string) => void;
  onFace: (id: string, uv: [number, number], component: boolean) => void;
}) {
  const s = useStore();
  const photo = s.data!.photos.find((p) => p.id === (obj as Obj).faceTexture);
  const aspect = usePhotoAspect(photo ? asset(photo.file) : undefined);
  const group = useRef<THREE.Group>(null);
  const original = useRef<Pose>(obj.pose);
  const [hover, setHover] = useState(false);
  const active = s.selected === obj.id;
  const dim = s.highlight.length > 0 && !s.highlight.includes(obj.id);
  const editing = active && s.edit && !exhibit;
  useEffect(() => {
    if (!editing) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && group.current) {
        group.current.position.fromArray(original.current.position);
        group.current.rotation.set(...original.current.rotation);
        group.current.scale.fromArray(original.current.scale);
        updatePose(obj.id, structuredClone(original.current));
        s.set({ axis: "" });
      }
      if (e.key === "Enter" && group.current) commit();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [editing, obj]);
  function commit() {
    if (!group.current) return;
    const g = group.current;
    const pose = {
      position: g.position.toArray(),
      rotation: [g.rotation.x, g.rotation.y, g.rotation.z],
      scale: g.scale.toArray(),
    } as Pose;
    updatePose(obj.id, pose);
  }
  const pins = [
    ...s.data!.pins.filter((p) => p.object === obj.id),
    ...s
      .data!.components.filter((c) => c.object === obj.id)
      .flatMap((c) =>
        (c.pins || []).map((p, i) => ({
          ...p,
          object: c.object,
          local: [
            c.local[0] + ((i % 2) * 2 - 1) * 0.035,
            c.local[1] +
              (Math.floor(i / 2) - (c.pins!.length / 2 - 1) / 2) * 0.025,
          ] as [number, number],
          localSpace: "uv" as const,
        })),
      ),
  ];
  const click = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    if (!exhibit && (e.shiftKey || e.altKey) && !shell) {
      const local = group.current!.worldToLocal(e.point.clone());
      onFace(obj.id, faceUV(obj as Obj, local.x, local.y, aspect), e.altKey);
    } else s.select(obj.id);
  };
  return (
    <>
      <group
        ref={group}
        position={obj.pose.position}
        rotation={obj.pose.rotation}
        scale={obj.pose.scale}
      >
        <mesh
          onClick={click}
          onPointerOver={(e) => {
            e.stopPropagation();
            setHover(true);
          }}
          onPointerOut={() => setHover(false)}
        >
          {shell && "shape" in obj && obj.shape === "cylinder" ? (
            <cylinderGeometry
              args={[obj.size[0] / 2, obj.size[2] / 2, obj.size[1], 48]}
            />
          ) : (
            <boxGeometry args={obj.size} />
          )}
          <meshStandardMaterial
            color={
              active
                ? "#b9d7d0"
                : shell
                  ? "#c3ccca"
                  : (obj as Obj).kind === "board"
                    ? "#d4dcc6"
                    : (obj as Obj).kind === "connector"
                      ? "#97aaa0"
                      : "#b5c2b9"
            }
            transparent
            opacity={dim ? 0.06 : shell ? 0.08 : 0.78}
            depthWrite={!shell}
          />
          <Edges
            color={active ? "#138273" : shell ? "#b3bfbc" : colors[obj.status]}
            transparent
            opacity={dim ? 0.1 : shell ? 0.38 : 0.8}
          />
        </mesh>
        {!shell && Boolean((obj as Obj).faceTexture) && (
          <Texture obj={obj as Obj} />
        )}{" "}
        {(active || hover) && !dim && (
          <Html
            position={[0, obj.size[1] / 2 + 8, 0]}
            center
            distanceFactor={700}
          >
            <button
              className={"scene-label " + (active ? "active" : "")}
              onClick={() => s.select(obj.id)}
            >
              {obj.id}
              {hover && <span>{obj.label}</span>}
            </button>
          </Html>
        )}
        {!shell &&
          pins.map((p) => {
            const pos = facePoint(obj as Obj, p.local, p.localSpace, aspect);
            const ni = s.data!.nets.findIndex((n) => n.members.includes(p.id));
            return (
              <mesh
                key={p.id}
                position={pos}
                onClick={(e) => {
                  e.stopPropagation();
                  onPin(p.id);
                }}
              >
                <sphereGeometry args={[active ? 2 : 1.4, 10, 10]} />
                <meshBasicMaterial color={ni < 0 ? "#e5e9df" : netColor(ni)} />
              </mesh>
            );
          })}
      </group>
      {editing && group.current && (
        <TransformControls
          object={group.current}
          mode={s.mode}
          showX={!s.axis || s.axis === "X"}
          showY={!s.axis || s.axis === "Y"}
          showZ={!s.axis || s.axis === "Z"}
          translationSnap={s.snap ? 10 : null}
          rotationSnap={s.snap ? Math.PI / 12 : null}
          onMouseDown={() => {
            original.current = structuredClone(obj.pose);
          }}
          onMouseUp={commit}
        />
      )}
    </>
  );
}
function Camera() {
  const s = useStore();
  const controls = useRef<any>(null);
  const { camera } = useThree();
  const flight = useRef<{
    start: number;
    from: THREE.Vector3;
    target: THREE.Vector3;
    to: THREE.Vector3;
    dest: THREE.Vector3;
  } | null>(null);
  useEffect(() => {
    if (s.focus)
      flight.current = {
        start: performance.now(),
        from: camera.position.clone(),
        target: controls.current.target.clone(),
        to: new THREE.Vector3(...s.focus.position),
        dest: new THREE.Vector3(...s.focus.target),
      };
  }, [s.focus]);
  useFrame(() => {
    const f = flight.current;
    if (f) {
      const t = Math.min(1, (performance.now() - f.start) / 600),
        ease = t * t * (3 - 2 * t);
      camera.position.lerpVectors(f.from, f.to, ease);
      controls.current.target.lerpVectors(f.target, f.dest, ease);
      controls.current.update();
      if (t === 1) {
        flight.current = null;
        s.set({
          camera: {
            position: camera.position.toArray(),
            target: controls.current.target.toArray(),
          },
        });
      }
    }
  });
  return (
    <OrbitControls
      ref={controls}
      makeDefault
      target={[0, 0, 260]}
      minDistance={30}
      maxDistance={2200}
      onEnd={() =>
        s.set({
          camera: {
            position: camera.position.toArray(),
            target: controls.current.target.toArray(),
          },
        })
      }
    />
  );
}
export function Scene({
  onPin,
  onFace,
}: {
  onPin: (id: string) => void;
  onFace: (id: string, uv: [number, number], component: boolean) => void;
}) {
  const s = useStore();
  const d = s.data!;
  const point = (id: string) => {
    const p = d.pins.find((x) => x.id === id);
    const c = d.components.find((x) => x.pins?.some((q) => q.id === id));
    const obj = d.objects.find((x) => x.id === (p?.object || c?.object));
    if (!obj) return null;
    const uv = p?.local || c!.local;
    const file = d.photos.find((x) => x.id === obj.faceTexture)?.file;
    const v = new THREE.Vector3(
      ...facePoint(
        obj,
        uv,
        p?.localSpace,
        knownAspect(file ? asset(file) : undefined),
      ),
    );
    return v
      .multiply(new THREE.Vector3(...obj.pose.scale))
      .applyEuler(new THREE.Euler(...obj.pose.rotation))
      .add(new THREE.Vector3(...obj.pose.position));
  };
  return (
    <Canvas
      camera={{ position: [-550, 370, 900], fov: 42, near: 1, far: 5000 }}
      gl={{ antialias: true }}
    >
      <color attach="background" args={["#edf0ed"]} />
      <ambientLight intensity={2} />
      <directionalLight position={[300, 700, 400]} intensity={3} />
      <Suspense fallback={null}>
        {d.compartments.map((o) => (
          <Item key={o.id} obj={o} shell onPin={onPin} onFace={onFace} />
        ))}
        {d.objects.map((o) => (
          <Item key={o.id} obj={o} onPin={onPin} onFace={onFace} />
        ))}
        {s.lines &&
          d.nets.flatMap((n, i) => {
            const pts = n.members
              .map(point)
              .filter((x): x is THREE.Vector3 => !!x);
            return pts
              .slice(1)
              .map((p, j) => (
                <Line
                  key={n.id + j}
                  points={[pts[0], p]}
                  color={netColor(i)}
                  lineWidth={1.5}
                />
              ));
          })}
      </Suspense>
      <gridHelper
        args={[1000, 20, "#d4dcd7", "#e0e5e0"]}
        position={[0, -170, 260]}
      />
      <Camera />
      <GizmoHelper alignment="bottom-right" margin={[65, 70]}>
        <GizmoViewport
          axisColors={["#b36e5b", "#6f9278", "#65869f"]}
          labelColor="white"
        />
      </GizmoHelper>
    </Canvas>
  );
}
