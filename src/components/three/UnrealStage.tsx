import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import {
  ARCHIVE_PROJECTS,
  ATMOSPHERE_ZONES,
  PALETTE_NUM,
  STOPS,
  engineState,
  findStopIndex,
  notifyEngineUi,
  stopOpenProgress,
  updateSpectrumBands,
} from '../../data/portfolioJourney';
import {
  createAerospaceHullTexture,
  createBrushedMetalNormalMap,
  createCloudAtlasTexture,
  createGoldKaptonFoilTexture,
  createRadialGlowTexture,
  createSolarArrayTexture,
  disposeObjectSubtree,
  hashSeed,
  sampleMountainElevation,
} from './proceduralTextures';
import { createTextureBundle } from './textureLibrary';
import {
  CLOUD_PUFF_FRAGMENT,
  CLOUD_PUFF_VERTEX,
  EARTH_DAY_NIGHT_FRAGMENT,
  EARTH_DAY_NIGHT_VERTEX,
  MILKY_WAY_SKY_FRAGMENT,
  MILKY_WAY_SKY_VERTEX,
  PLANET_ATMOSPHERE_FRAGMENT,
  PLANET_ATMOSPHERE_VERTEX,
  SKY_DOME_FRAGMENT,
  SKY_DOME_VERTEX,
  STARFIELD_WARP_FRAGMENT,
  STARFIELD_WARP_VERTEX,
} from './shaders';
import { createStarshipRocket } from './RocketShip';
import {
  HUB_ANCHORS,
  createJourneyCurves,
  freezeStaticTree,
  sampleRouteCenterX,
} from './routeMath';
import {
  buildAirportHub,
  buildCurvedHighway,
  buildCurvedRailwayAndMidStations,
  buildDeepSpaceObservatory,
  buildGrandTrainStation,
  buildSpaceportComplex,
} from './hubBuilders';
import type {
  AirportHubResult,
  HubMaterialPalette,
  ObservatoryHubResult,
  SpaceportHubResult,
} from './hubBuilders';
import { playPulseSfx, updateAmbientAudio } from '../../utils/soundEngine';

function createPlanetAtmosphereMesh(
  radius: number,
  colorHex: number,
  intensity = 0.65
): THREE.Mesh {
  const geo = new THREE.SphereGeometry(radius, 48, 36);
  const mat = new THREE.ShaderMaterial({
    uniforms: {
      uColor: { value: new THREE.Color(colorHex) },
      uSunDir: { value: new THREE.Vector3(0.65, 0.55, 0.52).normalize() },
      uIntensity: { value: intensity },
    },
    vertexShader: PLANET_ATMOSPHERE_VERTEX,
    fragmentShader: PLANET_ATMOSPHERE_FRAGMENT,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.FrontSide,
  });
  return new THREE.Mesh(geo, mat);
}

function createPlanetaryRingGeometry(
  innerRadius: number,
  outerRadius: number,
  segments = 96
): THREE.BufferGeometry {
  const geo = new THREE.RingGeometry(innerRadius, outerRadius, segments, 1);
  const pos = geo.attributes.position;
  const uv = geo.attributes.uv;
  const v3 = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    v3.fromBufferAttribute(pos, i);
    const len = v3.length();
    const u = THREE.MathUtils.clamp(
      (len - innerRadius) / Math.max(0.001, outerRadius - innerRadius),
      0,
      1
    );
    const angle = (Math.atan2(v3.y, v3.x) + Math.PI) / (Math.PI * 2);
    uv.setXYZ(i, u, angle, 0);
  }
  geo.rotateX(Math.PI / 2);
  return geo;
}

function buildAlpineTerrainGeometry(): THREE.BufferGeometry {
  const width = 112;
  const depth = 196;
  const segX = 80;
  const segZ = 148;
  const geo = new THREE.PlaneGeometry(width, depth, segX, segZ);
  geo.rotateX(-Math.PI / 2);
  geo.translate(0, 0, -76);

  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const z = pos.getZ(i);
    const h = sampleMountainElevation(x, z);
    pos.setXYZ(i, x, h, z);
  }
  geo.computeVertexNormals();

  const norm = geo.attributes.normal;
  const colors = new Float32Array(pos.count * 3);
  const cMeadow = new THREE.Color(0x283f2c);
  const cForest = new THREE.Color(0x1f3425);
  const cRock = new THREE.Color(0x4b535e);
  const cSnow = new THREE.Color(0xc8d4e0);
  const tmpColor = new THREE.Color();

  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const z = pos.getZ(i);
    const ny = norm.getY(i);

    const biomeNoise = hashSeed(Math.floor(x * 3.1) + Math.floor(z * 2.7)) * 0.65;
    if (y < -0.5) {
      tmpColor.copy(cRock).lerp(cMeadow, 0.35);
    } else if (ny < 0.72) {
      tmpColor.copy(cRock);
    } else if (y > 6.4 - biomeNoise) {
      const snowBlend = THREE.MathUtils.clamp((y - 5.6) / 2.4, 0, 1);
      tmpColor.copy(cRock).lerp(cSnow, snowBlend);
    } else if (y > 2.2) {
      tmpColor.copy(cForest).lerp(cRock, THREE.MathUtils.clamp((y - 2.2) / 4.2, 0, 0.65));
    } else {
      tmpColor.copy(cMeadow).lerp(cForest, THREE.MathUtils.clamp(y / 2.2, 0, 1));
    }

    colors[i * 3] = tmpColor.r;
    colors[i * 3 + 1] = tmpColor.g;
    colors[i * 3 + 2] = tmpColor.b;
  }

  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  return geo;
}

