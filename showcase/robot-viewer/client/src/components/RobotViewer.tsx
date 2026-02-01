import { Suspense, useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, Grid, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { useRobotStore } from '../hooks/useRobotModel';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';

const MODEL_PATH = '/models/Buggy.gltf';

const HIGHLIGHT_COLOR = new THREE.Color('#c026d3');
const GREY_COLOR = new THREE.Color('#aaaaaa');
const LERP_SPEED = 0.5;

// Add wheel mesh IDs here — click a wheel in the viewer to find its partId
const WHEEL_PART_IDS: string[] = ["body_113"];
const WHEEL_SPIN_SPEED = 5; // radians per second
// Deterministic fallback direction for meshes at the exact center
function deterministicDir(index: number): THREE.Vector3 {
  const angle = (index + 1) * 2.399963; // golden angle
  return new THREE.Vector3(Math.cos(angle), 0.5, Math.sin(angle)).normalize();
}

function LoadedModel() {
  const { scene } = useGLTF(MODEL_PATH);
  const groupRef = useRef<THREE.Group>(null);

  const highlightedParts = useRobotStore((s) => s.highlightedParts);
  const selectPart = useRobotStore((s) => s.selectPart);
  const highlightParts = useRobotStore((s) => s.highlightParts);
  const explodeStrength = useRobotStore((s) => s.explodeStrength);
  const showGround = useRobotStore((s) => s.showGround);
  const setGroundY = useRobotStore((s) => s.setGroundY);

  // Auto-center and scale
  const { scaleFactor, offset } = useMemo(() => {
    const box = new THREE.Box3().setFromObject(scene);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    const s = 2 / maxDim;
    const bottomY = box.min.y * s + (-center.y * s);
    setGroundY(bottomY);
    return {
      scaleFactor: s,
      offset: new THREE.Vector3(-center.x * s, -center.y * s, -center.z * s),
    };
  }, [scene, setGroundY]);

  // Compute the model-space center for explode directions
  const modelCenter = useMemo(() => {
    const box = new THREE.Box3().setFromObject(scene);
    return box.getCenter(new THREE.Vector3());
  }, [scene]);

  // Collect all meshes — every named mesh is its own selectable part
  const meshEntries = useMemo(() => {
    const entries: {
      mesh: THREE.Mesh;
      partId: string;
      originals: THREE.Material[];
      origPos: THREE.Vector3;
      explodeDir: THREE.Vector3;
      currentOffset: THREE.Vector3;
    }[] = [];
    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        const partId = mesh.name || mesh.parent?.name;
        if (!partId) return;
        const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];

        // Compute world-space center of this mesh for the explode direction
        const meshBox = new THREE.Box3().setFromObject(mesh);
        const meshCenter = meshBox.getCenter(new THREE.Vector3());
        const dir = meshCenter.clone().sub(modelCenter);
        if (dir.length() < 0.001) {
          dir.copy(deterministicDir(entries.length));
        }
        dir.normalize();

        // Tag the mesh with its partId immediately during traversal
        mesh.userData.partId = partId;

        entries.push({
          mesh,
          partId,
          originals: mats.map((m) => m.clone()),
          origPos: mesh.position.clone(),
          explodeDir: dir,
          currentOffset: new THREE.Vector3(0, 0, 0),
        });
      }
    });
    console.log('[RobotViewer] Discovered parts:', entries.map((e) => e.partId));
    return entries;
  }, [scene, modelCenter]);

  // Each frame: highlight selected part, grey out others, animate explode, spin wheels
  useFrame((_, delta) => {
    const hasHighlight = highlightedParts.length > 0;
    const pulse = 0.6 + Math.sin(Date.now() * 0.004) * 0.2;

    for (const entry of meshEntries) {
      const { mesh, partId, originals, origPos, explodeDir, currentOffset } = entry;
      const isHighlighted = highlightedParts.includes(partId);
      const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];

      // --- Material: highlight, grey, or restore ---
      mats.forEach((mat, i) => {
        const std = mat as THREE.MeshStandardMaterial;
        const orig = originals[i] as THREE.MeshStandardMaterial;

        if (isHighlighted) {
          std.emissive.copy(HIGHLIGHT_COLOR);
          std.emissiveIntensity = pulse;
          std.color.copy(orig.color);
          std.opacity = 1;
          std.transparent = false;
          std.depthWrite = true;
        } else if (hasHighlight) {
          std.emissive.set('#000000');
          std.emissiveIntensity = 0;
          std.color.copy(GREY_COLOR);
          std.opacity = 0.4;
          std.transparent = true;
          std.depthWrite = false;
        } else {
          std.emissive.copy(orig.emissive);
          std.emissiveIntensity = orig.emissiveIntensity;
          std.color.copy(orig.color);
          std.opacity = orig.opacity;
          std.transparent = orig.transparent;
          std.depthWrite = true;
        }
      });

      // --- Explode: push non-highlighted parts outward, lerp back when no selection ---
      const targetOffset = new THREE.Vector3();
      if (hasHighlight && !isHighlighted) {
        targetOffset.copy(explodeDir).multiplyScalar(explodeStrength);
      }

      currentOffset.lerp(targetOffset, LERP_SPEED);
      mesh.position.copy(origPos).add(currentOffset);

      // --- Wheel spin: rotate wheel meshes when ground animation is active ---
      if (showGround && WHEEL_PART_IDS.includes(partId)) {
        // eslint-disable-next-line react-hooks/immutability -- imperative Three.js mutation in useFrame
        mesh.rotation.x += WHEEL_SPIN_SPEED * delta;
      }
    }
  });

  // Click handler — use the clicked mesh's partId directly
  const handleClick = (e: { object: THREE.Object3D; stopPropagation: () => void }) => {
    e.stopPropagation();
    const partId = e.object.userData.partId as string | undefined;
    if (partId) {
      highlightParts([partId]);
      selectPart(partId);
    }
  };

  return (
    <>
      <group ref={groupRef}>
        <primitive
          object={scene}
          scale={scaleFactor}
          position={offset}
          onClick={handleClick}
        />
      </group>
    </>
  );
}

