import type { CompanionMode } from '@store/companion';
import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber';
import { Suspense, useEffect, useMemo, useRef } from 'react';
import { Group, MathUtils, Mesh, Object3D, SpotLight, Vector3 } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import type { MutableRefObject } from 'react';

export type CompanionSceneProps = {
  mode: CompanionMode;
  dragging: boolean;
  landing: number;
  walking: boolean;
  onReady: (ready: boolean) => void;
  pointer: MutableRefObject<{ x: number; y: number }>;
  reaction: number;
  reactionKind: 'card' | 'bookmark';
  reducedMotion: boolean;
  active: boolean;
};

function BlenderCompanion({ pointer, reaction, reactionKind, reducedMotion, mode, dragging, landing: landingVersion, walking, onReady }: CompanionSceneProps) {
  const laptopMode = mode === 'laptop';
  const assetPaths = laptopMode
    ? ['/models/devine-bot-cohesive.glb', '/models/devine-accessories-reference.glb', '/models/devine-bot-search-laptop.glb', '/models/devine-laptop-search.glb']
    : ['/models/devine-bot-cohesive.glb', '/models/devine-accessories-reference.glb'];
  const assets = useLoader(GLTFLoader, assetPaths);
  const [gltf, propsGltf, laptopCharacterGltf, laptopGltf] = assets;
  const invalidate = useThree(state => state.invalidate);
  const scene = useThree(state => state.scene);
  useEffect(() => { onReady(true); }, [onReady]);
  const accessories = useMemo(() => { const scene = propsGltf.scene.clone(true); scene.traverse(object => { if (object instanceof Mesh) { object.castShadow = true; object.receiveShadow = true; } }); return scene; }, [propsGltf.scene]);
  const propObjects = useMemo(() => (['Message', 'Thinking', 'Reading', 'Success'] as const).map(name => ({ name, object: accessories.getObjectByName(name) })), [accessories]);
  const propGroup = useRef<Group>(null);
  // Clone object/morph state; cached geometry and textures remain shared.
  const modelSource = laptopMode && laptopCharacterGltf ? laptopCharacterGltf.scene : gltf.scene;
  const model = useMemo(() => { const scene = modelSource.clone(true); scene.traverse(object => { if (object instanceof Mesh) { object.castShadow = true; object.receiveShadow = true; } }); return scene; }, [modelSource]);
  const laptop = useMemo(() => {
    if (!laptopMode || !laptopGltf) return null;
    const scene = laptopGltf.scene.clone(true);
    scene.traverse(object => { if (object instanceof Mesh) { object.castShadow = true; object.receiveShadow = true; } });
    return scene;
  }, [laptopGltf, laptopMode]);
  const eyes = useMemo(() => {
    const meshes: Mesh[] = [];
    model.traverse(object => {
      if (object instanceof Mesh && object.morphTargetDictionary?.Blink !== undefined) meshes.push(object);
    });
    return meshes;
  }, [model]);
  const eyeRestPositions = useMemo(() => eyes.map(mesh => ({ mesh, position: mesh.position.clone(), scale: mesh.scale.clone() })), [eyes]);
  const gaze = useRef({ x: 0, y: 0 });
  const arms = useMemo(() => ({ left: model.getObjectByName('Arm_L'), right: model.getObjectByName('Arm_R') }), [model]);
  const readingArms = useMemo(() => {
    const meshes: Mesh[] = [];
    model.traverse(object => { if (object instanceof Mesh && object.morphTargetDictionary?.Read !== undefined) meshes.push(object); });
    return meshes;
  }, [model]);
  const highlights = useMemo(() => {
    const result: { mesh: Mesh; baseY: number }[] = [];
    model.traverse(object => { if (object instanceof Mesh && object.name.startsWith('EyeHighlight_')) result.push({ mesh: object, baseY: object.position.y }); });
    return result;
  }, [model]);
  const feet = useMemo(() => ['Foot_0', 'Foot_1'].map(name => model.getObjectByName(name)).filter(object => object !== undefined).map(object => ({ object, rotation: object.rotation.clone(), position: object.position.clone() })), [model]);
  const body = useRef<Group>(null);
  const elapsed = useRef(0);
  const wasDragging = useRef(false);
  const grabStarted = useRef(0);
  const previousLanding = useRef(landingVersion);
  const landedAt = useRef(-10);
  const nextBlink = useRef(1.8);
  const blinkStart = useRef(-10);
  const jumpStart = useRef(-10);
  const previousReaction = useRef(reaction);
  const previousMode = useRef(mode);
  const celebrationStart = useRef(0);

  useEffect(() => {
    if (!laptopMode || !laptop) return;
    const screenAnchor = laptop.getObjectByName('Display_light_anchor')
      ?? laptop.getObjectByName('Inset_display')
      ?? laptop.getObjectByName('Screen_chassis');
    const leftEye = model.getObjectByName('Eye_0');
    const rightEye = model.getObjectByName('Eye_1');
    if (!screenAnchor || !leftEye || !rightEye) return;

    laptop.updateWorldMatrix(true, true);
    model.updateWorldMatrix(true, true);
    const lightPosition = screenAnchor.getWorldPosition(new Vector3());
    const targetPosition = leftEye.getWorldPosition(new Vector3()).add(rightEye.getWorldPosition(new Vector3())).multiplyScalar(.5);
    // Keep the light on the camera-facing side of the display so the body does
    // not block the screen light before it reaches the mascot's face.
    lightPosition.z = targetPosition.z + .24;
    targetPosition.y -= .05;
    const light = new SpotLight('#eaf3ff', 1.6, 3, 1.2, 1, 2);
    light.position.copy(lightPosition);
    const target = new Object3D();
    target.position.copy(targetPosition);
    light.target = target;
    scene.add(light, target);
    invalidate();
    return () => { scene.remove(light, target); invalidate(); };
  }, [invalidate, laptop, laptopMode, model, scene]);

  useEffect(() => {
    if (!reducedMotion || !body.current) return;
    body.current.position.y = laptopMode ? 0 : -.02;
    body.current.rotation.set(laptopMode || mode === 'reading' ? 0 : mode === 'message' ? -.10 : 0, 0, mode === 'thinking' ? -.10 : mode === 'message' ? -.11 : 0);
    body.current.scale.setScalar(1);
    for (const { object, rotation, position } of feet) { object.rotation.copy(rotation); object.position.copy(position); }
    body.current.rotation.y = laptopMode ? 0 : .32;
    gaze.current = { x: 0, y: 0 };
    for (const { mesh, position } of eyeRestPositions) mesh.position.copy(position);
    for (const eye of eyes) {
      eye.morphTargetInfluences?.fill(0);
      if (eye.morphTargetInfluences && eye.morphTargetDictionary) {
        eye.morphTargetInfluences[eye.morphTargetDictionary.Blink] = mode === 'thinking' ? .98 : 0;
        eye.morphTargetInfluences[eye.morphTargetDictionary.Happy] = mode === 'success' ? 1 : 0;
      }
    }
    if (propGroup.current) propGroup.current.position.y = 0;
    for (const { mesh, baseY } of highlights) { mesh.visible = mode !== 'success' && mode !== 'thinking'; mesh.position.y = baseY - (mode === 'reading' ? .05 : 0); }
    if (arms.left) arms.left.rotation.set(0, 0, mode === 'reading' || laptopMode ? 0 : mode === 'success' ? -1.55 : -.12);
    if (arms.right) arms.right.rotation.set(0, 0, mode === 'reading' || laptopMode ? 0 : mode === 'success' ? 1.55 : .12);
    for (const arm of readingArms) if (arm.morphTargetInfluences && arm.morphTargetDictionary) arm.morphTargetInfluences[arm.morphTargetDictionary.Read] = mode === 'reading' ? 1 : 0;
    for (const eye of eyes) if (eye.morphTargetInfluences && eye.morphTargetDictionary?.LookDown !== undefined) eye.morphTargetInfluences[eye.morphTargetDictionary.LookDown] = mode === 'reading' ? 1 : laptopMode ? .28 : 0;
    invalidate();
  }, [reducedMotion, eyes, eyeRestPositions, mode, laptopMode, arms, highlights, readingArms, feet, invalidate]);

  useFrame((_, delta) => {
    if (!body.current || reducedMotion) return;
    elapsed.current += Math.min(delta, 0.05);
    const time = elapsed.current;
    if (previousLanding.current !== landingVersion) { previousLanding.current = landingVersion; landedAt.current = time; }
    if (dragging !== wasDragging.current) {
      if (dragging) grabStarted.current = time;
      else { blinkStart.current = time; nextBlink.current = time + 2.8; }
      wasDragging.current = dragging;
    }
    for (const { mesh, scale } of eyeRestPositions) {
      mesh.scale.x = MathUtils.damp(mesh.scale.x, scale.x * (dragging ? 1.12 : 1), 12, delta);
      mesh.scale.y = MathUtils.damp(mesh.scale.y, scale.y * (dragging ? 1.09 : 1), 12, delta);
    }
    for (const { object, rotation, position } of feet) {
      object.rotation.copy(rotation); object.position.copy(position);
    }
    if (dragging) {
      // Two quick surprised blinks on pickup, repeated gently during a long grab.
      const grabAge = (time - grabStarted.current) % 2.8;
      const blinkPulse = (start: number) => {
        const age = grabAge - start;
        return age >= 0 && age < .13 ? Math.sin(age / .13 * Math.PI) : 0;
      };
      const startledBlink = Math.max(blinkPulse(.08), blinkPulse(.30));
      gaze.current.x = MathUtils.damp(gaze.current.x, pointer.current.x * .065, 12, delta);
      gaze.current.y = MathUtils.damp(gaze.current.y, pointer.current.y * .045, 12, delta);
      for (const { mesh, position } of eyeRestPositions) {
        mesh.position.copy(position);
        mesh.position.x += gaze.current.x;
        mesh.position.y += gaze.current.y;
        const weights = mesh.morphTargetInfluences, names = mesh.morphTargetDictionary;
        if (weights && names) {
          weights.fill(0);
          weights[names.Blink] = startledBlink;
        }
      }
      for (const { mesh, baseY } of highlights) {
        mesh.visible = startledBlink < .25;
        mesh.position.y = baseY;
      }
      for (const arm of readingArms) if (arm.morphTargetInfluences && arm.morphTargetDictionary) arm.morphTargetInfluences[arm.morphTargetDictionary.Read] = 0;
      body.current.position.y = .08;
      body.current.scale.set(0.98, 1.04, 0.98);
      body.current.rotation.set(.04, 0, Math.sin(time * 12) * .07);
      if (arms.left) arms.left.rotation.set(Math.sin(time * 17) * .4, 0, -.9 + Math.sin(time * 19) * .55);
      if (arms.right) arms.right.rotation.set(Math.sin(time * 17 + Math.PI) * .4, 0, .9 + Math.sin(time * 19 + Math.PI) * .55);
      feet.forEach(({ object, rotation }, index) => {
        object.rotation.x = rotation.x + Math.sin(time * 21 + index * Math.PI) * .65;
        object.rotation.z = rotation.z + Math.sin(time * 17 + index * Math.PI) * .25;
      });
      if (propGroup.current) propGroup.current.visible = false;
      return;
    }
    if (propGroup.current) propGroup.current.visible = true;
    if (previousMode.current !== mode) {
      previousMode.current = mode;
      celebrationStart.current = time;
    }
    if (previousReaction.current !== reaction) {
      previousReaction.current = reaction;
      jumpStart.current = time;
    }
    if (time >= nextBlink.current) {
      blinkStart.current = time;
      nextBlink.current = time + 2.6 + Math.random() * 3;
    }
    const blinkAge = time - blinkStart.current;
    const blink = blinkAge < 0.22 ? Math.sin(blinkAge / 0.22 * Math.PI) : 0;
    const age = time - jumpStart.current;
    const jumping = age >= 0 && age < 0.85;
    const reading = mode === 'reading' && !jumping;
    // Each celebration hop has a flight and a soft squash on landing.
    const hopPhase = ((time - celebrationStart.current) % .68) / .68;
    const hop = mode === 'success' && hopPhase < .74 ? Math.sin(hopPhase / .74 * Math.PI) : 0;
    const landing = mode === 'success' && hopPhase >= .74 ? Math.sin((hopPhase - .74) / .26 * Math.PI) : 0;
    const bounce = mode === 'success' ? hop : jumping ? Math.sin(age / .85 * Math.PI) : 0;
    const verticalScale = mode === 'success' ? 1 + hop * .08 - landing * .13 : mode === 'reading' ? 1 : 1 + bounce * .09 + Math.sin(time * 1.8) * .003;
    body.current.scale.set(1 - bounce * .04 + landing * .07, verticalScale, 1 - bounce * .04 + landing * .07);
    body.current.position.y = (laptopMode ? 0 : -.02) + bounce * (mode === 'success' ? .52 : reactionKind === 'card' ? .08 : .22) + (verticalScale - 1) * 1.1;
    body.current.rotation.y = MathUtils.damp(body.current.rotation.y, laptopMode ? 0 : .32, 7, delta);
    body.current.rotation.x = MathUtils.damp(body.current.rotation.x, laptopMode || mode === 'reading' ? 0 : mode === 'message' ? -.10 : 0, 5, delta);
    body.current.rotation.z = (mode === 'thinking' ? -.10 : mode === 'message' ? -.11 : 0) + (mode === 'success' ? Math.sin(hopPhase * Math.PI * 2) * .055 : mode === 'reading' || laptopMode ? 0 : Math.sin(time * 1.2) * .007) + (jumping ? Math.sin(age * 12) * 0.07 : 0);
    if (propGroup.current) propGroup.current.position.y = mode === 'message' || mode === 'thinking' ? Math.sin(time * 2) * .035 : 0;
    const waving = jumping && reactionKind !== 'card' ? Math.sin(age * 20) * .32 : 0;
    if (arms.left) {
      arms.left.rotation.x = MathUtils.damp(arms.left.rotation.x, 0, 7, delta);
      arms.left.rotation.y = MathUtils.damp(arms.left.rotation.y, 0, 7, delta);
      arms.left.rotation.z = MathUtils.damp(arms.left.rotation.z, mode === 'reading' || laptopMode ? 0 : mode === 'success' ? -1.55 - hop * .22 : -.12, 7, delta);
    }
    if (arms.right) {
      arms.right.rotation.x = MathUtils.damp(arms.right.rotation.x, mode === 'reading' || laptopMode ? 0 : -.12, 7, delta);
      arms.right.rotation.y = MathUtils.damp(arms.right.rotation.y, 0, 7, delta);
      arms.right.rotation.z = MathUtils.damp(arms.right.rotation.z, jumping && reactionKind !== 'card' ? 1.65 + waving : mode === 'reading' || laptopMode ? 0 : mode === 'success' ? 1.55 + hop * .22 : .12, 10, delta);
    }
    if (walking && !laptopMode) {
      const stride = Math.sin(time * 9);
      const lift = Math.abs(stride);
      body.current.position.x = stride * .055;
      body.current.position.y = -.02 + lift * .085;
      body.current.rotation.y = MathUtils.damp(body.current.rotation.y, -.65 + stride * .07, 7, delta);
      body.current.rotation.z = stride * .13;
      body.current.rotation.x = .035 + lift * .025;
      body.current.scale.set(1 + (1 - lift) * .025, 1 - (1 - lift) * .035, 1);
      if (arms.left) { arms.left.rotation.x = stride * .38; arms.left.rotation.z = -.26 - stride * .14; }
      if (arms.right) { arms.right.rotation.x = -stride * .38; arms.right.rotation.z = .26 - stride * .14; }
      feet.forEach(({ object, rotation }, index) => {
        const step = Math.sin(time * 9 + index * Math.PI);
        object.rotation.x = rotation.x + step * .55;
        object.rotation.z = rotation.z + step * .12;
      });
      if (propGroup.current) propGroup.current.visible = false;
    } else {
      body.current.position.x = MathUtils.damp(body.current.position.x, 0, 10, delta);
    }
    const landingAge = time - landedAt.current;
    if (landingAge >= 0 && landingAge < .42) {
      const squash = Math.sin(landingAge / .42 * Math.PI) * Math.exp(-landingAge * 4);
      body.current.scale.set(1 + squash * .14, 1 - squash * .18, 1 + squash * .10);
      body.current.position.y = -.02 - squash * .18;
    }
    const eyesClosed = mode === 'thinking' || mode === 'success' || (jumping ? reactionKind === 'bookmark' && bounce > .25 : blink > .25);
    // Cursor tracking belongs to the eyes only; keep body and prop poses independent.
    const tracking = mode !== 'thinking' && mode !== 'success' && (!jumping || reactionKind === 'card');
    gaze.current.x = MathUtils.damp(gaze.current.x, tracking ? pointer.current.x * .035 : 0, 9, delta);
    gaze.current.y = MathUtils.damp(gaze.current.y, tracking ? pointer.current.y * .025 : 0, 9, delta);
    for (const { mesh, position } of eyeRestPositions) {
      mesh.position.copy(position);
      mesh.position.x += gaze.current.x;
      mesh.position.y += gaze.current.y;
    }
    for (const { mesh, baseY } of highlights) { mesh.visible = !eyesClosed; mesh.position.y = baseY - (mode === 'reading' ? .05 : 0); }
    for (const arm of readingArms) {
      const weights = arm.morphTargetInfluences; const index = arm.morphTargetDictionary?.Read;
      if (weights && index !== undefined) weights[index] = MathUtils.damp(weights[index], reading ? 1 : 0, 10, delta);
    }
    for (const eye of eyes) {
      const weights = eye.morphTargetInfluences;
      const names = eye.morphTargetDictionary;
      if (!weights || !names) continue;
      if (names.LookDown !== undefined) weights[names.LookDown] = MathUtils.damp(weights[names.LookDown], reading ? 1 : laptopMode ? .28 : 0, 8, delta);
      weights[names.Blink] = jumping || mode === 'success' ? 0 : mode === 'thinking' ? Math.max(.98, blink) : blink;
      if (names.Happy !== undefined) weights[names.Happy] = mode === 'success' ? 1 : jumping && reactionKind === 'bookmark' ? bounce : 0;
    }
  });

  return <group position={[-.45, -.10, 0]}>
    <group ref={body} position={[0, laptopMode ? 0 : -0.02, 0]}>
      <primitive object={model} dispose={null} />
      <group visible={laptopMode}>{laptop && <primitive object={laptop} dispose={null} />}</group>
    </group>
    <group ref={propGroup}>
      {propObjects.map(({ name, object }) => {
        return object ? <group key={name} position={[0, name === 'Success' ? -.10 : name === 'Reading' ? -.035 : 0, 0]} visible={mode === name.toLowerCase()}><primitive object={object} dispose={null} /></group> : null;
      })}
    </group>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[.4, -1.12, .15]} receiveShadow>
      <planeGeometry args={[9, 9]} />
      <shadowMaterial transparent opacity={.12} color="#170e26" depthWrite={false} />
    </mesh>
  </group>;
}

