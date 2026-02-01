import { Suspense, useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Environment, Grid, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { useRobotStore } from '../hooks/useRobotModel';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';

const MODEL_PATH = '/models/utra_robot.gltf';

const HIGHLIGHT_COLOR = new THREE.Color('#c026d3');
const LERP_SPEED = 0.5;
const MOVE_ACCEL = 5;
const MOVE_DAMPING = 5;
const MAX_SPEED = 4.2;
const MAX_REVERSE = 2.6;
const TURN_RATE = 2.6;
const BOOST_MULT = 1.6;
const WHEEL_SPIN_FACTOR = 8;
const SMOKE_MAX = 160;
const SMOKE_SPAWN_RATE = 22;
const SMOKE_RISE = 0.8;
const SMOKE_DRIFT = 0.25;
const SMOKE_DECAY = 1.2;
const UP_AXIS = new THREE.Vector3(0, 1, 0);
const GRASS_SIZE = 300;
const GRASS_REPEAT = 100;
const GRASS_BLADE_COUNT = 2200;
const GRASS_BLADE_HEIGHT = 0.25;
const GRASS_BLADE_WIDTH = 0.04;

const carPoseRef = {
  position: new THREE.Vector3(),
  heading: 0,
};

const cameraTransitionRef = {
  active: false,
};

// Add wheel mesh IDs here — click a wheel in the viewer to find its partId
const WHEEL_PART_IDS: string[] = ["wheel-1", "wheel-2"];
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
  const cameraMode = useRobotStore((s) => s.cameraMode);
  const { camera, controls } = useThree();

  const speedRef = useRef(0);
  const headingRef = useRef(0);
  const headingInitRef = useRef(false);
  const baseHeadingRef = useRef(0);
  const baseForwardRef = useRef(new THREE.Vector3(0, 0, -1));
  const keysRef = useRef({
    forward: false,
    back: false,
    left: false,
    right: false,
    boost: false,
  });
  const smokeDataRef = useRef<{
    positions: Float32Array;
    colors: Float32Array;
    velocities: Float32Array;
    life: Float32Array;
    cursor: number;
  }>({
    positions: new Float32Array(SMOKE_MAX * 3),
    colors: new Float32Array(SMOKE_MAX * 3),
    velocities: new Float32Array(SMOKE_MAX * 3),
    life: new Float32Array(SMOKE_MAX),
    cursor: 0,
  });
  const smokeGeometryRef = useRef<THREE.BufferGeometry>(null);
  const smokeMaterialRef = useRef<THREE.PointsMaterial>(null);

  // Auto-center and scale
  const { scaleFactor, offset, groundY } = useMemo(() => {
    const box = new THREE.Box3().setFromObject(scene);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    const s = 2 / maxDim;
    const bottomY = box.min.y * s + (-center.y * s);
    return {
      scaleFactor: s,
      offset: new THREE.Vector3(-center.x * s, -center.y * s, -center.z * s),
      groundY: bottomY,
    };
  }, [scene]);

  useEffect(() => {
    setGroundY(groundY);
  }, [groundY, setGroundY]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        ['w', 'W', 'a', 'A', 's', 'S', 'd', 'D', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Shift'].includes(
          event.key
        )
      ) {
        event.preventDefault();
      }
      switch (event.key) {
        case 'w':
        case 'W':
        case 'ArrowUp':
          keysRef.current.forward = true;
          break;
        case 's':
        case 'S':
        case 'ArrowDown':
          keysRef.current.back = true;
          break;
        case 'a':
        case 'A':
        case 'ArrowLeft':
          keysRef.current.left = true;
          break;
        case 'd':
        case 'D':
        case 'ArrowRight':
          keysRef.current.right = true;
          break;
        case 'Shift':
          keysRef.current.boost = true;
          break;
        default:
          break;
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      if (
        ['w', 'W', 'a', 'A', 's', 'S', 'd', 'D', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Shift'].includes(
          event.key
        )
      ) {
        event.preventDefault();
      }
      switch (event.key) {
        case 'w':
        case 'W':
        case 'ArrowUp':
          keysRef.current.forward = false;
          break;
        case 's':
        case 'S':
        case 'ArrowDown':
          keysRef.current.back = false;
          break;
        case 'a':
        case 'A':
        case 'ArrowLeft':
          keysRef.current.left = false;
          break;
        case 'd':
        case 'D':
        case 'ArrowRight':
          keysRef.current.right = false;
          break;
        case 'Shift':
          keysRef.current.boost = false;
          break;
        default:
          break;
      }
    };

    const handleBlur = () => {
      keysRef.current.forward = false;
      keysRef.current.back = false;
      keysRef.current.left = false;
      keysRef.current.right = false;
      keysRef.current.boost = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleBlur);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleBlur);
    };
  }, []);

  useEffect(() => {
    const smoke = smokeDataRef.current;
    for (let i = 0; i < SMOKE_MAX; i++) {
      const base = i * 3;
      smoke.positions[base] = 0;
      smoke.positions[base + 1] = -999;
      smoke.positions[base + 2] = 0;
      smoke.colors[base] = 0;
      smoke.colors[base + 1] = 0;
      smoke.colors[base + 2] = 0;
      smoke.life[i] = 0;
    }
  }, []);

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
    const partIdCounts = new Map<string, number>();

    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;

        // Traverse up the parent chain to find the first meaningful named ancestor
        // Skip generic names like "mesh", "group", etc.
        let baseName = '';
        let parent: THREE.Object3D | null = mesh;

        while (parent) {
          const name = parent.name;
          // Skip empty names and generic GLTF names
          // Updated regex to handle multiple underscore-number sequences (e.g., mesh_8_1)
          if (name &&
              name !== 'Scene' &&
              name !== 'UTRA Robot' &&
              !name.match(/^mesh(_\d+)*$/i) &&
              !name.match(/^group(_\d+)*$/i) &&
              !name.match(/^object(_\d+)*$/i)) {
            baseName = name;
            break;
          }
          parent = parent.parent;
        }

        console.log('[Discovery] Found mesh, baseName:', baseName, ', mesh.name:', mesh.name, ', parent.name:', mesh.parent?.name);

        // Skip meshes that don't have a meaningful name
        if (!baseName) {
          console.log('[Discovery] Skipping mesh with no meaningful baseName');
          return;
        }

        mesh.castShadow = true;
        mesh.receiveShadow = true;

        // Make partId unique by adding index if there are multiple meshes with same name
        const count = partIdCounts.get(baseName) || 0;
        partIdCounts.set(baseName, count + 1);
        const partId = count > 0 ? `${baseName}_${count}` : baseName;

        console.log('[Discovery] Assigned partId:', partId, 'to mesh');

        const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
        const isMaterialArray = Array.isArray(mesh.material);
        const uniqueMats = mats.map((material) => material.clone());
        // Ensure each mesh has its own materials so highlighting doesn't affect siblings.
        mesh.material = isMaterialArray ? uniqueMats : uniqueMats[0];

        // Compute world-space center of this mesh for the explode direction
        const meshBox = new THREE.Box3().setFromObject(mesh);
        const meshCenter = meshBox.getCenter(new THREE.Vector3());
        const dir = meshCenter.clone().sub(modelCenter);
        if (dir.length() < 0.001) {
          dir.copy(deterministicDir(entries.length));
        }
        dir.normalize();
        if (partId.startsWith('plate-') && dir.y < 0) {
          dir.y = 0;
          if (dir.lengthSq() < 0.000001) {
            dir.set(0, 1, 0);
          } else {
            dir.normalize();
          }
        }

        // Tag the mesh with its partId immediately during traversal
        mesh.userData.partId = partId;

        entries.push({
          mesh,
          partId,
          originals: uniqueMats.map((m) => m.clone()),
          origPos: mesh.position.clone(),
          explodeDir: dir,
          currentOffset: new THREE.Vector3(0, 0, 0),
        });
      }
    });
    console.log('[RobotViewer] Discovered parts:', entries.map((e) => e.partId));
    return entries;
  }, [scene, modelCenter]);

  const wheelEntries = useMemo(
    () => meshEntries.filter((entry) => WHEEL_PART_IDS.includes(entry.partId)),
    [meshEntries]
  );

  useEffect(() => {
    if (wheelEntries.length < 2) return;
    scene.updateMatrixWorld(true);
    const a = new THREE.Vector3();
    const b = new THREE.Vector3();
    wheelEntries[0].mesh.getWorldPosition(a);
    wheelEntries[1].mesh.getWorldPosition(b);
    const axle = b.sub(a);
    if (axle.lengthSq() < 0.000001) return;
    axle.normalize();
    // Swap cross product arguments to reverse forward direction
    const forward = new THREE.Vector3().crossVectors(axle, UP_AXIS).normalize();
    if (forward.lengthSq() < 0.000001) return;
    baseForwardRef.current.copy(forward);
  }, [wheelEntries, scene]);

  // Each frame: movement, highlight, explode, wheel spin, smoke
  useFrame((_, delta) => {
    if (!headingInitRef.current && groupRef.current) {
      headingRef.current = groupRef.current.rotation.y;
      baseHeadingRef.current = headingRef.current;
      headingInitRef.current = true;
    }

    let speed = speedRef.current;
    let spinDirection = 1;

    if (showGround && groupRef.current) {
      const throttle = (keysRef.current.forward ? 1 : 0) - (keysRef.current.back ? 1 : 0);
      const steer = (keysRef.current.left ? 1 : 0) - (keysRef.current.right ? 1 : 0);
      const boost = keysRef.current.boost && throttle > 0;
      const maxForward = boost ? MAX_SPEED * BOOST_MULT : MAX_SPEED;
      const accelScale = boost ? BOOST_MULT : 1;

      if (throttle !== 0) {
        const accel = throttle > 0 ? MOVE_ACCEL * accelScale : MOVE_ACCEL * 1.4;
        speed += throttle * accel * delta;
      } else {
        const damping = Math.exp(-MOVE_DAMPING * delta);
        speed *= damping;
      }

      if (speed > maxForward) speed = maxForward;
      if (speed < -MAX_REVERSE) speed = -MAX_REVERSE;

      const speedFactor = Math.min(Math.abs(speed) / maxForward, 1);
      if (steer !== 0) {
        const steerDir = speed !== 0 ? Math.sign(speed) : Math.sign(throttle || 1);
        const steerStrength = Math.max(speedFactor, throttle !== 0 ? 0.15 : 0);
        if (steerStrength > 0) {
          headingRef.current += steer * TURN_RATE * steerStrength * steerDir * delta;
        }
      }

      const relativeHeading = headingRef.current - baseHeadingRef.current;
      const forward = baseForwardRef.current.clone().applyAxisAngle(UP_AXIS, relativeHeading);
      const displacement = forward.clone().multiplyScalar(speed * delta);
      groupRef.current.position.add(displacement);
      groupRef.current.rotation.y = headingRef.current;

      if (cameraMode === 'third' && !cameraTransitionRef.active) {
        const orbit = controls as OrbitControlsImpl | undefined;
        if (orbit) {
          orbit.target.add(displacement);
          camera.position.add(displacement);
        }
      }

      spinDirection = Math.sign(speed) || 1;
    } else {
      const damping = Math.exp(-MOVE_DAMPING * delta);
      speed *= damping;
    }

    speedRef.current = speed;
    if (groupRef.current) {
      carPoseRef.position.copy(groupRef.current.position);
      carPoseRef.heading = headingRef.current;
    }

    if (cameraMode === 'first' && groupRef.current) {
      const relativeHeading = headingRef.current - baseHeadingRef.current;
      const forward = baseForwardRef.current.clone().applyAxisAngle(UP_AXIS, relativeHeading);
      const fpOffset = new THREE.Vector3(0, 0.22, -0.1).applyAxisAngle(UP_AXIS, relativeHeading);
      const desiredPos = groupRef.current.position.clone().add(fpOffset);
      const targetPos = groupRef.current.position.clone().add(forward.multiplyScalar(1.2));
      const follow = 1 - Math.exp(-10 * delta);

      camera.position.lerp(desiredPos, follow);
      camera.lookAt(targetPos);

      const orbit = controls as OrbitControlsImpl | undefined;
      if (orbit) {
        orbit.target.lerp(targetPos, follow);
        orbit.update();
      }
    }

    const hasHighlight = highlightedParts.length > 0;
    const pulse = 0.6 + Math.sin(Date.now() * 0.004) * 0.2;

    // Debug: Log once per frame when highlighting is active
    if (hasHighlight && Date.now() % 1000 < 16) {
      console.log('[Highlight] highlightedParts:', highlightedParts);
    }

    for (const entry of meshEntries) {
      const { mesh, partId, originals, origPos, explodeDir, currentOffset } = entry;
      // Extract base part ID from this mesh's partId (remove _0, _1, etc. suffixes)
      const basePartIdForMesh = partId.replace(/_\d+$/, '');
      // Match if the base part ID matches any highlighted part
      const isHighlighted = highlightedParts.some(hp => {
        const hpBase = hp.replace(/_\d+$/, '');
        return basePartIdForMesh === hpBase;
      });

      // Debug: Log highlighting decisions for all parts once
      if (hasHighlight && Date.now() % 2000 < 16) {
        console.log(`[Highlight] partId: ${partId}, basePartId: ${basePartIdForMesh}, isHighlighted: ${isHighlighted}, highlightedParts:`, highlightedParts);
      }

      const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];

      // --- Material: highlight, translucent, or restore ---
      mats.forEach((mat, i) => {
        const std = mat as THREE.MeshStandardMaterial;
        const orig = originals[i] as THREE.MeshStandardMaterial;
        const prevTransparent = std.transparent;

        if (isHighlighted) {
          std.color.copy(HIGHLIGHT_COLOR);
          std.emissive.copy(HIGHLIGHT_COLOR);
          std.emissiveIntensity = pulse * 3;
          // Remove all texture maps to show color
          std.map = null;
          std.normalMap = null;
          std.roughnessMap = null;
          std.metalnessMap = null;
          std.aoMap = null;
          std.emissiveMap = null;
          std.opacity = 1;
          std.transparent = false;
          std.depthWrite = true;
          std.depthTest = true;
          std.blending = THREE.NormalBlending;
          std.wireframe = false;
          std.wireframeLinewidth = orig.wireframeLinewidth;
        } else if (hasHighlight) {
          std.color.copy(orig.color);
          std.emissive.set('#000000');
          std.emissiveIntensity = 0;
          // Restore all texture maps
          std.map = orig.map;
          std.normalMap = orig.normalMap;
          std.roughnessMap = orig.roughnessMap;
          std.metalnessMap = orig.metalnessMap;
          std.aoMap = orig.aoMap;
          std.emissiveMap = orig.emissiveMap;
          std.opacity = 0.6;
          std.transparent = true;
          std.depthWrite = false;
          std.depthTest = true;
          std.blending = THREE.NormalBlending;
          std.wireframe = false;
          std.wireframeLinewidth = orig.wireframeLinewidth;
        } else {
          std.color.copy(orig.color);
          std.emissive.copy(orig.emissive);
          std.emissiveIntensity = orig.emissiveIntensity;
          std.map = orig.map;
          std.normalMap = orig.normalMap;
          std.roughnessMap = orig.roughnessMap;
          std.metalnessMap = orig.metalnessMap;
          std.aoMap = orig.aoMap;
          std.emissiveMap = orig.emissiveMap;
          std.opacity = orig.opacity;
          std.transparent = orig.transparent;
          std.depthWrite = orig.depthWrite;
          std.depthTest = orig.depthTest;
          std.blending = orig.blending;
          std.wireframe = orig.wireframe;
          std.wireframeLinewidth = orig.wireframeLinewidth;
        }

        if (std.transparent !== prevTransparent) {
          std.needsUpdate = true;
        }
      });

      // --- Explode: push non-highlighted parts outward, lerp back when no selection ---
      const targetOffset = new THREE.Vector3();
      if (hasHighlight && !isHighlighted) {
        const explodeWorld = explodeStrength / 100;
        const explodeLocal = explodeWorld / (scaleFactor || 1);
        targetOffset.copy(explodeDir).multiplyScalar(explodeLocal);
      }

      currentOffset.lerp(targetOffset, LERP_SPEED);
      mesh.position.copy(origPos).add(currentOffset);

      // --- Wheel spin: rotate wheel meshes based on speed ---
      const basePartId = partId.replace(/_\d+$/, '');
      if (WHEEL_PART_IDS.includes(basePartId)) {
        const direction = basePartId === 'wheel-2' ? 1 : -1;
        const spin = speed * WHEEL_SPIN_FACTOR * delta * spinDirection;
        // eslint-disable-next-line react-hooks/immutability -- imperative Three.js mutation in useFrame
        mesh.rotation.z += spin * direction;
      }
    }

    if (showGround && wheelEntries.length > 0 && smokeGeometryRef.current && smokeMaterialRef.current) {
      const smoke = smokeDataRef.current;
      const positions = smoke.positions;
      const colors = smoke.colors;
      const velocities = smoke.velocities;
      const life = smoke.life;

      const spawnCount = Math.min(
        wheelEntries.length * 2,
        Math.floor(speed * SMOKE_SPAWN_RATE * delta)
      );

      for (let i = 0; i < spawnCount; i++) {
        const wheel = wheelEntries[i % wheelEntries.length].mesh;
        const wheelPos = new THREE.Vector3();
        wheel.getWorldPosition(wheelPos);

        const idx = smoke.cursor % SMOKE_MAX;
        const base = idx * 3;
        positions[base] = wheelPos.x + (Math.random() - 0.5) * 0.08;
        positions[base + 1] = wheelPos.y + 0.02;
        positions[base + 2] = wheelPos.z + (Math.random() - 0.5) * 0.08;

        velocities[base] = (Math.random() - 0.5) * SMOKE_DRIFT;
        velocities[base + 1] = SMOKE_RISE + Math.random() * 0.4;
        velocities[base + 2] = (Math.random() - 0.5) * SMOKE_DRIFT;

        life[idx] = 1;
        colors[base] = 0.6;
        colors[base + 1] = 0.6;
        colors[base + 2] = 0.6;

        smoke.cursor += 1;
      }

      for (let i = 0; i < SMOKE_MAX; i++) {
        if (life[i] <= 0) continue;
        const base = i * 3;
        positions[base] += velocities[base] * delta;
        positions[base + 1] += velocities[base + 1] * delta;
        positions[base + 2] += velocities[base + 2] * delta;
        velocities[base + 1] += 0.2 * delta;
        life[i] -= SMOKE_DECAY * delta;
        const fade = Math.max(life[i], 0);
        colors[base] = 0.6 * fade;
        colors[base + 1] = 0.6 * fade;
        colors[base + 2] = 0.6 * fade;
        if (life[i] <= 0) {
          positions[base + 1] = -999;
        }
      }

      const positionAttr = smokeGeometryRef.current.getAttribute('position') as THREE.BufferAttribute;
      const colorAttr = smokeGeometryRef.current.getAttribute('color') as THREE.BufferAttribute;
      positionAttr.needsUpdate = true;
      colorAttr.needsUpdate = true;
    }
  });

  // Click handler — use the clicked mesh's partId directly
  const handleClick = (e: { object: THREE.Object3D; stopPropagation: () => void }) => {
    e.stopPropagation();
    const partId = e.object.userData.partId as string | undefined;
    console.log('[Click] Clicked mesh partId:', partId);
    if (partId) {
      // Extract base part ID (remove _0, _1, etc. suffixes from multi-mesh components)
      const basePartId = partId.replace(/_\d+$/, '');
      console.log('[Click] Base partId:', basePartId);
      console.log('[Click] Setting highlightedParts and selectedPart to:', basePartId);
      // Always set both highlighted and selected to ensure sync
      highlightParts([basePartId]);
      selectPart(basePartId);
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
      <points frustumCulled={false}>
        <bufferGeometry ref={smokeGeometryRef}>
          <bufferAttribute
            attach="attributes-position"
            args={[smokeDataRef.current.positions, 3]}
          />
          <bufferAttribute
            attach="attributes-color"
            args={[smokeDataRef.current.colors, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          ref={smokeMaterialRef}
          size={0.05}
          color="#9ca3af"
          vertexColors
          transparent
          opacity={0.6}
          depthWrite={false}
          sizeAttenuation
        />
      </points>
    </>
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

function FocusOnSelection() {
  const selectedPart = useRobotStore((s) => s.selectedPart);
  const cameraMode = useRobotStore((s) => s.cameraMode);
  const { camera, scene, controls } = useThree();
  const focusRef = useRef({
    active: false,
    elapsed: 0,
    duration: 0.65,
    startTarget: new THREE.Vector3(),
    startPosition: new THREE.Vector3(),
    endTarget: new THREE.Vector3(),
    endPosition: new THREE.Vector3(),
  });

  useEffect(() => {
    const orbit = controls as OrbitControlsImpl | undefined;
    if (!orbit || !selectedPart || cameraMode === 'first') {
      focusRef.current.active = false;
      return;
    }

    let targetObject: THREE.Object3D | undefined;
    scene.traverse((obj) => {
      if (!(obj as THREE.Mesh).isMesh) return;
      const partId = (obj.userData.partId as string | undefined) ?? obj.name;
      // Extract base part ID and match with selectedPart
      const basePartId = partId.replace(/_\d+$/, '');
      const selectedBase = selectedPart.replace(/_\d+$/, '');
      if (basePartId === selectedBase) {
        targetObject = obj;
      }
    });

    if (!targetObject) return;
    targetObject.updateWorldMatrix(true, true);

    const box = new THREE.Box3().setFromObject(targetObject);
    const center = box.getCenter(new THREE.Vector3());
    const modelBox = new THREE.Box3().setFromObject(scene);
    const modelCenter = modelBox.getCenter(new THREE.Vector3());
    const sphere = box.getBoundingSphere(new THREE.Sphere());
    const radius = Math.max(sphere.radius, 0.1);
    const distance = Math.max(radius * 4, 0.8);

    const sideDirection = new THREE.Vector3(center.x - modelCenter.x, 0, center.z - modelCenter.z);
    if (sideDirection.lengthSq() < 0.000001) {
      sideDirection.copy(camera.position).sub(orbit.target).setY(0);
      if (sideDirection.lengthSq() < 0.000001) {
        sideDirection.set(1, 0, 1);
      }
    }
    sideDirection.normalize();

    const direction = sideDirection.add(new THREE.Vector3(0, 0.35, 0)).normalize();

    const focusTarget = center.clone();
    focusTarget.y += radius * 0.12;

    focusRef.current.startTarget.copy(orbit.target);
    focusRef.current.startPosition.copy(camera.position);
    focusRef.current.endTarget.copy(focusTarget);
    focusRef.current.endPosition.copy(focusTarget).add(direction.multiplyScalar(distance));
    focusRef.current.elapsed = 0;
    focusRef.current.active = true;
  }, [selectedPart, scene, camera, controls]);

  useFrame((_, delta) => {
    const orbit = controls as OrbitControlsImpl | undefined;
    if (!orbit || !focusRef.current.active) return;
    focusRef.current.elapsed += delta;
    const t = Math.min(focusRef.current.elapsed / focusRef.current.duration, 1);
    const eased = t * t * (3 - 2 * t);
    orbit.target.lerpVectors(focusRef.current.startTarget, focusRef.current.endTarget, eased);
    camera.position.lerpVectors(focusRef.current.startPosition, focusRef.current.endPosition, eased);
    orbit.update();
    if (t >= 1) {
      focusRef.current.active = false;
    }
  });

  return null;
}

function GrassGround({ groundY }: { groundY: number }) {
  const grassTexture = useMemo(() => {
    const size = 128;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.fillStyle = '#4ade80';
    ctx.fillRect(0, 0, size, size);
    ctx.fillStyle = '#22c55e';
    for (let i = 0; i < 1200; i++) {
      const x = Math.random() * size;
      const y = Math.random() * size;
      const h = 2 + Math.random() * 4;
      ctx.fillRect(x, y, 1, h);
    }
    ctx.fillStyle = '#16a34a';
    for (let i = 0; i < 800; i++) {
      const x = Math.random() * size;
      const y = Math.random() * size;
      const h = 1 + Math.random() * 3;
      ctx.fillRect(x, y, 1, h);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.anisotropy = 8;
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.repeat.set(GRASS_REPEAT, GRASS_REPEAT);
    return texture;
  }, []);

  const bladeMatrices = useMemo(() => {
    const transforms: THREE.Matrix4[] = [];
    const temp = new THREE.Object3D();
    for (let i = 0; i < GRASS_BLADE_COUNT; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.random() * (GRASS_SIZE * 0.45);
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      const height = GRASS_BLADE_HEIGHT * (0.6 + Math.random() * 0.6);
      const width = GRASS_BLADE_WIDTH * (0.6 + Math.random() * 0.6);
      const tilt = (Math.random() - 0.5) * 0.4;

      temp.position.set(x, groundY + height * 0.5, z);
      temp.rotation.set(tilt, Math.random() * Math.PI * 2, 0);
      temp.scale.set(width, height, 1);
      temp.updateMatrix();
      transforms.push(temp.matrix.clone());
    }
    return transforms;
  }, [groundY]);

  const bladesRef = useRef<THREE.InstancedMesh>(null);

  useEffect(() => {
    if (!bladesRef.current) return;
    bladeMatrices.forEach((matrix, index) => {
      bladesRef.current!.setMatrixAt(index, matrix);
    });
    bladesRef.current.instanceMatrix.needsUpdate = true;
  }, [bladeMatrices]);

  return (
    <>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, groundY, 0]} receiveShadow>
        <planeGeometry args={[GRASS_SIZE, GRASS_SIZE]} />
        <meshStandardMaterial
          color="#4ade80"
          map={grassTexture ?? undefined}
          roughness={0.9}
          metalness={0}
        />
      </mesh>
      <instancedMesh
        ref={bladesRef}
        args={[undefined, undefined, GRASS_BLADE_COUNT]}
        frustumCulled={false}
        castShadow
        receiveShadow
      >
        <planeGeometry args={[1, 1]} />
        <meshStandardMaterial color="#22c55e" roughness={0.9} metalness={0} side={THREE.DoubleSide} />
      </instancedMesh>
    </>
  );
}

function CameraRig() {
  const cameraMode = useRobotStore((s) => s.cameraMode);
  const { camera, controls } = useThree();
  const lastThirdRef = useRef<{ offset: THREE.Vector3; targetOffset: THREE.Vector3 } | null>(null);
  const transitionRef = useRef<{
    active: boolean;
    elapsed: number;
    duration: number;
    startOffset: THREE.Vector3;
    endOffset: THREE.Vector3;
    startTargetOffset: THREE.Vector3;
    endTargetOffset: THREE.Vector3;
  }>({
    active: false,
    elapsed: 0,
    duration: 0.6,
    startOffset: new THREE.Vector3(),
    endOffset: new THREE.Vector3(),
    startTargetOffset: new THREE.Vector3(),
    endTargetOffset: new THREE.Vector3(),
  });

  useEffect(() => {
    const orbit = controls as OrbitControlsImpl | undefined;
    if (!orbit) return;

    if (cameraMode === 'first') {
      const carPos = carPoseRef.position;
      lastThirdRef.current = {
        offset: camera.position.clone().sub(carPos),
        targetOffset: orbit.target.clone().sub(carPos),
      };
      transitionRef.current.active = false;
      cameraTransitionRef.active = false;
      return;
    }

    if (lastThirdRef.current) {
      const carPos = carPoseRef.position;
      transitionRef.current.active = true;
      cameraTransitionRef.active = true;
      transitionRef.current.elapsed = 0;
      transitionRef.current.startOffset.copy(camera.position).sub(carPos);
      transitionRef.current.endOffset.copy(lastThirdRef.current.offset);
      transitionRef.current.startTargetOffset.copy(orbit.target).sub(carPos);
      transitionRef.current.endTargetOffset.copy(lastThirdRef.current.targetOffset);
    }
  }, [cameraMode, camera, controls]);

  useFrame(() => {
    const orbit = controls as OrbitControlsImpl | undefined;
    if (!orbit) return;
    if (cameraMode !== 'third') return;
    if (transitionRef.current.active) return;
    const carPos = carPoseRef.position;
    lastThirdRef.current = {
      offset: camera.position.clone().sub(carPos),
      targetOffset: orbit.target.clone().sub(carPos),
    };
  });

  useFrame((_, delta) => {
    const orbit = controls as OrbitControlsImpl | undefined;
    if (!orbit) return;
    if (!transitionRef.current.active) {
      cameraTransitionRef.active = false;
      return;
    }

    transitionRef.current.elapsed += delta;
    const t = Math.min(transitionRef.current.elapsed / transitionRef.current.duration, 1);
    const eased = t * t * (3 - 2 * t);

    const carPos = carPoseRef.position;
    const startPos = carPos.clone().add(transitionRef.current.startOffset);
    const endPos = carPos.clone().add(transitionRef.current.endOffset);
    const startTarget = carPos.clone().add(transitionRef.current.startTargetOffset);
    const endTarget = carPos.clone().add(transitionRef.current.endTargetOffset);

    camera.position.lerpVectors(startPos, endPos, eased);
    orbit.target.lerpVectors(startTarget, endTarget, eased);
    orbit.update();

    if (t >= 1) {
      transitionRef.current.active = false;
      cameraTransitionRef.active = false;
    }
  });

  return null;
}

export default function RobotViewer() {
  const clearHighlights = useRobotStore((s) => s.clearHighlights);
  const showGround = useRobotStore((s) => s.showGround);
  const groundY = useRobotStore((s) => s.groundY);
  const cameraMode = useRobotStore((s) => s.cameraMode);
  const controlsRef = useRef<OrbitControlsImpl>(null);

  return (
    <Canvas
      shadows
      camera={{ position: [3, 3, 3], fov: 50 }}
      style={{ width: '100%', height: '100%' }}
      gl={{ antialias: true }}
      onCreated={({ gl }) => {
        gl.shadowMap.enabled = true;
        gl.shadowMap.type = THREE.PCFSoftShadowMap;
      }}
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

      <FocusOnSelection />
      <CameraRig />

      {showGround ? (
        <GrassGround groundY={groundY} />
      ) : (
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
      )}

      <OrbitControls
        ref={controlsRef}
        makeDefault
        enableDamping={cameraMode === 'third'}
        dampingFactor={0.1}
        minDistance={0.5}
        maxDistance={20}
        maxPolarAngle={Math.PI / 2 - 0.05}
        enableRotate={cameraMode === 'third'}
        enablePan={cameraMode === 'third'}
        enableZoom={cameraMode === 'third'}
      />
    </Canvas>
  );
}