const LINE_COUNT = 30;
const LINE_SPREAD = 10;
const LINE_LENGTH = 2;
const LINE_WIDTH = 0.1;
const LINE_SPEED = 10;
const MOVE_DIRECTION = 90; // degrees — 0 = +X, 90 = +Z, etc.

// Pre-compute random positions outside the component to satisfy React purity rules
const INITIAL_LINE_POSITIONS = Array.from({ length: LINE_COUNT }, () => ({
  along: (Math.random() - 0.5) * LINE_SPREAD * 2,
  across: (Math.random() - 0.5) * LINE_SPREAD,
}));

function MovingGroundLines({ groundY }: { groundY: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const rad = (MOVE_DIRECTION * Math.PI) / 180;
  const dirX = Math.cos(rad);
  const dirZ = Math.sin(rad);
  const perpX = -dirZ;
  const perpZ = dirX;

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    const children = groupRef.current.children;
    for (let i = 0; i < children.length; i++) {
      const mesh = children[i];
      // Move along the direction
      mesh.position.x -= dirX * LINE_SPEED * delta;
      mesh.position.z -= dirZ * LINE_SPEED * delta;

      // Project position onto movement axis to check bounds
      const proj = mesh.position.x * dirX + mesh.position.z * dirZ;
      if (proj < -LINE_SPREAD) {
        // Wrap to the other side
        const newAlong = LINE_SPREAD + Math.random() * 2;
        const newAcross = (Math.random() - 0.5) * LINE_SPREAD;
        mesh.position.x = dirX * newAlong + perpX * newAcross;
        mesh.position.z = dirZ * newAlong + perpZ * newAcross;
      }
    }
  });

  return (
    <group ref={groupRef}>
      {INITIAL_LINE_POSITIONS.map((pos, i) => (
        <mesh
          key={i}
          position={[
            dirX * pos.along + perpX * pos.across,
            groundY + 0.001,
            dirZ * pos.along + perpZ * pos.across,
          ]}
          rotation={[-Math.PI / 2, 0, -rad]}
        >
          <planeGeometry args={[LINE_LENGTH, LINE_WIDTH]} />
          <meshBasicMaterial color="#94a3b8" transparent opacity={0.6} />
        </mesh>
      ))}
    </group>
  );
}

function LoadingFallback() {
  return (
    <mesh>
      <boxGeometry args={[0.5, 0.5, 0.5]} />
      <meshStandardMaterial color="#94a3b8" wireframe />
    </mesh>
  );
}

export default function RobotViewer() {
  const clearHighlights = useRobotStore((s) => s.clearHighlights);
  const showGround = useRobotStore((s) => s.showGround);
  const groundY = useRobotStore((s) => s.groundY);
  const controlsRef = useRef<OrbitControlsImpl>(null);

  return (
    <Canvas
      shadows
      camera={{ position: [3, 3, 3], fov: 50 }}
      style={{ width: '100%', height: '100%' }}
      gl={{ antialias: true }}
      onPointerMissed={() => clearHighlights()}
    >
      <color attach="background" args={['#f1f5f9']} />

      <ambientLight intensity={0.4} />
      <directionalLight
        position={[5, 8, 5]}
        intensity={1}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <directionalLight position={[-3, 4, -3]} intensity={0.3} />

      <Environment preset="city" />

      <Suspense fallback={<LoadingFallback />}>
        <LoadedModel />
      </Suspense>

      {showGround && (
        <>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, groundY, 0]} receiveShadow>
            <planeGeometry args={[20, 20]} />
            <meshStandardMaterial color="#e2e8f0" />
          </mesh>
          <MovingGroundLines groundY={groundY} />
        </>
      )}

      <Grid
        args={[20, 20]}
        position={[0, groundY, 0]}
        cellSize={0.5}
        cellThickness={0.5}
        cellColor="#cbd5e1"
        sectionSize={2}
        sectionThickness={1}
        sectionColor="#94a3b8"
        fadeDistance={15}
        fadeStrength={1}
        infiniteGrid
      />

      <OrbitControls
        ref={controlsRef}
        makeDefault
        enableDamping
        dampingFactor={0.1}
        minDistance={0.5}
        maxDistance={20}
        maxPolarAngle={Math.PI / 2 - 0.05}
      />
    </Canvas>
  );
}