export default function UnrealStage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance',
      stencil: false,
    });
    const maxDpr = engineState.quality === 'epic' ? 1.25 : 1.0;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, maxDpr));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.78;
    renderer.setClearColor(ATMOSPHERE_ZONES[0].bg, 1);
    renderer.info.autoReset = false;

    const scene = new THREE.Scene();
    const bgColor = new THREE.Color(ATMOSPHERE_ZONES[0].bg);
    const fogColor = new THREE.Color(ATMOSPHERE_ZONES[0].fog);
    scene.background = bgColor;
    const sceneFog = new THREE.Fog(ATMOSPHERE_ZONES[0].fog, 30, 138);
    scene.fog = sceneFog;

    const pmrem = new THREE.PMREMGenerator(renderer);
    const roomEnv = new RoomEnvironment();
    scene.environment = pmrem.fromScene(roomEnv, 0.04).texture;
    scene.environmentIntensity = 0.28;
    roomEnv.dispose();
    pmrem.dispose();

    const normalMap = createBrushedMetalNormalMap(renderer, 256);
    const glowSpriteMap = createRadialGlowTexture();
    const cloudAtlasMap = createCloudAtlasTexture(renderer);
    const hullPanelMap = createAerospaceHullTexture(renderer);
    const goldFoilTex = createGoldKaptonFoilTexture(renderer);
    const solarCellMap = createSolarArrayTexture(renderer);
    const textures = createTextureBundle(renderer);
    engineState.boot = { progress: 26, stageKey: 'models', ready: false };
    notifyEngineUi();

    const curves = createJourneyCurves();

    const brushedAluminumMat = new THREE.MeshPhysicalMaterial({
      color: 0xc2cbd6,
      metalness: 0.78,
      roughness: 0.28,
      normalMap: textures.metal.normalMap,
      normalScale: new THREE.Vector2(0.28, 0.28),
      roughnessMap: textures.metal.roughnessMap,
      clearcoat: 0.22,
      clearcoatRoughness: 0.3,
      envMapIntensity: 0.65,
    });

    const railSteelMat = new THREE.MeshPhysicalMaterial({
      color: 0xd0d8e2,
      metalness: 0.88,
      roughness: 0.18,
      clearcoat: 0.35,
      clearcoatRoughness: 0.2,
      envMapIntensity: 0.8,
    });

    const whiteHullMat = new THREE.MeshPhysicalMaterial({
      map: hullPanelMap,
      color: 0xcfd6df,
      metalness: 0.28,
      roughness: 0.38,
      normalMap,
      normalScale: new THREE.Vector2(0.18, 0.18),
      clearcoat: 0.26,
      clearcoatRoughness: 0.28,
      envMapIntensity: 0.58,
    });

    const goldKaptonMat = new THREE.MeshStandardMaterial({
      map: goldFoilTex.map,
      bumpMap: goldFoilTex.bumpMap,
      bumpScale: 0.02,
      color: 0xd99b18,
      metalness: 0.74,
      roughness: 0.36,
      envMapIntensity: 0.68,
    });

    const solarPanelMat = new THREE.MeshPhysicalMaterial({
      map: solarCellMap,
      color: 0xcbd5e1,
      metalness: 0.6,
      roughness: 0.26,
      clearcoat: 0.45,
      clearcoatRoughness: 0.22,
      envMapIntensity: 0.72,
    });

    const darkStructuralMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      metalness: 0.68,
      roughness: 0.46,
      normalMap: textures.metal.normalMap,
      normalScale: new THREE.Vector2(0.24, 0.24),
    });

    const concreteMat = new THREE.MeshStandardMaterial({
      map: textures.concrete.map,
      normalMap: textures.concrete.normalMap,
      normalScale: new THREE.Vector2(0.55, 0.55),
      roughnessMap: textures.concrete.roughnessMap,
      color: 0x9aa3af,
      metalness: 0.05,
      roughness: 0.88,
    });

    const asphaltMat = new THREE.MeshStandardMaterial({
      map: textures.asphalt.map,
      normalMap: textures.asphalt.normalMap,
      normalScale: new THREE.Vector2(0.45, 0.45),
      roughnessMap: textures.asphalt.roughnessMap,
      color: 0x3b424c,
      roughness: 0.84,
      metalness: 0.06,
    });

    const ballastMat = new THREE.MeshStandardMaterial({
      map: textures.ballast.map,
      normalMap: textures.ballast.normalMap,
      normalScale: new THREE.Vector2(0.8, 0.8),
      roughnessMap: textures.ballast.roughnessMap,
      color: 0x7c828a,
      roughness: 0.94,
      metalness: 0.04,
    });

    const woodSleeperMat = new THREE.MeshStandardMaterial({
      map: textures.wood.map,
      normalMap: textures.wood.normalMap,
      roughnessMap: textures.wood.roughnessMap,
      color: 0x705842,
      metalness: 0.04,
      roughness: 0.9,
    });

    const glassArchMat = new THREE.MeshPhysicalMaterial({
      color: 0x0f2744,
      metalness: 0.2,
      roughness: 0.1,
      clearcoat: 0.9,
      transparent: true,
      opacity: 0.66,
      depthWrite: false,
      side: THREE.DoubleSide,
    });

    const tactileYellowMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      roughness: 0.65,
      metalness: 0.05,
    });

    const warmGlowMat = new THREE.MeshStandardMaterial({
      color: 0xfef3c7,
      emissive: 0xfde68a,
      emissiveIntensity: 1.45,
      roughness: 0.3,
    });

    const cyanGlowMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0ea5e9,
      emissiveIntensity: 1.5,
      roughness: 0.28,
    });

    const redBeaconMat = new THREE.MeshStandardMaterial({
      color: 0xef4444,
      emissive: 0xdc2626,
      emissiveIntensity: 1.65,
      roughness: 0.25,
    });

    const greenBeaconMat = new THREE.MeshStandardMaterial({
      color: 0x22c55e,
      emissive: 0x16a34a,
      emissiveIntensity: 1.6,
      roughness: 0.25,
    });

    const dishBackMat = new THREE.MeshPhysicalMaterial({
      color: 0x64748b,
      metalness: 0.55,
      roughness: 0.42,
      clearcoat: 0.18,
      side: THREE.DoubleSide,
    });

    const dishProfile: THREE.Vector2[] = [];
    for (let i = 0; i <= 10; i++) {
      const t = i / 10;
      dishProfile.push(new THREE.Vector2(t * 0.38, t * t * 0.14));
    }
    const sharedDishGeo = new THREE.LatheGeometry(dishProfile, 24);
    sharedDishGeo.rotateX(Math.PI / 2);

    const createSatelliteAssembly = (scale = 1.0, useGoldBus = true): THREE.Group => {
      const sat = new THREE.Group();
      const bus = new THREE.Mesh(
        new THREE.CylinderGeometry(0.26, 0.26, 0.48, 8),
        useGoldBus ? goldKaptonMat : whiteHullMat
      );
      const collarTop = new THREE.Mesh(
        new THREE.TorusGeometry(0.27, 0.018, 8, 24),
        darkStructuralMat
      );
      collarTop.rotation.x = Math.PI / 2;
      collarTop.position.y = 0.2;
      const collarBot = collarTop.clone();
      collarBot.position.y = -0.2;

      const dockingRing = new THREE.Mesh(
        new THREE.CylinderGeometry(0.14, 0.18, 0.1, 12),
        brushedAluminumMat
      );
      dockingRing.position.y = -0.28;

      const dish = new THREE.Mesh(sharedDishGeo, dishBackMat);
      dish.position.set(0, 0.04, 0.26);

      const feedHorn = new THREE.Mesh(
        new THREE.CylinderGeometry(0.014, 0.03, 0.22, 8),
        brushedAluminumMat
      );
      feedHorn.rotation.x = Math.PI / 2;
      feedHorn.position.set(0, 0.04, 0.36);

      const wingBoom = new THREE.Mesh(
        new THREE.CylinderGeometry(0.015, 0.015, 3.3, 8),
        brushedAluminumMat
      );
      wingBoom.rotation.z = Math.PI / 2;

      [-1, 1].forEach((side) => {
        const innerPanel = new THREE.Mesh(
          new THREE.BoxGeometry(0.62, 0.018, 0.42),
          solarPanelMat
        );
        innerPanel.position.set(side * 0.64, 0, 0);
        const outerPanel = innerPanel.clone();
        outerPanel.position.set(side * 1.32, 0, 0);
        const hinge = new THREE.Mesh(
          new THREE.BoxGeometry(0.05, 0.032, 0.44),
          darkStructuralMat
        );
        hinge.position.set(side * 0.98, 0, 0);
        sat.add(innerPanel, outerPanel, hinge);
      });

      sat.add(bus, collarTop, collarBot, dockingRing, dish, feedHorn, wingBoom);
      sat.scale.setScalar(scale);
      return sat;
    };

    const camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.1, 240);
    camera.position.set(...STOPS[0].cam);

    let responsiveVehicleScale = 1.0;
    let isMobileViewport = window.innerWidth < 900;

    const applyCameraFrustum = (w: number, h: number) => {
      isMobileViewport = w < 900;
      camera.aspect = w / h;
      camera.clearViewOffset();
      if (w < 640) {
        camera.fov = 52;
        responsiveVehicleScale = 0.88;
      } else if (w < 900) {
        camera.fov = 48;
        responsiveVehicleScale = 0.94;
      } else if (w < 1280) {
        camera.fov = 42;
        responsiveVehicleScale = 1.0;
      } else {
        camera.fov = 39;
        responsiveVehicleScale = 1.05;
      }
      camera.updateProjectionMatrix();
    };
    applyCameraFrustum(window.innerWidth, window.innerHeight);

    const orbitControls = new OrbitControls(camera, canvas);
    orbitControls.enabled = false;
    orbitControls.enableDamping = true;
    orbitControls.dampingFactor = 0.06;
    orbitControls.minDistance = 2.8;
    orbitControls.maxDistance = 40;

    const hemiLight = new THREE.HemisphereLight(0x9ec5e8, 0x203227, 0.58);
    const keyLight = new THREE.DirectionalLight(ATMOSPHERE_ZONES[0].keyLight, 1.36);
    keyLight.position.set(16, 24, 14);
    const rimLight = new THREE.DirectionalLight(ATMOSPHERE_ZONES[0].rimLight, 0.34);
    rimLight.position.set(-14, 6, -10);
    scene.add(hemiLight, keyLight, rimLight);

    const skyUniforms: Record<string, THREE.IUniform> = {
      uZenithColor: { value: new THREE.Color(ATMOSPHERE_ZONES[0].zenith) },
      uHorizonColor: { value: new THREE.Color(ATMOSPHERE_ZONES[0].horizon) },
      uGroundColor: { value: new THREE.Color(ATMOSPHERE_ZONES[0].groundSky) },
      uSunDir: { value: new THREE.Vector3(0.55, 0.38, -0.74).normalize() },
      uSunGlow: { value: 1.0 },
    };

    const skyDome = new THREE.Mesh(
      new THREE.SphereGeometry(185, 32, 24),
      new THREE.ShaderMaterial({
        uniforms: skyUniforms,
        vertexShader: SKY_DOME_VERTEX,
        fragmentShader: SKY_DOME_FRAGMENT,
        side: THREE.BackSide,
        depthWrite: false,
      })
    );
    skyDome.frustumCulled = false;
    scene.add(skyDome);

    const milkyWayUniforms: Record<string, THREE.IUniform> = {
      uSkyMap: { value: textures.milkyWay },
      uOpacity: { value: 0 },
    };
    const milkyWaySkyDome = new THREE.Mesh(
      new THREE.SphereGeometry(176, 32, 24),
      new THREE.ShaderMaterial({
        uniforms: milkyWayUniforms,
        vertexShader: MILKY_WAY_SKY_VERTEX,
        fragmentShader: MILKY_WAY_SKY_FRAGMENT,
        side: THREE.BackSide,
        depthWrite: false,
        transparent: true,
      })
    );
    milkyWaySkyDome.frustumCulled = false;
    milkyWaySkyDome.renderOrder = -1;
    milkyWaySkyDome.visible = false;
    scene.add(milkyWaySkyDome);

    const pickables: THREE.Object3D[] = [];
    const registerPickable = (
      obj: THREE.Object3D,
      hoverKey: string,
      stopIndex: number
    ) => {
      obj.layers.enable(1);
      obj.userData = {
        ...obj.userData,
        pickable: true,
        hoverKey,
        stopIndex,
      };
      pickables.push(obj);
    };

    const hubMats: HubMaterialPalette = {
      concreteMat,
      asphaltMat,
      ballastMat,
      brushedAluminumMat,
      railSteelMat,
      whiteHullMat,
      darkStructuralMat,
      woodSleeperMat,
      solarPanelMat,
      goldKaptonMat,
      glassArchMat,
      tactileYellowMat,
      warmGlowMat,
      cyanGlowMat,
      redBeaconMat,
      greenBeaconMat,
      textures,
      registerPickable,
      createPlanetAtmosphereMesh,
      createPlanetaryRingGeometry,
    };

    const camPosSpline = new THREE.CatmullRomCurve3(
      STOPS.map((s) => new THREE.Vector3(...s.cam)),
      false,
      'catmullrom',
      0.34
    );
    const camLookSpline = new THREE.CatmullRomCurve3(
      STOPS.map((s) => new THREE.Vector3(...s.look)),
      false,
      'catmullrom',
      0.34
    );

    const starship = createStarshipRocket(renderer, normalMap, glowSpriteMap, textures.trainLivery);
    scene.add(starship.root);
    starship.trailLines.forEach((line) => scene.add(line));

    const earthLandscapeGroup = new THREE.Group();
    scene.add(earthLandscapeGroup);

    const terrainGeo = buildAlpineTerrainGeometry();
    const terrainMat = new THREE.MeshStandardMaterial({
      vertexColors: true,
      map: textures.terrain.map,
      normalMap: textures.terrain.normalMap,
      normalScale: new THREE.Vector2(0.75, 0.75),
      roughnessMap: textures.terrain.roughnessMap,
      roughness: 0.9,
      metalness: 0.04,
    });
    const terrainMesh = new THREE.Mesh(terrainGeo, terrainMat);
    earthLandscapeGroup.add(terrainMesh);

    const riverPlane = new THREE.Mesh(
      new THREE.PlaneGeometry(38, 72),
      new THREE.MeshPhysicalMaterial({
        color: 0x16425b,
        metalness: 0.72,
        roughness: 0.18,
        clearcoat: 0.55,
      })
    );
    riverPlane.rotation.x = -Math.PI / 2;
    riverPlane.position.set(0, -1.65, -92);
    earthLandscapeGroup.add(riverPlane);

    const pinePositions: { x: number; y: number; z: number; s: number }[] = [];
    for (let i = 0; i < 220; i++) {
      const side = i % 2 === 0 ? 1 : -1;
      const z = 14 - hashSeed(i * 6.7 + 3) * 168;
      const centerX = sampleRouteCenterX(z);
      const minClearance = z < -118 ? 16.5 : z < -44 && z > -63 ? 9.5 : 4.2;
      const x = centerX + side * (minClearance + hashSeed(i * 4.3 + 1) * 17.5);
      const y = sampleMountainElevation(x, z);
      if (y > -0.25 && y < 4.9) {
        pinePositions.push({
          x,
          y: y - 0.08,
          z,
          s: 0.65 + hashSeed(i * 9.1) * 0.7,
        });
      }
    }

    const trunkMesh = new THREE.InstancedMesh(
      new THREE.CylinderGeometry(0.06, 0.1, 0.55, 6),
      new THREE.MeshStandardMaterial({ color: 0x3b2a1e, roughness: 0.92 }),
      pinePositions.length
    );
    const foliageLowerMesh = new THREE.InstancedMesh(
      new THREE.ConeGeometry(0.55, 1.35, 7),
      new THREE.MeshStandardMaterial({ color: 0x1b3a24, roughness: 0.88 }),
      pinePositions.length
    );
    const foliageUpperMesh = new THREE.InstancedMesh(
      new THREE.ConeGeometry(0.4, 1.1, 7),
      new THREE.MeshStandardMaterial({ color: 0x22462d, roughness: 0.86 }),
      pinePositions.length
    );
    const treeDummy = new THREE.Object3D();
    pinePositions.forEach((tp, idx) => {
      treeDummy.position.set(tp.x, tp.y + 0.25 * tp.s, tp.z);
      treeDummy.scale.setScalar(tp.s);
      treeDummy.updateMatrix();
      trunkMesh.setMatrixAt(idx, treeDummy.matrix);

      treeDummy.position.set(tp.x, tp.y + 0.95 * tp.s, tp.z);
      treeDummy.updateMatrix();
      foliageLowerMesh.setMatrixAt(idx, treeDummy.matrix);

      treeDummy.position.set(tp.x, tp.y + 1.55 * tp.s, tp.z);
      treeDummy.updateMatrix();
      foliageUpperMesh.setMatrixAt(idx, treeDummy.matrix);
    });
    trunkMesh.instanceMatrix.needsUpdate = true;
    foliageLowerMesh.instanceMatrix.needsUpdate = true;
    foliageUpperMesh.instanceMatrix.needsUpdate = true;
    earthLandscapeGroup.add(trunkMesh, foliageLowerMesh, foliageUpperMesh);
    freezeStaticTree(earthLandscapeGroup);

    const highwayGroup = buildCurvedHighway(curves.carRoadCurve, hubMats);
    scene.add(highwayGroup);

    const grandStationGroup = buildGrandTrainStation(hubMats);
    scene.add(grandStationGroup);

    let stage2Built = false;
    let stage3Built = false;
    let stage4Built = false;

    let railwayGroup: THREE.Group | null = null;
    let airportHub: AirportHubResult | null = null;

    let cloudUniforms: Record<string, THREE.IUniform> | null = null;
    let cloudInstancedMesh: THREE.InstancedMesh | null = null;
    let cityAboveGroup: THREE.Group | null = null;
    let balloonGroup: THREE.Group | null = null;
    let balloonAssembly: THREE.Group | null = null;
    let balloonFlameMesh: THREE.Mesh | null = null;
    let burnerCoreMesh: THREE.Mesh | null = null;
    let balloonBurnerLight: THREE.PointLight | null = null;
    let voraRelayGroup: THREE.Group | null = null;
    let voraRelayCore: THREE.Group | null = null;
    let spaceportHub: SpaceportHubResult | null = null;

    let spaceStageGroup: THREE.Group | null = null;
    let starUniforms: Record<string, THREE.IUniform> | null = null;
    let recedingEarthGroup: THREE.Group | null = null;
    let recedingEarthMesh: THREE.Mesh | null = null;
    let recedingCloudsMesh: THREE.Mesh | null = null;
    let moonGroup: THREE.Group | null = null;
    let moonMesh: THREE.Mesh | null = null;
    let lunarProbePivot: THREE.Group | null = null;
    let marsJupiterGroup: THREE.Group | null = null;
    let marsMesh: THREE.Mesh | null = null;
    let jupiterMesh: THREE.Mesh | null = null;
    let saturnArchiveGroup: THREE.Group | null = null;
    let saturnSphere: THREE.Mesh | null = null;
    let saturnRings: THREE.Mesh | null = null;
    const archiveModules: THREE.Group[] = [];
    let observatoryHub: ObservatoryHubResult | null = null;

    const ensureStage2 = () => {
      if (stage2Built || disposed) return;
      stage2Built = true;
      railwayGroup = buildCurvedRailwayAndMidStations(curves.trainTrackCurve, hubMats);
      scene.add(railwayGroup);
      airportHub = buildAirportHub(hubMats);
      scene.add(airportHub.group);
    };

    const ensureStage3 = () => {
      if (stage3Built || disposed) return;
      stage3Built = true;

      interface CloudPuffRecord {
        x: number;
        y: number;
        z: number;
        sx: number;
        sy: number;
        cell: number;
        rot: number;
        shade: number;
      }
      const puffRecords: CloudPuffRecord[] = [];
      const addVolumetricCloudBank = (
        cx: number,
        cy: number,
        cz: number,
        widthSpan: number,
        heightSpan: number,
        seed: number,
        puffCount: number
      ) => {
        for (let p = 0; p < puffCount; p++) {
          const u = hashSeed(seed + p * 7.1) - 0.5;
          const layerT = p / Math.max(1, puffCount - 1);
          const isBase = layerT < 0.45;
          const isWisp = layerT > 0.78;
          const archHeight = Math.max(0, 1 - Math.abs(u) * 1.45) * heightSpan;
          const py = isBase
            ? (hashSeed(seed + p * 11.3) - 0.35) * 0.25 * heightSpan
            : archHeight * (0.35 + hashSeed(seed + p * 13.7) * 0.65);

          const baseScale =
            (isBase ? 2.45 : isWisp ? 2.2 : 1.75) *
            (0.78 + hashSeed(seed + p * 17.9) * 0.65);
          puffRecords.push({
            x: cx + u * widthSpan,
            y: cy + py,
            z: cz + (hashSeed(seed + p * 19.3) - 0.5) * (widthSpan * 0.52),
            sx: baseScale * (isBase ? 1.45 : isWisp ? 1.55 : 1.15),
            sy: baseScale * (isBase ? 0.78 : isWisp ? 0.7 : 0.96),
            cell: isWisp ? (p % 2 === 0 ? 2 : 3) : p % 2,
            rot: (hashSeed(seed + p * 23.1) - 0.5) * 0.65,
            shade: isBase
              ? 0.28 + layerT * 0.4
              : 0.65 + (py / Math.max(0.4, heightSpan)) * 0.35,
          });
        }
      };

      for (let i = 0; i < 12; i++) {
        const side = i % 2 === 0 ? 1 : -1;
        addVolumetricCloudBank(
          side * (14.5 + hashSeed(i * 3.1) * 15.0),
          11.2 + hashSeed(i * 7.3) * 4.8,
          -12 - i * 11.5,
          5.8 + hashSeed(i * 11.7) * 4.2,
          2.4 + hashSeed(i * 13.9) * 1.5,
          100 + i * 31,
          9
        );
      }

      for (let i = 0; i < 24; i++) {
        const side = i % 2 === 0 ? 1 : -1;
        addVolumetricCloudBank(
          side * (3.2 + hashSeed(i * 5.7) * 12.5),
          2.4 + (i / 24) * 5.5 + (hashSeed(i * 9.3) - 0.5) * 0.9,
          -166 - i * 3.8,
          4.6 + hashSeed(i * 14.3) * 3.8,
          1.55 + hashSeed(i * 17.1) * 1.15,
          600 + i * 37,
          9
        );
      }

      puffRecords.sort((a, b) => a.z - b.z);

      cloudUniforms = {
        uTime: { value: 0 },
        uSunDir: { value: new THREE.Vector3(0.55, 0.38, -0.74).normalize() },
        uAtlasMap: { value: cloudAtlasMap },
        uSunColor: { value: new THREE.Color(0xfff4e0) },
        uShadowColor: { value: new THREE.Color(0x5b728a) },
        uFogColor: { value: new THREE.Color(ATMOSPHERE_ZONES[0].fog) },
        uGlobalOpacity: { value: 1.0 },
      };

      const cloudPlaneGeo = new THREE.PlaneGeometry(1, 1);
      const cloudMetaArr = new Float32Array(puffRecords.length * 3);
      const cloudDummy = new THREE.Object3D();

      cloudInstancedMesh = new THREE.InstancedMesh(
        cloudPlaneGeo,
        new THREE.ShaderMaterial({
          uniforms: cloudUniforms,
          vertexShader: CLOUD_PUFF_VERTEX,
          fragmentShader: CLOUD_PUFF_FRAGMENT,
          transparent: true,
          depthWrite: false,
        }),
        puffRecords.length
      );
      cloudInstancedMesh.frustumCulled = false;
      cloudInstancedMesh.renderOrder = 3;

      puffRecords.forEach((p, idx) => {
        cloudDummy.position.set(p.x, p.y, p.z);
        cloudDummy.rotation.set(0, 0, 0);
        cloudDummy.scale.set(p.sx, p.sy, 1);
        cloudDummy.updateMatrix();
        cloudInstancedMesh!.setMatrixAt(idx, cloudDummy.matrix);
        cloudMetaArr[idx * 3] = p.cell;
        cloudMetaArr[idx * 3 + 1] = p.rot;
        cloudMetaArr[idx * 3 + 2] = p.shade;
      });
      cloudInstancedMesh.instanceMatrix.needsUpdate = true;
      cloudPlaneGeo.setAttribute('aCloudMeta', new THREE.InstancedBufferAttribute(cloudMetaArr, 3));
      scene.add(cloudInstancedMesh);

      cityAboveGroup = new THREE.Group();
      cityAboveGroup.position.set(0, -6.5, -204);
      scene.add(cityAboveGroup);

      const cityGroundMesh = new THREE.Mesh(
        new THREE.PlaneGeometry(168, 128),
        new THREE.MeshStandardMaterial({
          map: textures.cityAerial.map,
          emissiveMap: textures.cityAerial.emissiveMap,
          emissive: 0xffffff,
          emissiveIntensity: 0.96,
          roughness: 0.82,
          metalness: 0.08,
        })
      );
      cityGroundMesh.rotation.x = -Math.PI / 2;
      cityAboveGroup.add(cityGroundMesh);

      const CITY_BUILDING_COUNT = 340;
      const cityBuildings = new THREE.InstancedMesh(
        new THREE.BoxGeometry(1, 1, 1),
        new THREE.MeshStandardMaterial({
          color: 0x334155,
          roughness: 0.68,
          metalness: 0.25,
        }),
        CITY_BUILDING_COUNT
      );
      const cityBeaconMesh = new THREE.InstancedMesh(
        new THREE.BoxGeometry(1, 0.14, 1),
        new THREE.MeshBasicMaterial({ color: 0xfef3c7 }),
        CITY_BUILDING_COUNT
      );
      const bDummy = new THREE.Object3D();
      const bColor = new THREE.Color();
      const wColor = new THREE.Color();
      let bIdx = 0;
      for (let gx = -9; gx <= 9 && bIdx < CITY_BUILDING_COUNT; gx++) {
        for (let gz = -9; gz <= 9 && bIdx < CITY_BUILDING_COUNT; gz++) {
          if (Math.abs(gx) % 4 === 0 && Math.abs(gz) % 4 === 0) continue;
          const bx = gx * 5.2 + (hashSeed(gx * 13 + gz * 7) - 0.5) * 1.6;
          const bz = gz * 5.2 + (hashSeed(gx * 29 + gz * 11) - 0.5) * 1.6;
          const distCenter = Math.hypot(bx * 0.65, bz + 4);
          const coreBias = Math.max(0, 1 - distCenter / 38);
          const h = 0.45 + hashSeed(bIdx * 4.7) * (1.2 + coreBias * 2.6);
          const w = 1.2 + hashSeed(bIdx * 9.3) * 1.7;
          const d = 1.2 + hashSeed(bIdx * 17.1) * 1.7;

          bDummy.position.set(bx, h * 0.5, bz);
          bDummy.scale.set(w, h, d);
          bDummy.updateMatrix();
          cityBuildings.setMatrixAt(bIdx, bDummy.matrix);
          bColor.setHSL(0.6, 0.14, 0.14 + coreBias * 0.1 + hashSeed(bIdx) * 0.08);
          cityBuildings.setColorAt(bIdx, bColor);

          bDummy.position.set(bx, h * 0.88, bz);
          bDummy.scale.set(w * 0.94, Math.min(0.35, h * 0.22), d * 0.94);
          bDummy.updateMatrix();
          cityBeaconMesh.setMatrixAt(bIdx, bDummy.matrix);
          wColor.setHex(bIdx % 3 === 0 ? 0x93c5fd : 0xfbbf24);
          cityBeaconMesh.setColorAt(bIdx, wColor);
          bIdx++;
        }
      }
      cityBuildings.count = bIdx;
      cityBeaconMesh.count = bIdx;
      cityBuildings.instanceMatrix.needsUpdate = true;
      if (cityBuildings.instanceColor) cityBuildings.instanceColor.needsUpdate = true;
      cityBeaconMesh.instanceMatrix.needsUpdate = true;
      if (cityBeaconMesh.instanceColor) cityBeaconMesh.instanceColor.needsUpdate = true;
      cityAboveGroup.add(cityBuildings, cityBeaconMesh);

      const cityHazePlane = new THREE.Mesh(
        new THREE.PlaneGeometry(176, 136),
        new THREE.MeshBasicMaterial({
          color: 0x1e3a5f,
          transparent: true,
          opacity: 0.22,
          depthWrite: false,
        })
      );
      cityHazePlane.rotation.x = -Math.PI / 2;
      cityHazePlane.position.y = 3.2;
      cityAboveGroup.add(cityHazePlane);
      freezeStaticTree(cityAboveGroup);

      const ragStopIdx = findStopIndex('rag');
      balloonGroup = new THREE.Group();
      balloonGroup.position.set(...HUB_ANCHORS.balloonAnchor);
      scene.add(balloonGroup);

      balloonAssembly = new THREE.Group();
      balloonGroup.add(balloonAssembly);

      const goreCount = 16;
      const envelopeCurve = new THREE.SplineCurve([
        new THREE.Vector2(0.32, -0.74),
        new THREE.Vector2(0.58, -0.48),
        new THREE.Vector2(0.92, -0.14),
        new THREE.Vector2(1.22, 0.26),
        new THREE.Vector2(1.36, 0.68),
        new THREE.Vector2(1.3, 1.12),
        new THREE.Vector2(1.06, 1.48),
        new THREE.Vector2(0.68, 1.74),
        new THREE.Vector2(0.28, 1.86),
        new THREE.Vector2(0.005, 1.89),
      ]);
      const envelopeProfile = envelopeCurve.getPoints(28);
      const envelopeGeo = new THREE.LatheGeometry(envelopeProfile, 56);
      const envPos = envelopeGeo.attributes.position;
      for (let i = 0; i < envPos.count; i++) {
        const vx = envPos.getX(i);
        const vy = envPos.getY(i);
        const vz = envPos.getZ(i);
        const rad = Math.hypot(vx, vz);
        if (rad > 0.04) {
          const theta = Math.atan2(vz, vx);
          const bulgeEnvelope = THREE.MathUtils.clamp((vy + 0.65) / 2.2, 0, 1);
          const crownFade = THREE.MathUtils.clamp((1.84 - vy) / 0.35, 0, 1);
          const scallop =
            1 + 0.042 * Math.abs(Math.sin(theta * (goreCount * 0.5))) * bulgeEnvelope * crownFade;
          envPos.setXYZ(i, vx * scallop, vy, vz * scallop);
        }
      }
      envelopeGeo.computeVertexNormals();

      const balloonEnvelopeMat = new THREE.MeshPhysicalMaterial({
        map: textures.balloonCanopy,
        normalMap: textures.fabricNormal,
        normalScale: new THREE.Vector2(0.32, 0.32),
        roughnessMap: textures.fabricRoughness,
        roughness: 0.72,
        metalness: 0.02,
        sheen: 0.45,
        sheenRoughness: 0.6,
        sheenColor: new THREE.Color(0xfef3c7),
        side: THREE.DoubleSide,
      });

      const balloonEnvelope = new THREE.Mesh(envelopeGeo, balloonEnvelopeMat);
      registerPickable(balloonEnvelope, 'rag', ragStopIdx);

      const nomexCollarMat = new THREE.MeshStandardMaterial({
        color: 0xe5e0d4,
        normalMap: textures.fabricNormal,
        normalScale: new THREE.Vector2(0.25, 0.25),
        roughness: 0.85,
        side: THREE.DoubleSide,
      });
      const throatSkirt = new THREE.Mesh(
        new THREE.CylinderGeometry(0.34, 0.32, 0.2, 20, 1, true),
        nomexCollarMat
      );
      throatSkirt.position.y = -0.82;

      const loadRing = new THREE.Mesh(
        new THREE.TorusGeometry(0.33, 0.015, 8, 24),
        brushedAluminumMat
      );
      loadRing.rotation.x = Math.PI / 2;
      loadRing.position.y = -0.88;

      const addStrut = (pA: THREE.Vector3, pB: THREE.Vector3, radius: number, mat: THREE.Material) => {
        const dir = new THREE.Vector3().subVectors(pB, pA);
        const len = dir.length();
        const mesh = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, len, 6), mat);
        mesh.position.addVectors(pA, pB).multiplyScalar(0.5);
        mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());
        balloonAssembly!.add(mesh);
      };

      const cornerSigns: [number, number][] = [
        [-1, -1],
        [1, -1],
        [-1, 1],
        [1, 1],
      ];
      const leatherTrimMat = new THREE.MeshStandardMaterial({
        map: textures.leather.map,
        normalMap: textures.leather.normalMap,
        normalScale: new THREE.Vector2(0.45, 0.45),
        roughnessMap: textures.leather.roughnessMap,
        color: 0x6b3e26,
        roughness: 0.78,
        metalness: 0.04,
      });
      cornerSigns.forEach(([sx, sz]) => {
        const basketTop = new THREE.Vector3(sx * 0.27, -1.52, sz * 0.21);
        const burnerCorner = new THREE.Vector3(sx * 0.19, -1.06, sz * 0.16);
        const throatAnchor = new THREE.Vector3(sx * 0.25, -0.86, sz * 0.21);
        addStrut(basketTop, burnerCorner, 0.014, leatherTrimMat);
        addStrut(burnerCorner, throatAnchor, 0.006, brushedAluminumMat);
      });

      const burnerGroup = new THREE.Group();
      burnerGroup.position.set(0, -1.06, 0);
      const burnerFrame = new THREE.Mesh(
        new THREE.BoxGeometry(0.4, 0.025, 0.34),
        darkStructuralMat
      );
      burnerGroup.add(burnerFrame);

      const burnerFlameGeo = new THREE.ConeGeometry(0.095, 0.38, 14, 1, true);
      burnerFlameGeo.translate(0, 0.19, 0);
      balloonFlameMesh = new THREE.Mesh(
        burnerFlameGeo,
        new THREE.MeshBasicMaterial({
          color: 0xff8a1e,
          transparent: true,
          opacity: 0.78,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
          side: THREE.DoubleSide,
        })
      );
      balloonFlameMesh.position.set(0, 0.11, 0);

      burnerCoreMesh = new THREE.Mesh(
        new THREE.ConeGeometry(0.048, 0.18, 10, 1, true),
        new THREE.MeshBasicMaterial({
          color: 0xfef3c7,
          transparent: true,
          opacity: 0.9,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
          side: THREE.DoubleSide,
        })
      );
      burnerCoreMesh.position.set(0, 0.17, 0);

      balloonBurnerLight = new THREE.PointLight(0xff7b1c, 2.4, 6.2, 1.8);
      balloonBurnerLight.position.set(0, 0.48, 0);
      burnerGroup.add(balloonFlameMesh, burnerCoreMesh, balloonBurnerLight);

      const basketGroup = new THREE.Group();
      basketGroup.position.set(0, -1.72, 0);
      const wickerMat = new THREE.MeshStandardMaterial({
        map: textures.wickerWeave,
        normalMap: textures.wood.normalMap,
        normalScale: new THREE.Vector2(0.55, 0.55),
        roughness: 0.92,
        metalness: 0.02,
      });
      const basketShell = new THREE.Mesh(new THREE.BoxGeometry(0.58, 0.38, 0.46), wickerMat);
      const rimFB = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.068, 0.068), leatherTrimMat);
      rimFB.position.set(0, 0.2, 0.22);
      const rimBack = rimFB.clone();
      rimBack.position.z = -0.22;
      const rimSideL = new THREE.Mesh(new THREE.BoxGeometry(0.068, 0.068, 0.5), leatherTrimMat);
      rimSideL.position.set(-0.28, 0.2, 0);
      const rimSideR = rimSideL.clone();
      rimSideR.position.x = 0.28;
      basketGroup.add(basketShell, rimFB, rimBack, rimSideL, rimSideR);

      balloonAssembly.add(balloonEnvelope, throatSkirt, loadRing, burnerGroup, basketGroup);

      const voraStopIdx = findStopIndex('proj-vora-ai');
      voraRelayGroup = new THREE.Group();
      voraRelayGroup.position.set(...HUB_ANCHORS.voraRelayAnchor);
      voraRelayCore = new THREE.Group();
      const relayBus = new THREE.Mesh(
        new THREE.CylinderGeometry(0.42, 0.48, 1.45, 16),
        whiteHullMat
      );
      relayBus.rotation.x = Math.PI / 2;
      registerPickable(relayBus, 'proj-vora-ai', voraStopIdx);
      const trussRing = new THREE.Mesh(
        new THREE.TorusGeometry(1.18, 0.04, 10, 40),
        brushedAluminumMat
      );
      trussRing.rotation.x = Math.PI / 2;
      const beaconCrown = new THREE.Mesh(new THREE.SphereGeometry(0.09, 12, 12), cyanGlowMat);
      beaconCrown.position.y = 0.68;
      [-1, 1].forEach((side) => {
        const wing = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.04, 0.74), solarPanelMat);
        wing.position.set(side * 1.5, 0.08, 0);
        wing.rotation.z = side * 0.08;
        voraRelayCore!.add(wing);
      });
      voraRelayCore.add(relayBus, trussRing, beaconCrown);
      voraRelayGroup.add(voraRelayCore);
      scene.add(voraRelayGroup);

      spaceportHub = buildSpaceportComplex(hubMats);
      scene.add(spaceportHub.group);
    };

    const ensureStage4 = () => {
      if (stage4Built || disposed) return;
      stage4Built = true;

      spaceStageGroup = new THREE.Group();
      spaceStageGroup.visible = false;
      scene.add(spaceStageGroup);

      const STAR_COUNT = engineState.quality === 'epic' ? 1800 : 1000;
      const starPositions = new Float32Array(STAR_COUNT * 3);
      const starSeeds = new Float32Array(STAR_COUNT);
      const starTemps = new Float32Array(STAR_COUNT);
      for (let i = 0; i < STAR_COUNT; i++) {
        const angle = hashSeed(i * 3.1) * Math.PI * 2;
        const radius = 14 + hashSeed(i * 7.3) * 46;
        const z = -225 - hashSeed(i * 11.7) * 215;
        starPositions.set([Math.cos(angle) * radius, 14 + hashSeed(i * 5.9) * 42, z], i * 3);
        starSeeds[i] = hashSeed(i);
        starTemps[i] = hashSeed(i + 101);
      }
      const starGeo = new THREE.BufferGeometry();
      starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
      starGeo.setAttribute('aSeed', new THREE.BufferAttribute(starSeeds, 1));
      starGeo.setAttribute('aTemp', new THREE.BufferAttribute(starTemps, 1));

      starUniforms = {
        uTime: { value: 0 },
        uSize: { value: 1.55 },
        uBoost: { value: 0 },
        uOpacity: { value: 0 },
        uChalk: { value: new THREE.Color(PALETTE_NUM.chalk) },
        uHot: { value: new THREE.Color(PALETTE_NUM.amber) },
        uCyan: { value: new THREE.Color(PALETTE_NUM.cyan) },
      };

      const starPoints = new THREE.Points(
        starGeo,
        new THREE.ShaderMaterial({
          uniforms: starUniforms,
          vertexShader: STARFIELD_WARP_VERTEX,
          fragmentShader: STARFIELD_WARP_FRAGMENT,
          transparent: true,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
        })
      );
      starPoints.frustumCulled = false;
      spaceStageGroup.add(starPoints);

      const spaceSunDir = new THREE.Vector3(36, 18, 24).normalize();

      recedingEarthGroup = new THREE.Group();
      recedingEarthGroup.position.set(...HUB_ANCHORS.recedingEarth);
      recedingEarthGroup.rotation.z = THREE.MathUtils.degToRad(23.4);
      const RECEDING_EARTH_R = 8.4;
      const earthUniforms: Record<string, THREE.IUniform> = {
        uDayMap: { value: textures.earthDay },
        uNightMap: { value: textures.earthNight },
        uNormalMap: { value: textures.earthNormal },
        uSpecularMap: { value: textures.earthSpecular },
        uSunDir: { value: spaceSunDir },
      };
      recedingEarthMesh = new THREE.Mesh(
        new THREE.SphereGeometry(RECEDING_EARTH_R, 48, 36),
        new THREE.ShaderMaterial({
          uniforms: earthUniforms,
          vertexShader: EARTH_DAY_NIGHT_VERTEX,
          fragmentShader: EARTH_DAY_NIGHT_FRAGMENT,
        })
      );
      recedingCloudsMesh = new THREE.Mesh(
        new THREE.SphereGeometry(RECEDING_EARTH_R * 1.014, 40, 32),
        new THREE.MeshStandardMaterial({
          color: 0xffffff,
          map: textures.earthClouds,
          alphaMap: textures.earthClouds,
          transparent: true,
          opacity: 0.78,
          depthWrite: false,
          roughness: 0.9,
        })
      );
      const recedingAtmo = createPlanetAtmosphereMesh(RECEDING_EARTH_R * 1.055, 0x60a5fa, 0.72);
      recedingEarthGroup.add(recedingEarthMesh, recedingCloudsMesh, recedingAtmo);
      spaceStageGroup.add(recedingEarthGroup);

      const neoStopIdx = findStopIndex('proj-neo-era-cuan');
      moonGroup = new THREE.Group();
      moonGroup.position.set(...HUB_ANCHORS.moonAnchor);
      const MOON_R = 2.1;
      moonMesh = new THREE.Mesh(
        new THREE.SphereGeometry(MOON_R, 52, 36),
        new THREE.MeshStandardMaterial({
          map: textures.moon,
          roughness: 0.94,
          metalness: 0.02,
        })
      );
      registerPickable(moonMesh, 'proj-neo-era-cuan', neoStopIdx);
      lunarProbePivot = new THREE.Group();
      const lunarProbe = createSatelliteAssembly(0.42, true);
      lunarProbe.position.set(MOON_R * 1.65, 0.55, 0.45);
      lunarProbePivot.add(lunarProbe);
      moonGroup.add(moonMesh, lunarProbePivot);
      spaceStageGroup.add(moonGroup);

      const catatStopIdx = findStopIndex('proj-catat-crypto');
      marsJupiterGroup = new THREE.Group();
      const MARS_R = 2.15;
      marsMesh = new THREE.Mesh(
        new THREE.SphereGeometry(MARS_R, 52, 36),
        new THREE.MeshStandardMaterial({
          map: textures.mars,
          roughness: 0.89,
          metalness: 0.02,
        })
      );
      marsMesh.position.set(...HUB_ANCHORS.marsAnchor);
      registerPickable(marsMesh, 'proj-catat-crypto', catatStopIdx);
      const marsAtmo = createPlanetAtmosphereMesh(MARS_R * 1.045, 0xd97742, 0.44);
      marsAtmo.position.copy(marsMesh.position);

      const JUPITER_R = 3.1;
      jupiterMesh = new THREE.Mesh(
        new THREE.SphereGeometry(JUPITER_R, 52, 36),
        new THREE.MeshStandardMaterial({
          map: textures.jupiter,
          roughness: 0.76,
          metalness: 0.02,
        })
      );
      jupiterMesh.position.set(...HUB_ANCHORS.jupiterAnchor);
      const jupiterAtmo = createPlanetAtmosphereMesh(JUPITER_R * 1.045, 0xd99b52, 0.44);
      jupiterAtmo.position.copy(jupiterMesh.position);
      marsJupiterGroup.add(marsMesh, marsAtmo, jupiterMesh, jupiterAtmo);
      spaceStageGroup.add(marsJupiterGroup);

      const archiveStopIdx = findStopIndex('archive');
      saturnArchiveGroup = new THREE.Group();
      saturnArchiveGroup.position.set(...HUB_ANCHORS.saturnAnchor);
      const SATURN_R = 2.1;
      const saturnTilt = new THREE.Group();
      saturnTilt.rotation.z = THREE.MathUtils.degToRad(26.7);
      saturnSphere = new THREE.Mesh(
        new THREE.SphereGeometry(SATURN_R, 52, 36),
        new THREE.MeshStandardMaterial({
          map: textures.saturn,
          roughness: 0.78,
          metalness: 0.03,
        })
      );
      const saturnAtmo = createPlanetAtmosphereMesh(SATURN_R * 1.045, 0xe8c488, 0.44);
      const saturnRingGeo = createPlanetaryRingGeometry(SATURN_R * 1.28, SATURN_R * 2.34, 96);
      saturnRings = new THREE.Mesh(
        saturnRingGeo,
        new THREE.MeshStandardMaterial({
          map: textures.saturnRingAlpha,
          color: 0xf4ebd9,
          transparent: true,
          opacity: 0.94,
          alphaTest: 0.01,
          roughness: 0.8,
          metalness: 0.04,
          side: THREE.DoubleSide,
          depthWrite: false,
        })
      );
      saturnRings.rotation.x = 0.24;
      saturnTilt.add(saturnSphere, saturnAtmo, saturnRings);
      saturnArchiveGroup.add(saturnTilt);

      ARCHIVE_PROJECTS.forEach((ap, idx) => {
        const orbitPivot = new THREE.Group();
        orbitPivot.rotation.z = (idx % 2 === 0 ? 1 : -1) * 0.22;
        const angle = (idx / ARCHIVE_PROJECTS.length) * Math.PI * 2;
        const rad = SATURN_R * 2.15;
        const cubeSat = createSatelliteAssembly(0.38, idx % 2 === 0);
        cubeSat.position.set(Math.cos(angle) * rad, (idx - 1.5) * 0.36, Math.sin(angle) * rad);
        cubeSat.lookAt(0, 0, 0);
        registerPickable(cubeSat.children[0], ap.id, archiveStopIdx);
        orbitPivot.add(cubeSat);
        archiveModules.push(orbitPivot);
        saturnArchiveGroup!.add(orbitPivot);
      });
      spaceStageGroup.add(saturnArchiveGroup);

      observatoryHub = buildDeepSpaceObservatory(hubMats);
      spaceStageGroup.add(observatoryHub.group);
    };

    const ensureStagesForProgress = (t: number) => {
      if (t >= 0.7 && !stage2Built) ensureStage2();
      if (t >= 4.2 && !stage3Built) ensureStage3();
      if (t >= 7.2 && !stage4Built) ensureStage4();
    };

    const raycaster = new THREE.Raycaster();
    raycaster.layers.set(1);
    const pointerNdc = new THREE.Vector2();
    const projectedVec = new THREE.Vector3();
    const camSplineTarget = new THREE.Vector3();
    const lookSplineTarget = new THREE.Vector3();
    const pointerParallax = { x: 0, y: 0 };
    const zoneColorA = new THREE.Color();
    const zoneColorB = new THREE.Color();

    let lastOrbitStop = -1;
    let frameCount = 0;
    let fpsAccum = 0;
    let prevHoverSig = '';

    const updateAtmosphereColors = (t: number) => {
      let z0 = ATMOSPHERE_ZONES[0];
      let z1 = ATMOSPHERE_ZONES[ATMOSPHERE_ZONES.length - 1];
      for (let i = 0; i < ATMOSPHERE_ZONES.length - 1; i++) {
        if (t >= ATMOSPHERE_ZONES[i].stopIndex && t <= ATMOSPHERE_ZONES[i + 1].stopIndex) {
          z0 = ATMOSPHERE_ZONES[i];
          z1 = ATMOSPHERE_ZONES[i + 1];
          break;
        }
      }
      const span = Math.max(0.001, z1.stopIndex - z0.stopIndex);
      const alpha = THREE.MathUtils.clamp((t - z0.stopIndex) / span, 0, 1);

      bgColor.copy(zoneColorA.setHex(z0.bg)).lerp(zoneColorB.setHex(z1.bg), alpha);
      fogColor.copy(zoneColorA.setHex(z0.fog)).lerp(zoneColorB.setHex(z1.fog), alpha);
      sceneFog.color.copy(fogColor);
      keyLight.color.copy(zoneColorA.setHex(z0.keyLight)).lerp(zoneColorB.setHex(z1.keyLight), alpha);
      rimLight.color.copy(zoneColorA.setHex(z0.rimLight)).lerp(zoneColorB.setHex(z1.rimLight), alpha);

      (skyUniforms.uZenithColor.value as THREE.Color)
        .copy(zoneColorA.setHex(z0.zenith))
        .lerp(zoneColorB.setHex(z1.zenith), alpha);
      (skyUniforms.uHorizonColor.value as THREE.Color)
        .copy(zoneColorA.setHex(z0.horizon))
        .lerp(zoneColorB.setHex(z1.horizon), alpha);
      (skyUniforms.uGroundColor.value as THREE.Color)
        .copy(zoneColorA.setHex(z0.groundSky))
        .lerp(zoneColorB.setHex(z1.groundSky), alpha);
      skyUniforms.uSunGlow.value = THREE.MathUtils.lerp(z0.sunGlow, z1.sunGlow, alpha);

      const spaceFactor = THREE.MathUtils.smoothstep(t, 8.25, 9.05);
      hemiLight.intensity = THREE.MathUtils.lerp(0.58, 0.14, spaceFactor);
      rimLight.intensity = THREE.MathUtils.lerp(0.34, 0.12, spaceFactor);
      keyLight.intensity = THREE.MathUtils.lerp(1.36, 1.85, spaceFactor);
      if (spaceFactor > 0.1) {
        keyLight.position.set(
          THREE.MathUtils.lerp(16, 36, spaceFactor),
          THREE.MathUtils.lerp(24, 18, spaceFactor),
          THREE.MathUtils.lerp(14, 24, spaceFactor)
        );
      } else {
        keyLight.position.set(16, 24, 14);
      }
      if (starUniforms) {
        starUniforms.uOpacity.value = spaceFactor;
      }
      milkyWayUniforms.uOpacity.value = spaceFactor;
      milkyWaySkyDome.visible = spaceFactor > 0.005;
      skyDome.visible = spaceFactor < 0.99;

      if (cloudUniforms) {
        (cloudUniforms.uFogColor.value as THREE.Color).copy(fogColor);
        cloudUniforms.uGlobalOpacity.value = 1 - THREE.MathUtils.smoothstep(t, 8.1, 9.15);
        const duskWarm = THREE.MathUtils.smoothstep(t, 5.5, 8.2);
        (cloudUniforms.uSunColor.value as THREE.Color)
          .copy(zoneColorA.setHex(0xfbf6ed))
          .lerp(zoneColorB.setHex(0xc8dcf0), duskWarm);
        (cloudUniforms.uShadowColor.value as THREE.Color)
          .copy(zoneColorA.setHex(0x637991))
          .lerp(zoneColorB.setHex(0x283c5c), duskWarm);
      }
    };

    const onPointerDown = (e: PointerEvent) => {
      if (engineState.cameraMode === 'orbit') return;
      const targetEl = e.target as HTMLElement | null;
      if (
        targetEl &&
        targetEl.closest('a, button, input, textarea, dialog, details, [data-interactive-ui]')
      ) {
        return;
      }
      engineState.pulse = 1.0;
      playPulseSfx(520);
      if (engineState.hovered) {
        const stopIdx = engineState.hovered.stopIndex;
        const stopEl = document.querySelectorAll('[data-stop]')[stopIdx];
        if (stopEl) {
          stopEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    };
    window.addEventListener('pointerdown', onPointerDown, { passive: true });

    const onResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      applyCameraFrustum(w, h);
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', onResize);

    const timer = new THREE.Timer();
    timer.connect(document);

    const animate = () => {
      timer.update();
      renderer.info.reset();
      const dt = Math.min(0.1, timer.getDelta());
      const elapsed = timer.getElapsed();
      engineState.time = elapsed;

      if (engineState.pulse > 0.001) {
        engineState.pulse = Math.max(0, engineState.pulse - dt * 1.55);
      } else {
        engineState.pulse = 0;
      }

      const t = engineState.t;
      ensureStagesForProgress(t);
      updateSpectrumBands();
      updateAtmosphereColors(t);
      updateAmbientAudio(t, engineState.velocity, engineState.pulse);

      const normT = Math.min(1, Math.max(0, t / (STOPS.length - 1)));
      const fleetState = starship.update(
        dt,
        elapsed,
        t,
        curves,
        engineState.velocity,
        engineState.pulse,
        engineState.pointer.x,
        engineState.pointer.y,
        responsiveVehicleScale
      );

      if (starUniforms) {
        starUniforms.uTime.value = elapsed;
        starUniforms.uBoost.value = Math.min(1, engineState.pulse + Math.abs(engineState.velocity) * 0.18);
        starUniforms.uSize.value = renderer.getPixelRatio() * 1.55;
      }

      if (engineState.cameraMode === 'orbit') {
        if (!orbitControls.enabled) {
          orbitControls.enabled = true;
          applyCameraFrustum(window.innerWidth, window.innerHeight);
        }
        if (lastOrbitStop !== engineState.activeStop) {
          lastOrbitStop = engineState.activeStop;
          orbitControls.target.copy(fleetState.activePos);
        }
        orbitControls.update(dt);
      } else {
        if (orbitControls.enabled) {
          orbitControls.enabled = false;
          lastOrbitStop = -1;
          applyCameraFrustum(window.innerWidth, window.innerHeight);
        }
        camPosSpline.getPoint(normT, camSplineTarget);
        camLookSpline.getPoint(normT, lookSplineTarget);

        if (!engineState.reduced) {
          const dampFactor = 1 - Math.exp(-dt * 3.8);
          pointerParallax.x += (engineState.pointer.x * 0.34 - pointerParallax.x) * dampFactor;
          pointerParallax.y += (engineState.pointer.y * 0.2 - pointerParallax.y) * dampFactor;
        }

        if (isMobileViewport) {
          const lateralOffset = (camSplineTarget.x - lookSplineTarget.x) * 0.68;
          camera.position.set(
            lookSplineTarget.x + lateralOffset + pointerParallax.x * 0.35,
            camSplineTarget.y + 0.6 + pointerParallax.y * 0.35,
            camSplineTarget.z + 2.4
          );
          lookSplineTarget.y -= 0.72;
          camera.lookAt(lookSplineTarget);
        } else {
          camera.position.set(
            camSplineTarget.x + pointerParallax.x,
            camSplineTarget.y + pointerParallax.y,
            camSplineTarget.z
          );
          camera.lookAt(lookSplineTarget);
        }
      }

      skyDome.position.copy(camera.position);
      milkyWaySkyDome.position.copy(camera.position);

      earthLandscapeGroup.visible = t <= 7.25;
      highwayGroup.visible = t <= 2.75;
      grandStationGroup.visible = t <= 3.15;

      if (railwayGroup) {
        railwayGroup.visible = t >= 0.35 && t <= 6.8;
      }
      if (airportHub) {
        airportHub.group.visible = t >= 3.2 && t <= 7.6;
        if (airportHub.group.visible) {
          airportHub.radarPivot.rotation.y = elapsed * 1.15;
          airportHub.runwayBeaconMat.emissiveIntensity = 1.45 + Math.sin(elapsed * 3.6) * 0.45;
        }
      }

      if (cloudUniforms && cloudInstancedMesh) {
        cloudUniforms.uTime.value = elapsed;
        cloudInstancedMesh.visible = (cloudUniforms.uGlobalOpacity.value as number) > 0.01;
      }
      if (cityAboveGroup) {
        cityAboveGroup.visible = t >= 4.8 && t <= 8.85 && (milkyWayUniforms.uOpacity.value as number) < 0.88;
      }
      if (balloonGroup && balloonAssembly && balloonFlameMesh && burnerCoreMesh && balloonBurnerLight) {
        balloonGroup.visible = t >= 4.8 && t <= 7.8;
        if (balloonGroup.visible) {
          balloonAssembly.position.y = Math.sin(elapsed * 0.75) * 0.14;
          balloonAssembly.rotation.y = elapsed * 0.08;
          balloonAssembly.rotation.z = Math.sin(elapsed * 0.42) * 0.032;
          balloonAssembly.rotation.x = Math.cos(elapsed * 0.35) * 0.025;
          const burnerPulse = 0.65 + 0.35 * Math.sin(elapsed * 3.4) * Math.sin(elapsed * 19.0 + 0.8);
          balloonFlameMesh.scale.set(
            0.85 + burnerPulse * 0.25,
            0.72 + burnerPulse * 0.52,
            0.85 + burnerPulse * 0.25
          );
          burnerCoreMesh.scale.set(1, 0.8 + burnerPulse * 0.45, 1);
          balloonBurnerLight.intensity = 1.8 + burnerPulse * 1.6;
        } else {
          balloonBurnerLight.intensity = 0;
        }
      }
      if (voraRelayGroup && voraRelayCore) {
        voraRelayGroup.visible = t >= 5.5 && t <= 8.5;
        if (voraRelayGroup.visible) {
          const open = stopOpenProgress(7);
          voraRelayCore.rotation.y = elapsed * 0.18;
          voraRelayGroup.scale.setScalar(0.84 + 0.16 * open);
        }
      }
      if (spaceportHub) {
        spaceportHub.group.visible = t >= 6.4 && t <= 9.65;
        if (spaceportHub.group.visible) {
          const armSwing = THREE.MathUtils.smoothstep(fleetState.rocketLaunchProgress, 0.0, 0.45);
          spaceportHub.swingArms.forEach((arm, idx) => {
            arm.rotation.y = armSwing * (1.1 + idx * 0.12);
          });
          const cryoVisible = fleetState.rocketLaunchProgress < 0.35;
          spaceportHub.cryoPlumes.forEach((puff, idx) => {
            puff.visible = cryoVisible;
            if (cryoVisible) {
              const drift = (elapsed * 0.55 + idx * 0.25) % 1;
              puff.position.y = 0.72 + drift * 1.05;
              puff.position.x = 0.92 + drift * 0.75 + Math.sin(elapsed * 1.5 + idx) * 0.08;
              puff.scale.setScalar(0.65 + drift * 0.9);
            }
          });
          spaceportHub.padBeaconMat.emissiveIntensity = 1.45 + Math.sin(elapsed * 4.2) * 0.55;
        }
      }

      if (spaceStageGroup) {
        spaceStageGroup.visible = t >= 8.15;
        if (spaceStageGroup.visible) {
          if (recedingEarthGroup && recedingEarthMesh && recedingCloudsMesh) {
            recedingEarthGroup.visible = t >= 8.2 && t <= 9.55;
            if (recedingEarthGroup.visible) {
              recedingEarthMesh.rotation.y = elapsed * 0.04;
              recedingCloudsMesh.rotation.y = elapsed * 0.065;
            }
          }
          if (moonGroup && moonMesh && lunarProbePivot) {
            moonGroup.visible = t >= 8.2 && t <= 10.7;
            if (moonGroup.visible) {
              const open = stopOpenProgress(9);
              moonMesh.rotation.y = elapsed * 0.07;
              lunarProbePivot.rotation.y = elapsed * 0.24;
              moonGroup.scale.setScalar(0.86 + 0.14 * open);
            }
          }
          if (marsJupiterGroup && marsMesh && jupiterMesh) {
            marsJupiterGroup.visible = t >= 8.8 && t <= 11.45;
            if (marsJupiterGroup.visible) {
              marsMesh.rotation.y = elapsed * 0.09;
              jupiterMesh.rotation.y = elapsed * 0.07;
            }
          }
          if (saturnArchiveGroup && saturnSphere && saturnRings) {
            saturnArchiveGroup.visible = t >= 9.6 && t <= 12.0;
            if (saturnArchiveGroup.visible) {
              saturnSphere.rotation.y = elapsed * 0.1;
              saturnRings.rotation.y = elapsed * 0.03;
              archiveModules.forEach((mod, idx) => {
                mod.rotation.y = elapsed * (0.2 + idx * 0.04);
              });
            }
          }
          if (observatoryHub) {
            observatoryHub.group.visible = t >= 10.6;
            if (observatoryHub.group.visible) {
              observatoryHub.exoplanetMesh.rotation.y = elapsed * 0.055;
              observatoryHub.exoplanetRing.rotation.y = -elapsed * 0.02;
              observatoryHub.centrifugePivot.rotation.z = elapsed * 0.22;
              observatoryHub.dockingRingGroup.rotation.z = -elapsed * 0.28;
            }
          }
        }
      }

      if (engineState.pointer.active && frameCount % 3 === 0) {
        pointerNdc.set(engineState.pointer.x, engineState.pointer.y);
        raycaster.setFromCamera(pointerNdc, camera);
        const hits = raycaster.intersectObjects(pickables, false);
        if (hits.length > 0 && hits[0].distance < 52) {
          const hitObj = hits[0].object;
          hitObj.getWorldPosition(projectedVec);
          projectedVec.project(camera);
          const sx = ((projectedVec.x + 1) / 2) * window.innerWidth;
          const sy = ((-projectedVec.y + 1) / 2) * window.innerHeight;
          engineState.hovered = {
            hoverKey: String(hitObj.userData.hoverKey ?? 'edge'),
            screenX: sx,
            screenY: sy,
            stopIndex: Number(hitObj.userData.stopIndex ?? 0),
          };
        } else {
          engineState.hovered = null;
        }
      }

      renderer.render(scene, camera);

      const hoverSig = engineState.hovered
        ? `${engineState.hovered.hoverKey}|${Math.round(engineState.hovered.screenX)}|${Math.round(engineState.hovered.screenY)}`
        : '';
      if (hoverSig !== prevHoverSig) {
        prevHoverSig = hoverSig;
        notifyEngineUi();
      }

      frameCount++;
      fpsAccum += dt;
      if (frameCount === 1 || frameCount >= 30) {
        if (frameCount >= 30) {
          engineState.stats.fps = Math.min(120, Math.round(frameCount / Math.max(0.001, fpsAccum)));
          frameCount = 0;
          fpsAccum = 0;
        }
        engineState.stats.drawCalls = renderer.info.render.calls;
        engineState.stats.triangles = renderer.info.render.triangles;
        engineState.stats.camZ = Math.round(camera.position.z * 10) / 10;
      }
    };

    let disposed = false;
    let bootStarted = false;

    const scheduleIdleWork = (fn: () => void, delayMs: number) => {
      if (disposed) return;
      window.setTimeout(() => {
        if (disposed) return;
        const win = window as Window & {
          requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
        };
        if (typeof win.requestIdleCallback === 'function') {
          win.requestIdleCallback(() => {
            if (!disposed) fn();
          }, { timeout: 600 });
        } else {
          fn();
        }
      }, delayMs);
    };

    const bootStage = async () => {
      if (bootStarted || disposed) return;
      bootStarted = true;

      engineState.boot = { progress: 42, stageKey: 'models', ready: false };
      notifyEngineUi();

      await Promise.all([
        textures.criticalReady.then(() => {
          if (!disposed) {
            engineState.boot = {
              progress: Math.max(engineState.boot.progress, 66),
              stageKey: 'car',
              ready: false,
            };
            notifyEngineUi();
          }
        }),
        starship.ready.then(() => {
          if (!disposed) {
            engineState.boot = {
              progress: Math.max(engineState.boot.progress, 78),
              stageKey: 'lighting',
              ready: false,
            };
            notifyEngineUi();
          }
        }),
      ]);

      if (disposed) return;

      engineState.boot = { progress: 88, stageKey: 'lighting', ready: false };
      notifyEngineUi();

      await renderer.compileAsync(scene, camera).catch(() => {});
      if (disposed) return;

      engineState.boot = { progress: 96, stageKey: 'polish', ready: false };
      notifyEngineUi();

      animate();
      animate();
      await new Promise<void>((resolve) => {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => resolve());
        });
      });
      if (disposed) return;

      engineState.boot = { progress: 100, stageKey: 'ready', ready: true };
      notifyEngineUi();

      renderer.setAnimationLoop(animate);
      textures.startDeferredLoads();

      scheduleIdleWork(() => {
        ensureStage2();
        void renderer.compileAsync(scene, camera).catch(() => {});
        scheduleIdleWork(() => {
          ensureStage3();
          void renderer.compileAsync(scene, camera).catch(() => {});
          scheduleIdleWork(() => {
            ensureStage4();
            void renderer.compileAsync(scene, camera).catch(() => {});
          }, 260);
        }, 260);
      }, 220);
    };

    void bootStage();

    return () => {
      disposed = true;
      renderer.setAnimationLoop(null);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('pointerdown', onPointerDown);
      orbitControls.dispose();
      starship.dispose();
      timer.dispose();
      normalMap.dispose();
      glowSpriteMap.dispose();
      cloudAtlasMap.dispose();
      hullPanelMap.dispose();
      goldFoilTex.map.dispose();
      goldFoilTex.bumpMap.dispose();
      solarCellMap.dispose();
      textures.dispose();
      disposeObjectSubtree(scene);
      renderer.dispose();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="stage-canvas"
      aria-hidden="true"
    />
  );
}