export default function CompanionScene(props: CompanionSceneProps) {
  return <Canvas flat shadows
    aria-hidden="true"
    camera={{ position: [0, 0.28, 5.2], fov: 42 }}
    dpr={[1, 2]}
    frameloop={!props.active ? 'never' : props.reducedMotion ? 'demand' : 'always'}
    gl={{ alpha: true, antialias: true, powerPreference: 'low-power' }}
    style={{ background: 'transparent' }}
    onCreated={({ gl }) => { gl.setClearColor(0x000000, 0); }}
    fallback={<div className="devine-companion-placeholder" aria-hidden="true"><i /><i /></div>}
  >
    <hemisphereLight args={['#eeeaff', '#8b80b5', 1.9]} />
    <directionalLight position={[-3, 5, 4]} intensity={1.7} color="#f1edff" castShadow shadow-mapSize={[1024, 1024]} shadow-camera-left={-3} shadow-camera-right={3} shadow-camera-top={3} shadow-camera-bottom={-3} shadow-camera-near={.1} shadow-camera-far={15} shadow-bias={-.0003} shadow-normalBias={.025} shadow-radius={6} />
    <directionalLight position={[3, 1, -2]} intensity={0.45} color="#b8a7ff" />
    <Suspense fallback={null}><BlenderCompanion {...props} /></Suspense>
  </Canvas>;
}
