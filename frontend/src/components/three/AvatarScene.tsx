import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import {
  ContactShadows,
  Environment,
  Float,
  MeshDistortMaterial,
} from "@react-three/drei";
import type { Group, Mesh } from "three";
import * as THREE from "three";

interface AvatarSceneProps {
  pointer: { nx: number; ny: number };
  reducedMotion: boolean;
}

/**
 * Placeholder avatar geometry.
 *
 * There is no `Roger.glb` yet, so this renders a stylized abstract figure
 * (a soft distorted core + orbiting rings) that carries the same lighting,
 * scale, and motion rig a real model would use. Once a real asset exists:
 *
 *   const { scene } = useGLTF('/models/Roger.glb');
 *   return <primitive object={scene} scale={1.4} position={[0, -1.2, 0]} />;
 *
 * ...dropped in place of <PlaceholderFigure />, with useGLTF.preload('/models/Roger.glb')
 * called once near the top of this module. The breathing / floating / mouse-follow
 * rig below (on the parent <group>) works unchanged with a real mesh.
 */
function PlaceholderFigure() {
  const coreRef = useRef<Mesh>(null);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (coreRef.current) {
      const material = coreRef.current
        .material as THREE.MeshPhysicalMaterial & { distort: number };
      material.distort = 0.28 + Math.sin(t * 0.6) * 0.06;
    }
  });

  return (
    <mesh ref={coreRef} castShadow>
      <icosahedronGeometry args={[1.05, 6]} />
      <MeshDistortMaterial
        color="#6366F1"
        roughness={0.15}
        metalness={0.3}
        distort={0.28}
        speed={1.4}
        emissive="#3B82F6"
        emissiveIntensity={0.08}
      />
    </mesh>
  );
}

export function AvatarScene({ pointer, reducedMotion }: AvatarSceneProps) {
  const groupRef = useRef<Group>(null);

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    if (reducedMotion) {
      groupRef.current.rotation.y = THREE.MathUtils.lerp(
        groupRef.current.rotation.y,
        0,
        delta * 4,
      );
      groupRef.current.position.y = THREE.MathUtils.lerp(
        groupRef.current.position.y,
        0,
        delta * 4,
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
      delta * 2.2,
    );
    groupRef.current.rotation.x = THREE.MathUtils.lerp(
      groupRef.current.rotation.x,
      targetX,
      delta * 2.2,
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
          <PlaceholderFigure />
        </group>
      </Float>

      <ContactShadows
        position={[0, -1.6, 0]}
        opacity={0.35}
        scale={6}
        blur={2.6}
        far={2}
        color="#000000"
      />
    </>
  );
}
