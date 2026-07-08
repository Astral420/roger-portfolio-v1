import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { ContactShadows, Environment, Float, useGLTF } from "@react-three/drei";
import type { Group } from "three";
import * as THREE from "three";

useGLTF.preload("/models/roger2.glb");

interface AvatarSceneProps {
  pointer: { nx: number; ny: number };
  reducedMotion: boolean;
}

/**
 * Framing controls — tune these three knobs to fit whatever GLB is currently
 * loaded, since every export tool ships a different scale, pivot, and
 * forward-facing direction. No code logic below needs to change, just these
 * numbers, while eyeballing the live result.
 */
// Rotates the model around Y to face the camera. If it's still not facing
// forward, try 0, Math.PI / 2, Math.PI, or -Math.PI / 2.
const MODEL_ROTATION_Y = -Math.PI / 2;
// Which horizontal "slice" of the model's bounding box gets centered in
// frame: 0.5 = full-body vertical center, closer to 1 = crops in toward the
// top of the model (head/shoulders), closer to 0 crops toward the bottom.
const MODEL_VERTICAL_ANCHOR = 0.4;
// Extra zoom multiplier applied after the model is normalized to
// TARGET_HEIGHT. Raise this to zoom in tighter on the anchored area.
const MODEL_ZOOM = 1.2;
// Target height (world units) the model's full bounding box is normalized
// to, before MODEL_ZOOM is applied.
const TARGET_HEIGHT = 2.2;
// Brightens (>1) or darkens (<1) the model's own textures/materials,
// independent of scene lighting. 1 = untouched. This multiplies each
// material's base color, so it scales however dark/light the source
// textures already are.
let MODEL_TEXTURE_EXPOSURE = 1.8;

export function AvatarScene({ pointer, reducedMotion }: AvatarSceneProps) {
  const groupRef = useRef<Group>(null);
  const modelRef = useRef<Group>(null);
  const centeredRef = useRef(false);
  const { scene } = useGLTF("/models/roger2.glb");

  // Every export tool (Blender, Mixamo, Ready Player Me, etc.) ships a GLB
  // with its own arbitrary pivot point and unit scale. Rather than guessing
  // fixed position/scale numbers, measure the model's actual bounding box
  // once it loads, re-center its pivot near the anchored slice, and
  // normalize + zoom its scale so it's framed consistently.
  useEffect(() => {
    if (centeredRef.current || !modelRef.current) return;
    centeredRef.current = true;

    const box = new THREE.Box3().setFromObject(scene);
    const size = new THREE.Vector3();
    box.getSize(size);

    const centerX = (box.min.x + box.max.x) / 2;
    const centerZ = (box.min.z + box.max.z) / 2;
    const anchorY = THREE.MathUtils.lerp(
      box.min.y,
      box.max.y,
      MODEL_VERTICAL_ANCHOR,
    );

    scene.position.set(-centerX, -anchorY, -centerZ);

    const tallestAxis = Math.max(size.y, 0.0001);
    modelRef.current.scale.setScalar(
      (TARGET_HEIGHT / tallestAxis) * MODEL_ZOOM,
    );

    if (MODEL_TEXTURE_EXPOSURE !== 1) {
      scene.traverse((child) => {
        if (!(child instanceof THREE.Mesh)) return;
        const materials = Array.isArray(child.material)
          ? child.material
          : [child.material];
        for (const material of materials) {
          if (
            material instanceof THREE.MeshStandardMaterial ||
            material instanceof THREE.MeshPhysicalMaterial ||
            material instanceof THREE.MeshBasicMaterial ||
            material instanceof THREE.MeshLambertMaterial ||
            material instanceof THREE.MeshPhongMaterial
          ) {
            material.color.multiplyScalar(MODEL_TEXTURE_EXPOSURE);
            material.needsUpdate = true;
          }
        }
      });
    }
  }, [scene]);

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    // Clamp delta so a stalled tab (backgrounded/minimized) resuming with a
    // huge elapsed time doesn't feed a giant timestep into the lerps below
    // and make the model whip around wildly for a moment.
    const dt = Math.min(delta, 1 / 30);
    // Frame-rate independent damping factor: converges toward 1 smoothly and
    // never overshoots the target, unlike a raw `delta * rate` lerp factor.
    const damp = (rate: number) => 1 - Math.exp(-rate * dt);

    if (reducedMotion) {
      groupRef.current.rotation.y = THREE.MathUtils.lerp(
        groupRef.current.rotation.y,
        0,
        damp(4),
      );
      groupRef.current.position.y = THREE.MathUtils.lerp(
        groupRef.current.position.y,
        0,
        damp(4),
      );
      return;
    }

    const t = state.clock.getElapsedTime();

    // Idle breathing
    const breathe = 1 + Math.sin(t * 0.9) * 0.015;
    groupRef.current.scale.setScalar(breathe);

    // Floating
    groupRef.current.position.y = Math.sin(t * 0.7) * 0.12;

    // Mouse-follow rotation, damped
    const targetY = pointer.nx * 0.5;
    const targetX = -pointer.ny * 0.25;
    groupRef.current.rotation.y = THREE.MathUtils.lerp(
      groupRef.current.rotation.y,
      targetY,
      damp(2.2),
    );
    groupRef.current.rotation.x = THREE.MathUtils.lerp(
      groupRef.current.rotation.x,
      targetX,
      damp(2.2),
    );
  });

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[3, 4, 2]} intensity={1.1} castShadow />
      <pointLight position={[-3, -1, -2]} intensity={0.6} color="#3B82F6" />
      <Environment preset="city" environmentIntensity={0.4} />

      <Float
        speed={reducedMotion ? 0 : 1.2}
        rotationIntensity={0}
        floatIntensity={reducedMotion ? 0 : 0.4}
      >
        <group ref={groupRef} position={[0, 0, 0]}>
          <group ref={modelRef} rotation={[0, MODEL_ROTATION_Y, 0]}>
            <primitive object={scene} />
          </group>
        </group>
      </Float>

      <ContactShadows
        position={[0, -1.4, 0]}
        opacity={0.35}
        scale={6}
        blur={2.6}
        far={2}
        color="#000000"
      />
    </>
  );
}
