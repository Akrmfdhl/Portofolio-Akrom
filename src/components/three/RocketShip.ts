import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { PALETTE_NUM } from '../../data/portfolioJourney';
import {
  createAerospaceHullTexture,
  createCeramicHeatShieldTexture,
  createGoldKaptonFoilTexture,
  hashSeed,
} from './proceduralTextures';
import {
  HEADLIGHT_BEAM_FRAGMENT,
  HEADLIGHT_BEAM_VERTEX,
  ROCKET_PLUME_FRAGMENT,
  ROCKET_PLUME_VERTEX,
} from './shaders';

export interface StarshipController {
  root: THREE.Group;
  trailLines: THREE.Object3D[];
  update(
    dt: number,
    elapsed: number,
    progressT: number,
    position: THREE.Vector3,
    tangent: THREE.Vector3,
    nextTangent: THREE.Vector3,
    velocity: number,
    boost: number,
    pointerX: number,
    pointerY: number,
    scaleMultiplier: number,
    nearestPlanetDist?: number
  ): number;
  dispose(): void;
}

export function createStarshipRocket(
  renderer: THREE.WebGLRenderer,
  normalMap: THREE.Texture,
  glowSpriteMap: THREE.Texture,
  trainLiveryMap?: THREE.Texture
): StarshipController {
  const root = new THREE.Group();

  const hullColorMap = createAerospaceHullTexture(renderer);
  const heatShieldMap = createCeramicHeatShieldTexture(renderer);
  const goldFoil = createGoldKaptonFoilTexture(renderer);

  const hullLaquerMat = new THREE.MeshPhysicalMaterial({
    map: hullColorMap,
    color: 0xcfd6df,
    metalness: 0.36,
    roughness: 0.34,
    normalMap,
    normalScale: new THREE.Vector2(0.22, 0.22),
    clearcoat: 0.32,
    clearcoatRoughness: 0.28,
    envMapIntensity: 0.65,
  });

  const brushedSteelMat = new THREE.MeshPhysicalMaterial({
    color: 0xbac4d0,
    metalness: 0.78,
    roughness: 0.28,
    normalMap,
    normalScale: new THREE.Vector2(0.26, 0.26),
    clearcoat: 0.24,
    clearcoatRoughness: 0.28,
    envMapIntensity: 0.72,
  });

  const heatShieldMat = new THREE.MeshStandardMaterial({
    map: heatShieldMap,
    bumpMap: heatShieldMap,
    bumpScale: 0.016,
    color: 0x1a202c,
    metalness: 0.2,
    roughness: 0.82,
    normalMap,
    normalScale: new THREE.Vector2(0.32, 0.32),
  });

  const goldKaptonMat = new THREE.MeshStandardMaterial({
    map: goldFoil.map,
    bumpMap: goldFoil.bumpMap,
    bumpScale: 0.02,
    color: 0xd99b18,
    metalness: 0.76,
    roughness: 0.34,
    envMapIntensity: 0.75,
  });

  const inconelNozzleMat = new THREE.MeshStandardMaterial({
    color: 0x3f3934,
    metalness: 0.84,
    roughness: 0.34,
    normalMap,
    normalScale: new THREE.Vector2(0.35, 0.35),
    emissive: 0x261004,
    emissiveIntensity: 0.18,
  });

  const opticalGlassMat = new THREE.MeshPhysicalMaterial({
    color: 0x0a1626,
    metalness: 0.12,
    roughness: 0.1,
    clearcoat: 0.75,
    clearcoatRoughness: 0.08,
    envMapIntensity: 0.9,
  });

  const carPaintMat = new THREE.MeshPhysicalMaterial({
    color: 0x1e40af,
    metalness: 0.66,
    roughness: 0.26,
    normalMap,
    normalScale: new THREE.Vector2(0.1, 0.1),
    clearcoat: 0.68,
    clearcoatRoughness: 0.16,
    envMapIntensity: 0.82,
  });

  const tireRubberMat = new THREE.MeshStandardMaterial({
    color: 0x16181c,
    metalness: 0.05,
    roughness: 0.88,
  });

  const trainWhiteMat = new THREE.MeshPhysicalMaterial({
    color: 0xdbe2ec,
    metalness: 0.24,
    roughness: 0.3,
    clearcoat: 0.48,
    clearcoatRoughness: 0.18,
    envMapIntensity: 0.72,
  });

  const trainLiveryMat = new THREE.MeshPhysicalMaterial({
    map: trainLiveryMap ?? null,
    color: 0xffffff,
    metalness: 0.22,
    roughness: 0.3,
    clearcoat: 0.45,
    clearcoatRoughness: 0.2,
    envMapIntensity: 0.68,
  });

  const trainBlueStripeMat = new THREE.MeshStandardMaterial({
    color: 0x1d4ed8,
    metalness: 0.48,
    roughness: 0.32,
  });

  const crimsonAccentMat = new THREE.MeshStandardMaterial({
    color: 0xa91b1b,
    metalness: 0.42,
    roughness: 0.34,
  });

  const chromeReflectorMat = new THREE.MeshStandardMaterial({
    color: 0xe2e8f0,
    metalness: 0.96,
    roughness: 0.08,
    envMapIntensity: 1.0,
  });

  const clearLampLensMat = new THREE.MeshPhysicalMaterial({
    color: 0xdbeafe,
    metalness: 0.08,
    roughness: 0.06,
    clearcoat: 1.0,
    clearcoatRoughness: 0.05,
    transparent: true,
    opacity: 0.62,
  });

  const rubyLensMat = new THREE.MeshPhysicalMaterial({
    color: 0x88131d,
    metalness: 0.1,
    roughness: 0.1,
    clearcoat: 0.95,
    transparent: true,
    opacity: 0.72,
  });

  const emitterWarmMat = new THREE.MeshStandardMaterial({
    color: 0xfff3c4,
    emissive: 0xffdf80,
    emissiveIntensity: 2.0,
    roughness: 0.15,
  });

  const emitterRubyMat = new THREE.MeshStandardMaterial({
    color: 0xff2a38,
    emissive: 0xe11d48,
    emissiveIntensity: 1.85,
    roughness: 0.2,
  });

  const boosterEmberMat = new THREE.MeshStandardMaterial({
    color: 0x161920,
    emissive: 0xff6b00,
    emissiveIntensity: 0,
    roughness: 0.35,
  });

  const navPortRedMat = new THREE.MeshStandardMaterial({
    color: 0xef4444,
    emissive: 0xdc2626,
    emissiveIntensity: 1.2,
    roughness: 0.2,
  });

  const navStarboardGreenMat = new THREE.MeshStandardMaterial({
    color: 0x10b981,
    emissive: 0x059669,
    emissiveIntensity: 1.2,
    roughness: 0.2,
  });

  const chamberGlowMat = new THREE.MeshBasicMaterial({
    color: 0xf59e0b,
  });

  const carGroup = new THREE.Group();
  root.add(carGroup);

  const fallbackCarGroup = new THREE.Group();
  carGroup.add(fallbackCarGroup);

  const porscheContainer = new THREE.Group();
  porscheContainer.visible = false;
  carGroup.add(porscheContainer);

  const dracoLoader = new DRACOLoader();
  dracoLoader.setDecoderPath('/assets/draco/');
  const gltfLoader = new GLTFLoader().setDRACOLoader(dracoLoader);

  const porscheSpinPivots: THREE.Group[] = [];
  const porscheSteerPivots: THREE.Group[] = [];
  let carDisposed = false;
  let porscheLoadedScene: THREE.Group | null = null;

  const carBodyShape = new THREE.Shape();
  carBodyShape.moveTo(-0.92, -0.05);
  carBodyShape.lineTo(0.92, -0.05);
  carBodyShape.lineTo(0.95, 0.11);
  carBodyShape.lineTo(0.7, 0.18);
  carBodyShape.lineTo(0.32, 0.38);
  carBodyShape.lineTo(-0.22, 0.39);
  carBodyShape.lineTo(-0.56, 0.21);
  carBodyShape.lineTo(-0.94, 0.11);
  carBodyShape.closePath();

  const carBodyGeo = new THREE.ExtrudeGeometry(carBodyShape, {
    steps: 1,
    depth: 0.76,
    bevelEnabled: true,
    bevelThickness: 0.04,
    bevelSize: 0.035,
    bevelSegments: 3,
  });
  carBodyGeo.translate(0, 0, -0.38);
  carBodyGeo.rotateY(Math.PI / 2);
  const carBodyMesh = new THREE.Mesh(carBodyGeo, carPaintMat);

  const carCabinShape = new THREE.Shape();
  carCabinShape.moveTo(-0.48, 0.185);
  carCabinShape.lineTo(0.56, 0.17);
  carCabinShape.lineTo(0.28, 0.365);
  carCabinShape.lineTo(-0.2, 0.375);
  carCabinShape.closePath();

  const carCabinGeo = new THREE.ExtrudeGeometry(carCabinShape, {
    steps: 1,
    depth: 0.64,
    bevelEnabled: true,
    bevelThickness: 0.025,
    bevelSize: 0.02,
    bevelSegments: 2,
  });
  carCabinGeo.translate(0, 0, -0.32);
  carCabinGeo.rotateY(Math.PI / 2);
  const carCabinMesh = new THREE.Mesh(carCabinGeo, opticalGlassMat);

  const carGrille = new THREE.Mesh(
    new THREE.BoxGeometry(0.46, 0.085, 0.04),
    heatShieldMat
  );
  carGrille.position.set(0, 0.03, -0.96);

  const frontSplitter = new THREE.Mesh(
    new THREE.BoxGeometry(0.84, 0.035, 0.24),
    heatShieldMat
  );
  frontSplitter.position.set(0, -0.06, -0.88);

  const rearDiffuser = new THREE.Mesh(
    new THREE.BoxGeometry(0.82, 0.055, 0.2),
    heatShieldMat
  );
  rearDiffuser.position.set(0, -0.045, 0.88);

  const spoilerBlade = new THREE.Mesh(
    new THREE.BoxGeometry(0.8, 0.024, 0.15),
    heatShieldMat
  );
  spoilerBlade.position.set(0, 0.27, 0.82);
  const spoilerStrutL = new THREE.Mesh(
    new THREE.BoxGeometry(0.026, 0.11, 0.08),
    brushedSteelMat
  );
  spoilerStrutL.position.set(-0.24, 0.2, 0.82);
  const spoilerStrutR = spoilerStrutL.clone();
  spoilerStrutR.position.x = 0.24;

  const mirrorGeo = new THREE.BoxGeometry(0.11, 0.045, 0.07);
  const mirrorL = new THREE.Mesh(mirrorGeo, carPaintMat);
  mirrorL.position.set(-0.44, 0.22, -0.26);
  const mirrorR = mirrorL.clone();
  mirrorR.position.x = 0.44;

  const exhaustPipeGeo = new THREE.CylinderGeometry(0.032, 0.032, 0.1, 12);
  exhaustPipeGeo.rotateX(Math.PI / 2);
  const tailpipeL = new THREE.Mesh(exhaustPipeGeo, brushedSteelMat);
  tailpipeL.position.set(-0.29, -0.038, 0.96);
  const tailpipeR = tailpipeL.clone();
  tailpipeR.position.x = 0.29;

  const carReflectorGeo = new THREE.LatheGeometry(
    [
      new THREE.Vector2(0.004, 0),
      new THREE.Vector2(0.024, 0.01),
      new THREE.Vector2(0.034, 0.03),
    ],
    16
  );
  carReflectorGeo.rotateX(-Math.PI / 2);

  const carBeamConeGeo = new THREE.CylinderGeometry(0.032, 0.36, 3.0, 20, 1, true);
  carBeamConeGeo.rotateX(Math.PI / 2);
  const carBeamConeMat = new THREE.ShaderMaterial({
    uniforms: {
      uColor: { value: new THREE.Color(0xfff1c2) },
      uOpacity: { value: 0.24 },
    },
    vertexShader: HEADLIGHT_BEAM_VERTEX,
    fragmentShader: HEADLIGHT_BEAM_FRAGMENT,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.DoubleSide,
  });

  [-0.31, 0.31].forEach((hx) => {
    const pod = new THREE.Group();
    pod.position.set(hx, 0.088, -0.895);

    const lampHalo = new THREE.Mesh(
      new THREE.PlaneGeometry(0.2, 0.12),
      new THREE.MeshBasicMaterial({
        map: glowSpriteMap,
        color: 0xfef3c7,
        transparent: true,
        opacity: 0.32,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      })
    );
    lampHalo.position.z = -0.025;
    lampHalo.rotation.y = Math.PI;

    const beamCone = new THREE.Mesh(carBeamConeGeo, carBeamConeMat);
    beamCone.position.set(0, -0.04, -1.62);

    pod.add(lampHalo, beamCone);
    carGroup.add(pod);

    const fallbackPod = new THREE.Group();
    fallbackPod.position.copy(pod.position);
    const housing = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.068, 0.052), heatShieldMat);
    const chromeBezel = new THREE.Mesh(new THREE.BoxGeometry(0.168, 0.056, 0.02), chromeReflectorMat);
    chromeBezel.position.z = -0.018;
    [-0.04, 0.04].forEach((ox) => {
      const bowl = new THREE.Mesh(carReflectorGeo, chromeReflectorMat);
      bowl.position.set(ox, 0, -0.01);
      const emitter = new THREE.Mesh(new THREE.SphereGeometry(0.015, 10, 10), emitterWarmMat);
      emitter.position.set(ox, 0, -0.02);
      fallbackPod.add(bowl, emitter);
    });
    const lens = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.05, 0.016), clearLampLensMat);
    lens.position.z = -0.028;
    fallbackPod.add(housing, chromeBezel, lens);
    fallbackCarGroup.add(fallbackPod);
  });

  const carHeadSpot = new THREE.SpotLight(0xfff1d0, 2.4, 16, 0.45, 0.7, 1.4);
  carHeadSpot.position.set(0, 0.14, -0.94);
  const carHeadSpotTarget = new THREE.Object3D();
  carHeadSpotTarget.position.set(0, -0.18, -7.0);
  carHeadSpot.target = carHeadSpotTarget;
  carGroup.add(carHeadSpot, carHeadSpotTarget);

  const taillightPod = new THREE.Group();
  taillightPod.position.set(0, 0.132, 0.948);
  const tailHousing = new THREE.Mesh(new THREE.BoxGeometry(0.76, 0.056, 0.042), heatShieldMat);
  const tailBackplate = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.036, 0.012), chromeReflectorMat);
  tailBackplate.position.z = 0.01;
  taillightPod.add(tailHousing, tailBackplate);

  for (let t = -4; t <= 4; t++) {
    const finSeg = new THREE.Mesh(new THREE.BoxGeometry(0.044, 0.022, 0.014), emitterRubyMat);
    finSeg.position.set(t * 0.074, 0, 0.016);
    taillightPod.add(finSeg);
  }
  const rubyGlass = new THREE.Mesh(new THREE.BoxGeometry(0.73, 0.042, 0.015), rubyLensMat);
  rubyGlass.position.z = 0.024;
  taillightPod.add(rubyGlass);

  [-0.26, 0.26].forEach((tx) => {
    const tailGlow = new THREE.Mesh(
      new THREE.PlaneGeometry(0.22, 0.12),
      new THREE.MeshBasicMaterial({
        map: glowSpriteMap,
        color: 0xef4444,
        transparent: true,
        opacity: 0.26,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      })
    );
    tailGlow.position.set(tx, 0.1, 0.995);
    carGroup.add(tailGlow);
  });

  const carBoosterGroup = new THREE.Group();
  const carBoosterNozzleGeo = new THREE.LatheGeometry(
    [
      new THREE.Vector2(0.024, 0),
      new THREE.Vector2(0.038, 0.035),
      new THREE.Vector2(0.054, 0.085),
      new THREE.Vector2(0.062, 0.14),
    ],
    20
  );
  carBoosterNozzleGeo.rotateX(Math.PI / 2);

  const carBoosterFlames: THREE.Mesh[] = [];
  const carBoosterHalos: THREE.Mesh[] = [];
  [-0.14, 0.14].forEach((bx) => {
    const boosterPod = new THREE.Group();
    boosterPod.position.set(bx, -0.085, 0.94);

    const bell = new THREE.Mesh(carBoosterNozzleGeo, inconelNozzleMat);
    const flange = new THREE.Mesh(new THREE.TorusGeometry(0.046, 0.006, 8, 20), goldKaptonMat);
    flange.position.z = 0.05;
    const throat = new THREE.Mesh(new THREE.SphereGeometry(0.024, 12, 10), boosterEmberMat);
    throat.position.z = 0.055;

    const flameGeo = new THREE.ConeGeometry(0.046, 0.62, 16, 1, true);
    flameGeo.translate(0, -0.31, 0);
    flameGeo.rotateX(-Math.PI / 2);
    const flameMesh = new THREE.Mesh(
      flameGeo,
      new THREE.MeshBasicMaterial({
        color: 0x38bdf8,
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.DoubleSide,
      })
    );
    flameMesh.position.z = 0.13;
    flameMesh.visible = false;

    const heatHalo = new THREE.Mesh(
      new THREE.PlaneGeometry(0.28, 0.28),
      new THREE.MeshBasicMaterial({
        map: glowSpriteMap,
        color: 0xf97316,
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      })
    );
    heatHalo.position.z = 0.16;
    heatHalo.visible = false;

    carBoosterFlames.push(flameMesh);
    carBoosterHalos.push(heatHalo);
    boosterPod.add(bell, flange, throat, flameMesh, heatHalo);
    carBoosterGroup.add(boosterPod);
  });

  const CAR_SPARK_COUNT = 14;
  const carBoosterSparks = new THREE.InstancedMesh(
    new THREE.OctahedronGeometry(0.014, 0),
    new THREE.MeshBasicMaterial({
      color: 0xf97316,
      transparent: true,
      opacity: 0.72,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    }),
    CAR_SPARK_COUNT
  );
  carBoosterSparks.frustumCulled = false;
  carBoosterSparks.visible = false;
  carBoosterGroup.add(carBoosterSparks);
  carGroup.add(carBoosterGroup);

  const carWheels: THREE.Group[] = [];
  const wheelCoords: [number, number, number][] = [
    [-0.41, -0.035, -0.56],
    [0.41, -0.035, -0.56],
    [-0.41, -0.035, 0.56],
    [0.41, -0.035, 0.56],
  ];
  const tireGeo = new THREE.CylinderGeometry(0.17, 0.17, 0.135, 24);
  tireGeo.rotateZ(Math.PI / 2);
  const rimGeo = new THREE.CylinderGeometry(0.112, 0.112, 0.142, 16);
  rimGeo.rotateZ(Math.PI / 2);
  const rotorGeo = new THREE.CylinderGeometry(0.085, 0.085, 0.11, 16);
  rotorGeo.rotateZ(Math.PI / 2);
  const spokeGeo = new THREE.BoxGeometry(0.146, 0.022, 0.2);

  wheelCoords.forEach(([wx, wy, wz]) => {
    const wGroup = new THREE.Group();
    wGroup.position.set(wx, wy, wz);
    const tire = new THREE.Mesh(tireGeo, tireRubberMat);
    const rim = new THREE.Mesh(rimGeo, brushedSteelMat);
    const rotor = new THREE.Mesh(rotorGeo, crimsonAccentMat);
    const spokeA = new THREE.Mesh(spokeGeo, brushedSteelMat);
    const spokeB = new THREE.Mesh(spokeGeo, brushedSteelMat);
    spokeB.rotation.x = Math.PI / 2;
    wGroup.add(tire, rim, rotor, spokeA, spokeB);
    carWheels.push(wGroup);
    fallbackCarGroup.add(wGroup);
  });

  fallbackCarGroup.add(
    carBodyMesh,
    carCabinMesh,
    carGrille,
    frontSplitter,
    rearDiffuser,
    spoilerBlade,
    spoilerStrutL,
    spoilerStrutR,
    mirrorL,
    mirrorR,
    tailpipeL,
    tailpipeR,
    taillightPod
  );

  gltfLoader
    .loadAsync('/assets/models/porsche959.glb')
    .then((gltf) => {
      if (carDisposed) {
        gltf.scene.traverse((obj) => {
          if (obj.geometry) obj.geometry.dispose();
          if (obj.material) {
            const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
            mats.forEach((m) => m.dispose());
          }
        });
        return;
      }

      const model = gltf.scene;
      model.scale.setScalar(0.47);
      model.updateMatrixWorld(true);
      const bounds = new THREE.Box3().setFromObject(model);
      const center = new THREE.Vector3();
      bounds.getCenter(center);
      model.position.x -= center.x;
      model.position.y += -0.205 - bounds.min.y;
      model.position.z -= center.z;

      model.traverse((obj) => {
        if (obj.isMesh && obj.material) {
          const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
          mats.forEach((m) => {
            if ('envMapIntensity' in m) {
              (m as THREE.MeshStandardMaterial).envMapIntensity = 0.85;
            }
          });
        }
      });

      ['WHEEL_FL', 'WHEEL_FR', 'WHEEL_RL', 'WHEEL_RR'].forEach((wName, idx) => {
        const wheelNode = model.getObjectByName(wName);
        if (wheelNode && wheelNode.parent) {
          const steerPivot = new THREE.Group();
          const spinPivot = new THREE.Group();
          steerPivot.position.copy(wheelNode.position);
          wheelNode.position.set(0, 0, 0);
          wheelNode.parent.add(steerPivot);
          steerPivot.add(spinPivot);
          spinPivot.add(wheelNode);
          porscheSpinPivots.push(spinPivot);
          if (idx < 2) {
            porscheSteerPivots.push(steerPivot);
          }
        }
      });

      porscheLoadedScene = model;
      porscheContainer.add(model);
      porscheContainer.visible = true;
      fallbackCarGroup.visible = false;
    })
    .catch(() => {});

  const trainGroup = new THREE.Group();
  root.add(trainGroup);

  const coachProfile = new THREE.Shape();
  coachProfile.moveTo(-0.275, -0.02);
  coachProfile.lineTo(0.275, -0.02);
  coachProfile.lineTo(0.285, 0.24);
  coachProfile.lineTo(0.24, 0.36);
  coachProfile.lineTo(0.14, 0.405);
  coachProfile.lineTo(-0.14, 0.405);
  coachProfile.lineTo(-0.24, 0.36);
  coachProfile.lineTo(-0.285, 0.24);
  coachProfile.closePath();

  const makeCoachCar = (length: number, zCenter: number, addRoofHvac: boolean) => {
    const car = new THREE.Group();
    car.position.z = zCenter;

    const shellGeo = new THREE.ExtrudeGeometry(coachProfile, {
      steps: 1,
      depth: length,
      bevelEnabled: true,
      bevelThickness: 0.014,
      bevelSize: 0.01,
      bevelSegments: 2,
    });
    shellGeo.translate(0, 0, -length * 0.5);
    const shellMesh = new THREE.Mesh(shellGeo, trainWhiteMat);

    const sideWallGeo = new THREE.PlaneGeometry(length - 0.04, 0.34);
    const leftWall = new THREE.Mesh(sideWallGeo, trainLiveryMat);
    leftWall.rotation.y = -Math.PI / 2;
    leftWall.position.set(-0.296, 0.165, 0);

    const rightWall = new THREE.Mesh(sideWallGeo, trainLiveryMat);
    rightWall.rotation.y = Math.PI / 2;
    rightWall.position.set(0.296, 0.165, 0);

    const skirtMat = heatShieldMat;
    const underChassis = new THREE.Mesh(
      new THREE.BoxGeometry(0.52, 0.09, length - 0.02),
      skirtMat
    );
    underChassis.position.set(0, -0.025, 0);

    const roofFairing = new THREE.Mesh(
      new THREE.BoxGeometry(0.32, 0.028, length * 0.88),
      brushedSteelMat
    );
    roofFairing.position.set(0, 0.415, 0);

    car.add(shellMesh, leftWall, rightWall, underChassis, roofFairing);

    if (addRoofHvac) {
      [-length * 0.24, length * 0.24].forEach((hz) => {
        const hvac = new THREE.Mesh(
          new THREE.BoxGeometry(0.28, 0.046, 0.32),
          brushedSteelMat
        );
        hvac.position.set(0, 0.44, hz);
        const grille = new THREE.Mesh(
          new THREE.BoxGeometry(0.24, 0.012, 0.24),
          heatShieldMat
        );
        grille.position.set(0, 0.465, hz);
        car.add(hvac, grille);
      });
    }
    return car;
  };

  const leadCoach = makeCoachCar(1.24, -0.34, true);
  const rearCoach = makeCoachCar(1.38, 1.14, true);

  const noseShellGeo = new THREE.LatheGeometry(
    [
      new THREE.Vector2(0.015, 0),
      new THREE.Vector2(0.11, 0.14),
      new THREE.Vector2(0.195, 0.34),
      new THREE.Vector2(0.25, 0.62),
      new THREE.Vector2(0.285, 0.94),
    ],
    28
  );
  noseShellGeo.scale(1.0, 1.0, 0.8);
  noseShellGeo.rotateX(Math.PI / 2);
  const trainNoseMesh = new THREE.Mesh(noseShellGeo, trainWhiteMat);
  trainNoseMesh.position.set(0, 0.15, -1.9);

  const noseApron = new THREE.Mesh(
    new THREE.BoxGeometry(0.42, 0.08, 0.72),
    trainBlueStripeMat
  );
  noseApron.position.set(0, 0.01, -1.32);

  const noseCouplerHatch = new THREE.Mesh(
    new THREE.CylinderGeometry(0.048, 0.056, 0.1, 14),
    heatShieldMat
  );
  noseCouplerHatch.rotation.x = Math.PI / 2;
  noseCouplerHatch.position.set(0, 0.01, -1.86);

  const cabWindshieldGeo = new THREE.SphereGeometry(0.175, 24, 16);
  cabWindshieldGeo.scale(1.18, 0.48, 1.72);
  const cabWindshield = new THREE.Mesh(cabWindshieldGeo, opticalGlassMat);
  cabWindshield.position.set(0, 0.265, -1.24);

  const cabWindowFrame = new THREE.Mesh(
    new THREE.BoxGeometry(0.014, 0.09, 0.26),
    heatShieldMat
  );
  cabWindowFrame.position.set(0, 0.28, -1.36);
  cabWindowFrame.rotation.x = 0.42;

  const gangwayBellows = new THREE.Group();
  gangwayBellows.position.set(0, 0.18, 0.36);
  for (let r = -2; r <= 2; r++) {
    const pleat = new THREE.Mesh(
      new THREE.BoxGeometry(0.44, 0.34, 0.032),
      r % 2 === 0 ? tireRubberMat : heatShieldMat
    );
    pleat.position.z = r * 0.034;
    gangwayBellows.add(pleat);
  }
  const interCouplerBar = new THREE.Mesh(
    new THREE.CylinderGeometry(0.025, 0.025, 0.24, 10),
    brushedSteelMat
  );
  interCouplerBar.rotation.x = Math.PI / 2;
  interCouplerBar.position.set(0, -0.02, 0.36);

  const trainWheels: THREE.Group[] = [];
  const bogieWheelGeo = new THREE.CylinderGeometry(0.064, 0.064, 0.032, 18);
  bogieWheelGeo.rotateZ(Math.PI / 2);
  const flangeGeo = new THREE.CylinderGeometry(0.074, 0.074, 0.01, 18);
  flangeGeo.rotateZ(Math.PI / 2);
  const axleShaftGeo = new THREE.CylinderGeometry(0.018, 0.018, 0.5, 10);
  axleShaftGeo.rotateZ(Math.PI / 2);

  [-1.32, -0.22, 0.68, 1.58].forEach((bogieZ) => {
    const bogie = new THREE.Group();
    bogie.position.set(0, -0.07, bogieZ);

    const frameBeam = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.045, 0.42), heatShieldMat);
    frameBeam.position.y = 0.012;
    bogie.add(frameBeam);

    [-0.14, 0.14].forEach((az) => {
      const axleGroup = new THREE.Group();
      axleGroup.position.set(0, 0, az);
      const shaft = new THREE.Mesh(axleShaftGeo, brushedSteelMat);
      axleGroup.add(shaft);

      [-0.24, 0.24].forEach((wx) => {
        const tread = new THREE.Mesh(bogieWheelGeo, brushedSteelMat);
        tread.position.x = wx;
        const flange = new THREE.Mesh(flangeGeo, chromeReflectorMat);
        flange.position.x = wx + (wx < 0 ? 0.016 : -0.016);
        axleGroup.add(tread, flange);
      });
      trainWheels.push(axleGroup);
      bogie.add(axleGroup);
    });

    [-0.275, 0.275].forEach((sx) => {
      const sideFrame = new THREE.Mesh(new THREE.BoxGeometry(0.036, 0.068, 0.44), heatShieldMat);
      sideFrame.position.set(sx, 0.018, 0);
      const spring = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.065, 10), brushedSteelMat);
      spring.position.set(sx, 0.022, 0);
      bogie.add(sideFrame, spring);
    });

    trainGroup.add(bogie);
  });

  const pantographGroup = new THREE.Group();
  pantographGroup.position.set(0, 0.43, 0.04);
  const pantoBase = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.022, 0.3), heatShieldMat);
  pantographGroup.add(pantoBase);
  [
    [-0.08, -0.1],
    [0.08, -0.1],
    [-0.08, 0.1],
    [0.08, 0.1],
  ].forEach(([ix, iz]) => {
    const insulator = new THREE.Mesh(
      new THREE.CylinderGeometry(0.014, 0.018, 0.032, 8),
      crimsonAccentMat
    );
    insulator.position.set(ix, 0.022, iz);
    pantographGroup.add(insulator);
  });
  const pantoLowerArm = new THREE.Mesh(
    new THREE.CylinderGeometry(0.008, 0.008, 0.22, 8),
    brushedSteelMat
  );
  pantoLowerArm.rotation.x = 0.65;
  pantoLowerArm.position.set(0, 0.075, -0.04);
  const pantoUpperArmL = new THREE.Mesh(
    new THREE.CylinderGeometry(0.007, 0.007, 0.22, 8),
    brushedSteelMat
  );
  pantoUpperArmL.rotation.x = -0.65;
  pantoUpperArmL.position.set(-0.04, 0.165, -0.04);
  const pantoUpperArmR = pantoUpperArmL.clone();
  pantoUpperArmR.position.x = 0.04;
  const pantoHeadShoe = new THREE.Mesh(
    new THREE.BoxGeometry(0.34, 0.014, 0.04),
    goldKaptonMat
  );
  pantoHeadShoe.position.set(0, 0.23, 0.02);
  pantographGroup.add(pantoLowerArm, pantoUpperArmL, pantoUpperArmR, pantoHeadShoe);

  [-0.145, 0.145].forEach((hx) => {
    const trainLampFrame = new THREE.Mesh(
      new THREE.BoxGeometry(0.068, 0.042, 0.045),
      heatShieldMat
    );
    trainLampFrame.position.set(hx, 0.11, -1.68);
    const trainBeamLens = new THREE.Mesh(
      new THREE.SphereGeometry(0.022, 12, 10),
      emitterWarmMat
    );
    trainBeamLens.position.set(hx, 0.11, -1.7);
    const trainGlassCover = new THREE.Mesh(
      new THREE.BoxGeometry(0.06, 0.034, 0.012),
      clearLampLensMat
    );
    trainGlassCover.position.set(hx, 0.11, -1.712);
    const trainRearMarker = new THREE.Mesh(
      new THREE.BoxGeometry(0.06, 0.028, 0.018),
      emitterRubyMat
    );
    trainRearMarker.position.set(hx, 0.14, 1.84);
    trainGroup.add(trainLampFrame, trainBeamLens, trainGlassCover, trainRearMarker);
  });

  trainGroup.add(
    leadCoach,
    rearCoach,
    trainNoseMesh,
    noseApron,
    noseCouplerHatch,
    cabWindshield,
    cabWindowFrame,
    gangwayBellows,
    interCouplerBar,
    pantographGroup
  );

  const aircraftGroup = new THREE.Group();
  root.add(aircraftGroup);

  const jetFuselageProfile: THREE.Vector2[] = [];
  for (let i = 0; i <= 28; i++) {
    const t = i / 28;
    const y = (t - 0.5) * 2.35;
    let r = 0.21;
    if (t > 0.62) {
      const nt = (t - 0.62) / 0.38;
      r = 0.21 * Math.cos(nt * Math.PI * 0.5);
    } else if (t < 0.22) {
      const at = t / 0.22;
      r = 0.028 + 0.182 * Math.sin(at * Math.PI * 0.5);
    }
    jetFuselageProfile.push(new THREE.Vector2(Math.max(0.003, r), y));
  }
  const jetFuselageGeo = new THREE.LatheGeometry(jetFuselageProfile, 36);
  jetFuselageGeo.rotateX(-Math.PI / 2);
  const jetFuselageMesh = new THREE.Mesh(jetFuselageGeo, trainWhiteMat);

  const jetCheatline = new THREE.Mesh(
    new THREE.BoxGeometry(0.43, 0.032, 1.5),
    trainBlueStripeMat
  );
  jetCheatline.position.set(0, 0.01, 0.05);

  const jetCockpitGeo = new THREE.SphereGeometry(0.142, 20, 14);
  jetCockpitGeo.scale(0.88, 0.45, 1.55);
  const jetCockpit = new THREE.Mesh(jetCockpitGeo, opticalGlassMat);
  jetCockpit.position.set(0, 0.135, -0.6);

  const jetWingShape = new THREE.Shape();
  jetWingShape.moveTo(0, 0.22);
  jetWingShape.lineTo(1.26, -0.26);
  jetWingShape.lineTo(1.22, -0.45);
  jetWingShape.lineTo(0, -0.22);
  jetWingShape.closePath();

  const jetWingExtrude = new THREE.ExtrudeGeometry(jetWingShape, {
    steps: 1,
    depth: 0.024,
    bevelEnabled: true,
    bevelThickness: 0.008,
    bevelSize: 0.008,
    bevelSegments: 2,
  });
  jetWingExtrude.rotateX(-Math.PI / 2);

  const rightWingPivot = new THREE.Group();
  rightWingPivot.position.set(0.14, -0.03, 0.02);
  const rightJetWing = new THREE.Mesh(jetWingExtrude, brushedSteelMat);
  const wingletGeo = new THREE.BoxGeometry(0.02, 0.18, 0.17);
  const rightWinglet = new THREE.Mesh(wingletGeo, crimsonAccentMat);
  rightWinglet.position.set(1.24, 0.1, 0.35);
  rightWinglet.rotation.z = -0.22;
  const jetStrobeR = new THREE.Mesh(new THREE.SphereGeometry(0.016, 8, 8), navStarboardGreenMat);
  jetStrobeR.position.set(1.25, 0.01, 0.35);
  rightWingPivot.add(rightJetWing, rightWinglet, jetStrobeR);

  const leftWingPivot = new THREE.Group();
  leftWingPivot.position.set(-0.14, -0.03, 0.02);
  const leftJetWing = new THREE.Mesh(jetWingExtrude, brushedSteelMat);
  leftJetWing.scale.x = -1;
  const leftWinglet = new THREE.Mesh(wingletGeo, crimsonAccentMat);
  leftWinglet.position.set(-1.24, 0.1, 0.35);
  leftWinglet.rotation.z = 0.22;
  const jetStrobeL = new THREE.Mesh(new THREE.SphereGeometry(0.016, 8, 8), navPortRedMat);
  jetStrobeL.position.set(-1.25, 0.01, 0.35);
  leftWingPivot.add(leftJetWing, leftWinglet, jetStrobeL);

  const tailFinShape = new THREE.Shape();
  tailFinShape.moveTo(0, 0);
  tailFinShape.lineTo(0.32, 0.56);
  tailFinShape.lineTo(0.52, 0.56);
  tailFinShape.lineTo(0.44, 0);
  tailFinShape.closePath();

  const tailFinGeo = new THREE.ExtrudeGeometry(tailFinShape, {
    steps: 1,
    depth: 0.022,
    bevelEnabled: true,
    bevelThickness: 0.006,
    bevelSize: 0.006,
    bevelSegments: 2,
  });
  tailFinGeo.rotateY(Math.PI / 2);
  const tailFinMesh = new THREE.Mesh(tailFinGeo, crimsonAccentMat);
  tailFinMesh.position.set(-0.011, 0.12, 0.54);

  const hStabShape = new THREE.Shape();
  hStabShape.moveTo(0, 0);
  hStabShape.lineTo(0.48, -0.18);
  hStabShape.lineTo(0.45, -0.28);
  hStabShape.lineTo(0, -0.16);
  hStabShape.closePath();
  const hStabGeo = new THREE.ExtrudeGeometry(hStabShape, {
    steps: 1,
    depth: 0.016,
    bevelEnabled: true,
    bevelThickness: 0.004,
    bevelSize: 0.004,
    bevelSegments: 1,
  });
  hStabGeo.rotateX(Math.PI / 2);
  const rightHStab = new THREE.Mesh(hStabGeo, brushedSteelMat);
  rightHStab.position.set(0.08, 0.06, 0.78);
  const leftHStab = new THREE.Mesh(hStabGeo, brushedSteelMat);
  leftHStab.scale.x = -1;
  leftHStab.position.set(-0.08, 0.06, 0.78);

  const turbofanNacelles: THREE.Group[] = [];
  const turbofanRotors: THREE.Group[] = [];
  [-0.54, 0.54].forEach((ex) => {
    const nacelleGroup = new THREE.Group();
    nacelleGroup.position.set(ex, -0.14, 0.02);

    const cowling = new THREE.Mesh(
      new THREE.CylinderGeometry(0.105, 0.092, 0.42, 24),
      trainWhiteMat
    );
    cowling.rotation.x = Math.PI / 2;

    const intakeLip = new THREE.Mesh(
      new THREE.TorusGeometry(0.102, 0.012, 10, 24),
      brushedSteelMat
    );
    intakeLip.position.z = -0.21;

    const rotorGroup = new THREE.Group();
    rotorGroup.position.z = -0.18;
    const spinner = new THREE.Mesh(
      new THREE.ConeGeometry(0.032, 0.08, 12),
      heatShieldMat
    );
    spinner.rotation.x = -Math.PI / 2;
    rotorGroup.add(spinner);
    for (let b = 0; b < 8; b++) {
      const blade = new THREE.Mesh(
        new THREE.BoxGeometry(0.014, 0.088, 0.006),
        brushedSteelMat
      );
      blade.rotation.z = (b / 8) * Math.PI * 2;
      rotorGroup.add(blade);
    }
    turbofanRotors.push(rotorGroup);

    const exhaustCone = new THREE.Mesh(
      new THREE.ConeGeometry(0.07, 0.32, 16, 1, true),
      new THREE.MeshBasicMaterial({
        color: 0x38bdf8,
        transparent: true,
        opacity: 0.34,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      })
    );
    exhaustCone.rotation.x = -Math.PI / 2;
    exhaustCone.position.z = 0.35;

    nacelleGroup.add(cowling, intakeLip, rotorGroup, exhaustCone);
    turbofanNacelles.push(nacelleGroup);
    aircraftGroup.add(nacelleGroup);
  });

  aircraftGroup.add(
    jetFuselageMesh,
    jetCheatline,
    jetCockpit,
    rightWingPivot,
    leftWingPivot,
    tailFinMesh,
    rightHStab,
    leftHStab
  );

  const rocketGroup = new THREE.Group();
  root.add(rocketGroup);

  const hullProfile: THREE.Vector2[] = [];
  const profileSteps = 32;
  for (let i = 0; i <= profileSteps; i++) {
    const t = i / profileSteps;
    const y = (t - 0.5) * 1.98;
    let r = 0.235;
    if (t > 0.5) {
      const nt = (t - 0.5) / 0.5;
      r = 0.235 * Math.pow(Math.cos(nt * Math.PI * 0.5), 0.82);
    } else if (t < 0.07) {
      const at = t / 0.07;
      r = 0.205 + 0.03 * at;
    }
    hullProfile.push(new THREE.Vector2(Math.max(0.003, r), y));
  }

  const hullGeo = new THREE.LatheGeometry(hullProfile, 48);
  hullGeo.rotateX(-Math.PI / 2);
  const hullMesh = new THREE.Mesh(hullGeo, hullLaquerMat);

  const bellyProfile = hullProfile.map((pt) => new THREE.Vector2(pt.x * 1.012, pt.y));
  const bellyGeo = new THREE.LatheGeometry(bellyProfile, 28, Math.PI * 0.62, Math.PI * 0.76);
  bellyGeo.rotateX(-Math.PI / 2);
  const bellyMesh = new THREE.Mesh(bellyGeo, heatShieldMat);

  const noseCapProfile: THREE.Vector2[] = [];
  for (let i = 0; i <= 10; i++) {
    const nt = i / 10;
    const y = 0.76 + nt * 0.22;
    const r = 0.095 * Math.cos(nt * Math.PI * 0.5);
    noseCapProfile.push(new THREE.Vector2(Math.max(0.002, r), y));
  }
  const noseCapGeo = new THREE.LatheGeometry(noseCapProfile, 24);
  noseCapGeo.rotateX(-Math.PI / 2);
  const noseCapMesh = new THREE.Mesh(noseCapGeo, heatShieldMat);

  const structuralRingsGroup = new THREE.Group();
  [-0.36, -0.02, 0.34, 0.68, 0.88].forEach((rz, idx) => {
    const rad = idx === 0 ? 0.218 : idx === 4 ? 0.224 : 0.237;
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(rad, 0.0065, 10, 40),
      idx === 4 ? goldKaptonMat : brushedSteelMat
    );
    ring.position.set(0, 0, rz);
    structuralRingsGroup.add(ring);
  });

  const dorsalConduit = new THREE.Mesh(
    new THREE.CylinderGeometry(0.016, 0.018, 1.18, 12),
    brushedSteelMat
  );
  dorsalConduit.rotation.x = Math.PI / 2;
  dorsalConduit.position.set(0, 0.232, 0.14);

  const cockpitGroup = new THREE.Group();
  const canopyFrameGeo = new THREE.SphereGeometry(0.142, 24, 16);
  canopyFrameGeo.scale(0.84, 0.44, 1.62);
  const canopyFrame = new THREE.Mesh(canopyFrameGeo, brushedSteelMat);
  canopyFrame.position.set(0, 0.158, -0.34);

  const canopyGlassGeo = new THREE.SphereGeometry(0.136, 24, 16);
  canopyGlassGeo.scale(0.8, 0.42, 1.56);
  const canopyGlass = new THREE.Mesh(canopyGlassGeo, opticalGlassMat);
  canopyGlass.position.set(0, 0.164, -0.345);
  cockpitGroup.add(canopyFrame, canopyGlass);

  const noseProbe = new THREE.Mesh(
    new THREE.CylinderGeometry(0.003, 0.011, 0.18, 12),
    brushedSteelMat
  );
  noseProbe.rotation.x = -Math.PI / 2;
  noseProbe.position.set(0, 0, -1.06);

  const aftFinShape = new THREE.Shape();
  aftFinShape.moveTo(0, 0);
  aftFinShape.lineTo(0.44, -0.24);
  aftFinShape.lineTo(0.4, -0.44);
  aftFinShape.lineTo(0, -0.36);
  aftFinShape.closePath();

  const aftFinGeo = new THREE.ExtrudeGeometry(aftFinShape, {
    steps: 1,
    depth: 0.02,
    bevelEnabled: true,
    bevelThickness: 0.007,
    bevelSize: 0.007,
    bevelSegments: 2,
  });
  aftFinGeo.rotateX(-Math.PI / 2);

  const wingtipLocalPositions: [number, number, number][] = [
    [-0.6, 0, 0.68],
    [0.6, 0, 0.68],
  ];

  const mainFinsGroup = new THREE.Group();
  [0, Math.PI, Math.PI * 0.42, -Math.PI * 0.42].forEach((angle, idx) => {
    const finPivot = new THREE.Group();
    finPivot.rotation.z = angle;
    const fin = new THREE.Mesh(aftFinGeo, idx < 2 ? brushedSteelMat : heatShieldMat);
    fin.position.set(0.18, 0.01, 0.42);
    finPivot.add(fin);
    mainFinsGroup.add(finPivot);
  });

  const canardShape = new THREE.Shape();
  canardShape.moveTo(0, 0);
  canardShape.lineTo(0.2, -0.13);
  canardShape.lineTo(0.17, -0.23);
  canardShape.lineTo(0, -0.18);
  canardShape.closePath();

  const canardGeo = new THREE.ExtrudeGeometry(canardShape, {
    steps: 1,
    depth: 0.014,
    bevelEnabled: true,
    bevelThickness: 0.005,
    bevelSize: 0.005,
    bevelSegments: 2,
  });
  canardGeo.rotateX(-Math.PI / 2);

  const leftCanardPivot = new THREE.Group();
  leftCanardPivot.position.set(-0.17, 0.02, -0.52);
  const leftCanard = new THREE.Mesh(canardGeo, heatShieldMat);
  leftCanard.scale.x = -1;
  leftCanardPivot.add(leftCanard);

  const rightCanardPivot = new THREE.Group();
  rightCanardPivot.position.set(0.17, 0.02, -0.52);
  const rightCanard = new THREE.Mesh(canardGeo, heatShieldMat);
  rightCanardPivot.add(rightCanard);

  const nozzleProfile: THREE.Vector2[] = [
    new THREE.Vector2(0.028, 0),
    new THREE.Vector2(0.044, 0.04),
    new THREE.Vector2(0.064, 0.1),
    new THREE.Vector2(0.078, 0.16),
    new THREE.Vector2(0.088, 0.22),
  ];
  const nozzleGeo = new THREE.LatheGeometry(nozzleProfile, 24);
  nozzleGeo.rotateX(Math.PI / 2);

  const gimbalGroup = new THREE.Group();
  gimbalGroup.position.set(0, 0, 0.88);

  const thermalBayCover = new THREE.Mesh(
    new THREE.CylinderGeometry(0.195, 0.205, 0.06, 28),
    goldKaptonMat
  );
  thermalBayCover.rotation.x = Math.PI / 2;
  thermalBayCover.position.set(0, 0, 0.01);
  gimbalGroup.add(thermalBayCover);

  [
    [0, 0.082],
    [-0.075, -0.05],
    [0.075, -0.05],
  ].forEach(([nx, ny]) => {
    const noz = new THREE.Mesh(nozzleGeo, inconelNozzleMat);
    noz.position.set(nx, ny, 0);
    const manifoldRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.054, 0.006, 8, 20),
      goldKaptonMat
    );
    manifoldRing.position.set(nx, ny, 0.06);
    const throat = new THREE.Mesh(new THREE.SphereGeometry(0.04, 12, 12), chamberGlowMat);
    throat.position.set(nx, ny, 0.055);
    gimbalGroup.add(noz, manifoldRing, throat);
  });

  const plumeUniforms: Record<string, THREE.IUniform> = {
    uTime: { value: 0 },
    uThrottle: { value: 1.0 },
    uBoost: { value: 0.0 },
    uHotColor: { value: new THREE.Color(0xea580c) },
    uCoreColor: { value: new THREE.Color(0xfef3c7) },
    uCyanColor: { value: new THREE.Color(0x38bdf8) },
  };

  const plumeMat = new THREE.ShaderMaterial({
    uniforms: plumeUniforms,
    vertexShader: ROCKET_PLUME_VERTEX,
    fragmentShader: ROCKET_PLUME_FRAGMENT,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
  });

  const plumeOuterGeo = new THREE.ConeGeometry(0.165, 1.25, 24, 16, true);
  plumeOuterGeo.translate(0, -0.625, 0);
  plumeOuterGeo.rotateX(-Math.PI / 2);
  const plumeOuterMesh = new THREE.Mesh(plumeOuterGeo, plumeMat);
  plumeOuterMesh.position.set(0, 0, 0.96);

  const plumeInnerGeo = new THREE.ConeGeometry(0.085, 0.85, 16, 8, true);
  plumeInnerGeo.translate(0, -0.425, 0);
  plumeInnerGeo.rotateX(-Math.PI / 2);
  const plumeInnerMesh = new THREE.Mesh(
    plumeInnerGeo,
    new THREE.MeshBasicMaterial({
      color: 0xfef3c7,
      transparent: true,
      opacity: 0.56,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })
  );
  plumeInnerMesh.position.set(0, 0, 0.96);

  const exhaustHalo = new THREE.Mesh(
    new THREE.SphereGeometry(0.26, 16, 16),
    new THREE.MeshBasicMaterial({
      map: glowSpriteMap,
      color: 0xf97316,
      transparent: true,
      opacity: 0.18,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    })
  );
  exhaustHalo.position.set(0, 0, 1.02);

  const engineLight = new THREE.PointLight(0xf97316, 2.2, 8, 2.0);
  engineLight.position.set(0, 0, 1.15);

  const SPARK_COUNT = 18;
  const sparksInstanced = new THREE.InstancedMesh(
    new THREE.OctahedronGeometry(0.018, 0),
    new THREE.MeshBasicMaterial({
      color: 0xf59e0b,
      transparent: true,
      opacity: 0.68,
      blending: THREE.AdditiveBlending,
    }),
    SPARK_COUNT
  );
  sparksInstanced.frustumCulled = false;

  rocketGroup.add(
    hullMesh,
    bellyMesh,
    noseCapMesh,
    structuralRingsGroup,
    dorsalConduit,
    cockpitGroup,
    noseProbe,
    mainFinsGroup,
    leftCanardPivot,
    rightCanardPivot,
    gimbalGroup,
    plumeOuterMesh,
    plumeInnerMesh,
    exhaustHalo,
    engineLight,
    sparksInstanced
  );

  const TRAIL_LEN = 38;
  const centerTrailArr = new Float32Array(TRAIL_LEN * 3);
  const leftTrailArr = new Float32Array(TRAIL_LEN * 3);
  const rightTrailArr = new Float32Array(TRAIL_LEN * 3);

  const centerHistory = Array.from({ length: TRAIL_LEN }, () => new THREE.Vector3(0, 0.225, 4.2));
  const leftHistory = Array.from({ length: TRAIL_LEN }, () => new THREE.Vector3(0, 0.225, 4.2));
  const rightHistory = Array.from({ length: TRAIL_LEN }, () => new THREE.Vector3(0, 0.225, 4.2));

  const makeTrailLine = (arr: Float32Array, colorHex: number, opacity: number) => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(arr, 3));
    const l = new THREE.Line(
      g,
      new THREE.LineBasicMaterial({
        color: colorHex,
        transparent: true,
        opacity,
        blending: THREE.AdditiveBlending,
      })
    );
    l.frustumCulled = false;
    return l;
  };

  const centerTrailLine = makeTrailLine(centerTrailArr, 0xf97316, 0.34);
  const leftTrailLine = makeTrailLine(leftTrailArr, 0x93c5fd, 0.22);
  const rightTrailLine = makeTrailLine(rightTrailArr, 0x93c5fd, 0.22);
  const trailLines: THREE.Object3D[] = [centerTrailLine, leftTrailLine, rightTrailLine];

  const lookMat = new THREE.Matrix4();
  const targetQuat = new THREE.Quaternion();
  const rollQuat = new THREE.Quaternion();
  const pitchSteerQuat = new THREE.Quaternion();
  const upVec = new THREE.Vector3(0, 1, 0);
  const zAxis = new THREE.Vector3(0, 0, 1);
  const xAxis = new THREE.Vector3(1, 0, 0);
  const lookAheadPt = new THREE.Vector3();
  const sparkDummy = new THREE.Object3D();
  const sparkColor = new THREE.Color();
  const cOrange = new THREE.Color(PALETTE_NUM.amber);
  const cCyan = new THREE.Color(0x38bdf8);
  const leftWingWorld = new THREE.Vector3();
  const rightWingWorld = new THREE.Vector3();
  const exhaustWorld = new THREE.Vector3();

  let smoothedRoll = 0;
  let smoothedPitch = 0;
  let wheelSpinAngle = 0;
  let carBoostLevel = 0;
  let isSpaceRocketMode = false;
  let rocketMorph = 0;

  return {
    root,
    trailLines,
    update(
      dt,
      elapsed,
      progressT,
      position,
      tangent,
      nextTangent,
      velocity,
      boost,
      pointerX,
      pointerY,
      scaleMultiplier,
      nearestPlanetDist = 999
    ) {
      const isGroundOrRail = progressT < 5.5;
      root.position.copy(position);
      if (!isGroundOrRail) {
        root.position.y += Math.sin(elapsed * 2.2) * 0.028;
      }
      root.scale.setScalar(scaleMultiplier);

      lookAheadPt.copy(position).add(tangent);
      lookMat.lookAt(position, lookAheadPt, upVec);
      targetQuat.setFromRotationMatrix(lookMat);

      const curveTurnX = (nextTangent.x - tangent.x) * 5.8;
      const bankFactor = isGroundOrRail ? 0.06 : 0.4;
      const pitchFactor = isGroundOrRail ? 0.02 : 0.18;
      const targetRoll = THREE.MathUtils.clamp(-curveTurnX - pointerX * bankFactor, -0.55, 0.55);
      const targetPitch = THREE.MathUtils.clamp(pointerY * pitchFactor, -0.22, 0.22);

      const damp = 1 - Math.exp(-dt * 8.5);
      smoothedRoll += (targetRoll - smoothedRoll) * damp;
      smoothedPitch += (targetPitch - smoothedPitch) * damp;

      rollQuat.setFromAxisAngle(zAxis, smoothedRoll);
      pitchSteerQuat.setFromAxisAngle(xAxis, smoothedPitch);
      targetQuat.multiply(pitchSteerQuat).multiply(rollQuat);

      root.quaternion.slerp(targetQuat, 1 - Math.exp(-dt * 11));

      if (!isSpaceRocketMode && (position.y >= 17.6 || nearestPlanetDist <= 22.0)) {
        isSpaceRocketMode = true;
      } else if (isSpaceRocketMode && position.y <= 15.4 && nearestPlanetDist >= 28.0) {
        isSpaceRocketMode = false;
      }
      if (progressT < 5.1) {
        isSpaceRocketMode = false;
      }

      rocketMorph = THREE.MathUtils.damp(rocketMorph, isSpaceRocketMode ? 1 : 0, 3.8, dt);
      const morphEase = rocketMorph * rocketMorph * (3 - 2 * rocketMorph);

      const carWeight = 1 - THREE.MathUtils.smoothstep(progressT, 1.35, 1.95);
      const trainWeight =
        THREE.MathUtils.smoothstep(progressT, 1.35, 1.95) *
        (1 - THREE.MathUtils.smoothstep(progressT, 5.15, 5.85));
      const flightWeight = THREE.MathUtils.smoothstep(progressT, 5.15, 5.85);
      const aircraftWeight = flightWeight * (1 - morphEase * 0.94);
      const rocketWeight = flightWeight * morphEase;

      carGroup.visible = carWeight > 0.01;
      carGroup.scale.setScalar(Math.max(0.001, carWeight));

      trainGroup.visible = trainWeight > 0.01;
      trainGroup.scale.setScalar(Math.max(0.001, trainWeight));

      aircraftGroup.visible = aircraftWeight > 0.03;
      aircraftGroup.scale.setScalar(Math.max(0.001, flightWeight * (1 - morphEase * 0.48)));

      rocketGroup.visible = rocketWeight > 0.015;
      rocketGroup.scale.setScalar(Math.max(0.001, flightWeight * (0.45 + 0.55 * morphEase)));

      rightWingPivot.rotation.y = morphEase * 0.85;
      leftWingPivot.rotation.y = -morphEase * 0.85;
      const wingSpanFactor = Math.max(0.08, 1 - morphEase * 0.86);
      rightWingPivot.scale.set(wingSpanFactor, 1 - morphEase * 0.5, 1);
      leftWingPivot.scale.set(wingSpanFactor, 1 - morphEase * 0.5, 1);
      turbofanNacelles.forEach((nac) => {
        nac.scale.setScalar(Math.max(0.02, 1 - morphEase * 0.9));
      });

      const canardDeploy = Math.max(0.1, morphEase);
      leftCanardPivot.scale.setScalar(canardDeploy);
      rightCanardPivot.scale.setScalar(canardDeploy);

      wheelSpinAngle += dt * (4.5 + Math.abs(velocity) * 14 + boost * 10);
      if (carGroup.visible) {
        if (porscheContainer.visible) {
          porscheSpinPivots.forEach((sp) => {
            sp.rotation.x = wheelSpinAngle;
          });
          porscheSteerPivots.forEach((st) => {
            st.rotation.y = -smoothedRoll * 0.55;
          });
        } else {
          carWheels.forEach((w, idx) => {
            w.rotation.x = -wheelSpinAngle;
            if (idx < 2) {
              w.rotation.y = -smoothedRoll * 0.65;
            }
          });
        }
        carHeadSpot.intensity = carWeight * 2.4;

        const rawBoostSignal = Math.max(boost, Math.max(0, Math.abs(velocity) - 0.35));
        const targetBoost =
          rawBoostSignal > 0.05 ? THREE.MathUtils.clamp((rawBoostSignal - 0.05) / 0.45, 0.3, 1) : 0;
        carBoostLevel = THREE.MathUtils.damp(carBoostLevel, targetBoost, 10, dt);
        const boostActive = carBoostLevel > 0.015;
        boosterEmberMat.emissiveIntensity = boostActive ? 1.2 + carBoostLevel * 1.9 : 0;

        carBoosterFlames.forEach((flame, idx) => {
          flame.visible = boostActive;
          if (boostActive) {
            const flicker = 0.86 + Math.sin(elapsed * 48 + idx * 2.1) * 0.14;
            flame.scale.set(0.65 + carBoostLevel * 0.45, 0.65 + carBoostLevel * 0.45, (0.38 + carBoostLevel * 0.95) * flicker);
            (flame.material as THREE.MeshBasicMaterial).opacity = (0.36 + carBoostLevel * 0.48) * carWeight;
          }
        });
        carBoosterHalos.forEach((halo) => {
          halo.visible = boostActive;
          if (boostActive) {
            halo.scale.setScalar(0.5 + carBoostLevel * 0.72);
            (halo.material as THREE.MeshBasicMaterial).opacity = carBoostLevel * 0.52 * carWeight;
          }
        });

        carBoosterSparks.visible = boostActive;
        if (boostActive) {
          for (let i = 0; i < CAR_SPARK_COUNT; i++) {
            const side = i % 2 === 0 ? -0.14 : 0.14;
            const life = (elapsed * (2.6 + hashSeed(i) * 1.4) + i / CAR_SPARK_COUNT) % 1;
            const spread = life * (0.04 + carBoostLevel * 0.07);
            const ang = hashSeed(i + 31) * Math.PI * 2 + elapsed * 4;
            sparkDummy.position.set(
              side + Math.cos(ang) * spread,
              -0.085 + Math.sin(ang) * spread,
              1.06 + life * (0.45 + carBoostLevel * 0.65)
            );
            const sScale = Math.max(0.001, (1 - life) * (0.35 + carBoostLevel * 0.45));
            sparkDummy.scale.set(sScale * 0.6, sScale * 0.6, sScale * 1.4);
            sparkDummy.updateMatrix();
            carBoosterSparks.setMatrixAt(i, sparkDummy.matrix);
          }
          carBoosterSparks.instanceMatrix.needsUpdate = true;
        }
      } else {
        carHeadSpot.intensity = 0;
        boosterEmberMat.emissiveIntensity = 0;
        carBoosterSparks.visible = false;
      }

      if (trainGroup.visible) {
        trainWheels.forEach((axle) => {
          axle.rotation.x = -wheelSpinAngle * 1.4;
        });
      }

      if (aircraftGroup.visible) {
        turbofanRotors.forEach((rotor) => {
          rotor.rotation.z = elapsed * (22 + boost * 18);
        });
      }

      if (rocketGroup.visible) {
        leftCanardPivot.rotation.x = smoothedPitch * 0.8 - smoothedRoll * 0.42;
        rightCanardPivot.rotation.x = smoothedPitch * 0.8 + smoothedRoll * 0.42;
        gimbalGroup.rotation.y = -smoothedRoll * 0.3;
        gimbalGroup.rotation.x = -smoothedPitch * 0.3;

        const forwardSpeed = Math.max(0, velocity);
        const ramp = THREE.MathUtils.clamp((morphEase - 0.12) / 0.88, 0, 1);
        const throttle = Math.min(2.0, 0.58 + forwardSpeed * 0.7 + boost * 1.0) * ramp;

        plumeUniforms.uTime.value = elapsed;
        plumeUniforms.uThrottle.value = throttle;
        plumeUniforms.uBoost.value = Math.min(1, boost + forwardSpeed * 0.22) * ramp;

        const plumeLen = (0.32 + throttle * 0.72) * Math.max(0.05, ramp);
        const plumeRad = (0.55 + Math.sin(elapsed * 40) * 0.035 + boost * 0.18) * Math.max(0.2, ramp);
        plumeOuterMesh.scale.set(plumeRad, plumeRad, plumeLen);
        plumeInnerMesh.scale.set(plumeRad * 0.84, plumeRad * 0.84, plumeLen * 0.74);

        exhaustHalo.scale.setScalar((0.35 + throttle * 0.42) * ramp);
        engineLight.intensity = (2.0 + throttle * 1.4 + boost * 2.2) * rocketWeight;
        engineLight.color.copy(boost > 0.35 ? cCyan : cOrange);

        for (let i = 0; i < SPARK_COUNT; i++) {
          const life = (elapsed * (2.0 + hashSeed(i) * 1.4) + i / SPARK_COUNT) % 1;
          const spread = life * (0.16 + boost * 0.12);
          const angle = hashSeed(i + 19) * Math.PI * 2 + elapsed * 3.2;
          sparkDummy.position.set(
            Math.cos(angle) * spread,
            Math.sin(angle) * spread,
            1.0 + life * (1.25 + throttle * 0.75)
          );
          const sScale = Math.max(0.001, (1 - life) * (0.6 + throttle * 0.3) * ramp);
          sparkDummy.scale.set(sScale * 0.55, sScale * 0.55, sScale * 1.6);
          sparkDummy.updateMatrix();
          sparksInstanced.setMatrixAt(i, sparkDummy.matrix);
          sparkColor.copy(life < 0.32 || boost > 0.3 ? cCyan : cOrange).multiplyScalar(0.95 * (1 - life));
          sparksInstanced.setColorAt(i, sparkColor);
        }
        sparksInstanced.instanceMatrix.needsUpdate = true;
        if (sparksInstanced.instanceColor) sparksInstanced.instanceColor.needsUpdate = true;
      } else {
        engineLight.intensity = 0;
      }

      exhaustWorld.set(0, 0, 0.95);
      root.localToWorld(exhaustWorld);
      leftWingWorld.set(...wingtipLocalPositions[0]);
      root.localToWorld(leftWingWorld);
      rightWingWorld.set(...wingtipLocalPositions[1]);
      root.localToWorld(rightWingWorld);

      for (let i = TRAIL_LEN - 1; i > 0; i--) {
        centerHistory[i].lerp(centerHistory[i - 1], 0.58);
        leftHistory[i].lerp(leftHistory[i - 1], 0.58);
        rightHistory[i].lerp(rightHistory[i - 1], 0.58);
      }
      centerHistory[0].copy(exhaustWorld);
      leftHistory[0].copy(leftWingWorld);
      rightHistory[0].copy(rightWingWorld);

      for (let i = 0; i < TRAIL_LEN; i++) {
        centerTrailArr[i * 3] = centerHistory[i].x;
        centerTrailArr[i * 3 + 1] = centerHistory[i].y;
        centerTrailArr[i * 3 + 2] = centerHistory[i].z;

        leftTrailArr[i * 3] = leftHistory[i].x;
        leftTrailArr[i * 3 + 1] = leftHistory[i].y;
        leftTrailArr[i * 3 + 2] = leftHistory[i].z;

        rightTrailArr[i * 3] = rightHistory[i].x;
        rightTrailArr[i * 3 + 1] = rightHistory[i].y;
        rightTrailArr[i * 3 + 2] = rightHistory[i].z;
      }
      centerTrailLine.visible = rocketWeight > 0.1;
      leftTrailLine.visible = aircraftWeight > 0.15;
      rightTrailLine.visible = aircraftWeight > 0.15;
      centerTrailLine.geometry.attributes.position.needsUpdate = true;
      leftTrailLine.geometry.attributes.position.needsUpdate = true;
      rightTrailLine.geometry.attributes.position.needsUpdate = true;
      return morphEase;
    },
    dispose() {
      carDisposed = true;
      dracoLoader.dispose();
      if (porscheLoadedScene) {
        porscheLoadedScene.traverse((obj) => {
          if (obj.geometry) obj.geometry.dispose();
          if (obj.material) {
            const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
            mats.forEach((m) => m.dispose());
          }
        });
      }
      hullColorMap.dispose();
      heatShieldMap.dispose();
      goldFoil.map.dispose();
      goldFoil.bumpMap.dispose();
      trailLines.forEach((l) => {
        const line = l as THREE.Line;
        line.geometry.dispose();
        (line.material as THREE.Material).dispose();
      });
    },
  };
}
