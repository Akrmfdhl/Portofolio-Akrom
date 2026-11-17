import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import {
  ARCHIVE_PROJECTS,
  ATMOSPHERE_ZONES,
  EXPERIENCES,
  FEATURED_PROJECTS,
  PALETTE_NUM,
  STOPS,
  engineState,
  findStopIndex,
  findStopsByKind,
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
  UNREAL_POST_SHADER,
} from './shaders';
import { createStarshipRocket } from './RocketShip';
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
  const width = 104;
  const depth = 192;
  const segX = 112;
  const segZ = 210;
  const geo = new THREE.PlaneGeometry(width, depth, segX, segZ);
  geo.rotateX(-Math.PI / 2);
  geo.translate(0, 0, -72);

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
    const maxDpr = engineState.quality === 'epic' ? 1.75 : 1.25;
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
    const sceneFog = new THREE.Fog(ATMOSPHERE_ZONES[0].fog, 28, 128);
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

    const woodSleeperMat = new THREE.MeshStandardMaterial({
      map: textures.wood.map,
      normalMap: textures.wood.normalMap,
      roughnessMap: textures.wood.roughnessMap,
      color: 0x705842,
      metalness: 0.04,
      roughness: 0.9,
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

    const camera = new THREE.PerspectiveCamera(40, window.innerWidth / window.innerHeight, 0.1, 220);
    camera.position.set(...STOPS[0].cam);

    let responsiveRocketScale = 1.0;
    let isMobileViewport = window.innerWidth < 900;

    const applyCameraFrustum = (w: number, h: number) => {
      isMobileViewport = w < 900;
      camera.aspect = w / h;
      camera.clearViewOffset();
      if (w < 640) {
        camera.fov = 52;
        responsiveRocketScale = 0.86;
      } else if (w < 900) {
        camera.fov = 48;
        responsiveRocketScale = 0.92;
      } else if (w < 1280) {
        camera.fov = 42;
        responsiveRocketScale = 1.0;
      } else {
        camera.fov = 39;
        responsiveRocketScale = 1.05;
      }
      camera.updateProjectionMatrix();
    };
    applyCameraFrustum(window.innerWidth, window.innerHeight);

    const orbitControls = new OrbitControls(camera, canvas);
    orbitControls.enabled = false;
    orbitControls.enableDamping = true;
    orbitControls.dampingFactor = 0.06;
    orbitControls.minDistance = 2.8;
    orbitControls.maxDistance = 36;

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
    scene.add(milkyWaySkyDome);

    const composer = new EffectComposer(renderer);
    const renderPass = new RenderPass(scene, camera);
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      0.08,
      0.22,
      1.12
    );
    const postPass = new ShaderPass(UNREAL_POST_SHADER);
    const outputPass = new OutputPass();
    composer.addPass(renderPass);
    composer.addPass(bloomPass);
    composer.addPass(postPass);
    composer.addPass(outputPass);

    const pickables: THREE.Object3D[] = [];
    const registerPickable = (
      obj: THREE.Object3D,
      name: string,
      category: string,
      metric: string,
      stopIndex: number
    ) => {
      obj.layers.enable(1);
      obj.userData = {
        ...obj.userData,
        pickable: true,
        nodeName: name,
        nodeCategory: category,
        nodeMetric: metric,
        stopIndex,
      };
      pickables.push(obj);
    };

    const STAR_COUNT = engineState.quality === 'epic' ? 1800 : 1000;
    const starPositions = new Float32Array(STAR_COUNT * 3);
    const starSeeds = new Float32Array(STAR_COUNT);
    const starTemps = new Float32Array(STAR_COUNT);
    for (let i = 0; i < STAR_COUNT; i++) {
      const angle = hashSeed(i * 3.1) * Math.PI * 2;
      const radius = 14 + hashSeed(i * 7.3) * 44;
      const z = -150 - hashSeed(i * 11.7) * 230;
      starPositions.set([Math.cos(angle) * radius, 8 + hashSeed(i * 5.9) * 34, z], i * 3);
      starSeeds[i] = hashSeed(i);
      starTemps[i] = hashSeed(i + 101);
    }
    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    starGeo.setAttribute('aSeed', new THREE.BufferAttribute(starSeeds, 1));
    starGeo.setAttribute('aTemp', new THREE.BufferAttribute(starTemps, 1));

    const starUniforms: Record<string, THREE.IUniform> = {
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
    scene.add(starPoints);

    const packetSpline = new THREE.CatmullRomCurve3(
      STOPS.map((s) => new THREE.Vector3(...s.packet)),
      false,
      'catmullrom',
      0.35
    );
    const camPosSpline = new THREE.CatmullRomCurve3(
      STOPS.map((s) => new THREE.Vector3(...s.cam)),
      false,
      'catmullrom',
      0.35
    );
    const camLookSpline = new THREE.CatmullRomCurve3(
      STOPS.map((s) => new THREE.Vector3(...s.look)),
      false,
      'catmullrom',
      0.35
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
      new THREE.PlaneGeometry(34, 96),
      new THREE.MeshPhysicalMaterial({
        color: 0x16425b,
        metalness: 0.72,
        roughness: 0.18,
        clearcoat: 0.55,
      })
    );
    riverPlane.rotation.x = -Math.PI / 2;
    riverPlane.position.set(0, -1.55, -88);
    earthLandscapeGroup.add(riverPlane);

    const pinePositions: { x: number; y: number; z: number; s: number }[] = [];
    for (let i = 0; i < 210; i++) {
      const side = i % 2 === 0 ? 1 : -1;
      const x = side * (3.6 + hashSeed(i * 4.3 + 1) * 18.0);
      const z = 14 - hashSeed(i * 6.7 + 3) * 144;
      const y = sampleMountainElevation(x, z);
      const nearStation = Math.abs(Math.abs(x) - 4.2) < 2.2 && z < -54 && z > -108;
      if (y > -0.3 && y < 4.8 && !nearStation) {
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

    const highwayGroup = new THREE.Group();
    scene.add(highwayGroup);

    const roadDeck = new THREE.Mesh(
      new THREE.BoxGeometry(2.6, 0.14, 68),
      new THREE.MeshStandardMaterial({
        map: textures.asphalt.map,
        normalMap: textures.asphalt.normalMap,
        normalScale: new THREE.Vector2(0.45, 0.45),
        roughnessMap: textures.asphalt.roughnessMap,
        color: 0x3b424c,
        roughness: 0.84,
        metalness: 0.06,
      })
    );
    roadDeck.position.set(0, -0.05, -14);
    highwayGroup.add(roadDeck);

    const laneDashCount = 34;
    const laneDashGeo = new THREE.BoxGeometry(0.06, 0.006, 0.95);
    const laneDashMesh = new THREE.InstancedMesh(
      laneDashGeo,
      new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.65 }),
      laneDashCount
    );
    const laneDummy = new THREE.Object3D();
    for (let i = 0; i < laneDashCount; i++) {
      laneDummy.position.set(0, 0.022, 18 - i * 2.0);
      laneDummy.updateMatrix();
      laneDashMesh.setMatrixAt(i, laneDummy.matrix);
    }
    laneDashMesh.instanceMatrix.needsUpdate = true;
    highwayGroup.add(laneDashMesh);

    const shoulderYellowMat = new THREE.MeshStandardMaterial({ color: 0xeab308, roughness: 0.55 });
    [-1.18, 1.18].forEach((sx) => {
      const edgeLine = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.006, 68), shoulderYellowMat);
      edgeLine.position.set(sx, 0.022, -14);
      highwayGroup.add(edgeLine);
    });

    const roadShoulder = new THREE.Mesh(
      new THREE.BoxGeometry(3.4, 0.12, 68),
      concreteMat
    );
    roadShoulder.position.set(0, -0.07, -14);
    highwayGroup.add(roadShoulder);

    const guardrailL = new THREE.Mesh(
      new THREE.BoxGeometry(0.06, 0.18, 66),
      brushedAluminumMat
    );
    guardrailL.position.set(-1.42, 0.12, -14);
    const guardrailR = guardrailL.clone();
    guardrailR.position.x = 1.42;
    highwayGroup.add(guardrailL, guardrailR);

    const lampPostGeo = new THREE.CylinderGeometry(0.025, 0.036, 1.65, 8);
    const lampBulbGeo = new THREE.BoxGeometry(0.22, 0.04, 0.08);
    const lampBulbMat = new THREE.MeshBasicMaterial({ color: 0xfde68a });
    for (let z = 12; z >= -42; z -= 9) {
      [-1.58, 1.58].forEach((lx) => {
        const pole = new THREE.Mesh(lampPostGeo, darkStructuralMat);
        pole.position.set(lx, 0.82, z);
        const bulb = new THREE.Mesh(lampBulbGeo, lampBulbMat);
        bulb.position.set(lx > 0 ? lx - 0.1 : lx + 0.1, 1.62, z);
        highwayGroup.add(pole, bulb);
      });
    }

    const edgeStop = STOPS[0];
    const scenicGantryGroup = new THREE.Group();
    scenicGantryGroup.position.set(...edgeStop.anchor);
    scene.add(scenicGantryGroup);

    const gantrySignBoard = new THREE.Mesh(
      new THREE.BoxGeometry(1.9, 0.72, 0.16),
      darkStructuralMat
    );
    gantrySignBoard.position.set(0, 1.55, 0);
    registerPickable(
      gantrySignBoard,
      'ALPINE PASSWAY · AKROM FADHIL',
      'Earth Coastal Mountain Highway · Grand Touring Car',
      'Scroll to drive across the mountain valley',
      0
    );
    const gantryPostL = new THREE.Mesh(
      new THREE.CylinderGeometry(0.06, 0.08, 2.2, 10),
      brushedAluminumMat
    );
    gantryPostL.position.set(-0.75, 0.8, 0);
    const gantryPostR = gantryPostL.clone();
    gantryPostR.position.x = 0.75;
    scenicGantryGroup.add(gantrySignBoard, gantryPostL, gantryPostR);

    const proxyStop = STOPS[findStopIndex('proxy')];
    const proxyGroup = new THREE.Group();
    proxyGroup.position.set(...proxyStop.anchor);
    scene.add(proxyGroup);

    const tunnelArch = new THREE.Mesh(
      new THREE.TorusGeometry(1.45, 0.22, 12, 32, Math.PI),
      concreteMat
    );
    tunnelArch.position.set(0, 0.05, 0);
    registerPickable(
      tunnelArch,
      'MOUNTAIN PASS OVERLOOK · CV SUMMARY',
      'Scroll down to board the Mountain Express Train',
      '< 100ms Sync · 65% Ownership · 10k/s',
      proxyStop.index
    );
    const tunnelCanopy = new THREE.Mesh(
      new THREE.BoxGeometry(2.6, 0.12, 2.8),
      solarPanelMat
    );
    tunnelCanopy.position.set(0, 1.55, 0);
    proxyGroup.add(tunnelArch, tunnelCanopy);

    const rackStops = findStopsByKind('rack');
    const rackCorridorGroup = new THREE.Group();
    scene.add(rackCorridorGroup);

    const firstStationZ = rackStops[0].anchor[2];
    const lastStationZ = rackStops[rackStops.length - 1].anchor[2];
    const viaductStartZ = firstStationZ + 14;
    const viaductEndZ = lastStationZ - 14;
    const viaductLen = Math.abs(viaductEndZ - viaductStartZ);
    const viaductCenterZ = (viaductStartZ + viaductEndZ) / 2;

    const viaductDeck = new THREE.Mesh(
      new THREE.BoxGeometry(2.05, 0.28, viaductLen),
      concreteMat
    );
    viaductDeck.position.set(0, 2.02, viaductCenterZ);

    [-0.96, 0.96].forEach((cx) => {
      const curb = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.14, viaductLen), concreteMat);
      curb.position.set(cx, 2.2, viaductCenterZ);
      rackCorridorGroup.add(curb);
    });

    const ballastBed = new THREE.Mesh(
      new THREE.BoxGeometry(1.36, 0.07, viaductLen),
      new THREE.MeshStandardMaterial({
        map: textures.ballast.map,
        normalMap: textures.ballast.normalMap,
        normalScale: new THREE.Vector2(0.8, 0.8),
        roughnessMap: textures.ballast.roughnessMap,
        color: 0x7c828a,
        roughness: 0.94,
        metalness: 0.04,
      })
    );
    ballastBed.position.set(0, 2.18, viaductCenterZ);

    const sleeperSpacing = 0.44;
    const sleeperCount = Math.floor(viaductLen / sleeperSpacing);
    const sleeperInstanced = new THREE.InstancedMesh(
      new THREE.BoxGeometry(1.06, 0.052, 0.17),
      woodSleeperMat,
      sleeperCount
    );
    const fastenerInstanced = new THREE.InstancedMesh(
      new THREE.BoxGeometry(0.085, 0.02, 0.07),
      darkStructuralMat,
      sleeperCount * 2
    );
    const trackDummy = new THREE.Object3D();
    for (let i = 0; i < sleeperCount; i++) {
      const sz = viaductStartZ - 0.4 - i * sleeperSpacing;
      trackDummy.position.set(0, 2.225, sz);
      trackDummy.updateMatrix();
      sleeperInstanced.setMatrixAt(i, trackDummy.matrix);

      trackDummy.position.set(-0.24, 2.252, sz);
      trackDummy.updateMatrix();
      fastenerInstanced.setMatrixAt(i * 2, trackDummy.matrix);

      trackDummy.position.set(0.24, 2.252, sz);
      trackDummy.updateMatrix();
      fastenerInstanced.setMatrixAt(i * 2 + 1, trackDummy.matrix);
    }
    sleeperInstanced.instanceMatrix.needsUpdate = true;
    fastenerInstanced.instanceMatrix.needsUpdate = true;

    [-0.24, 0.24].forEach((rx) => {
      const foot = new THREE.Mesh(new THREE.BoxGeometry(0.085, 0.014, viaductLen), darkStructuralMat);
      foot.position.set(rx, 2.248, viaductCenterZ);
      const web = new THREE.Mesh(new THREE.BoxGeometry(0.024, 0.026, viaductLen), darkStructuralMat);
      web.position.set(rx, 2.264, viaductCenterZ);
      const head = new THREE.Mesh(new THREE.BoxGeometry(0.052, 0.022, viaductLen), railSteelMat);
      head.position.set(rx, 2.282, viaductCenterZ);
      rackCorridorGroup.add(foot, web, head);
    });

    rackCorridorGroup.add(viaductDeck, ballastBed, sleeperInstanced, fastenerInstanced);

    const catenarySpan = 7.5;
    const mastZList: number[] = [];
    for (let z = viaductStartZ - 1; z >= viaductEndZ + 1; z -= catenarySpan) {
      mastZList.push(z);
      const pier = new THREE.Mesh(
        new THREE.CylinderGeometry(0.32, 0.44, 6.4, 12),
        concreteMat
      );
      pier.position.set(0, -1.2, z);

      const mastSide = -0.96;
      const mastPole = new THREE.Mesh(
        new THREE.BoxGeometry(0.09, 1.48, 0.09),
        brushedAluminumMat
      );
      mastPole.position.set(mastSide, 2.94, z);

      const mastFoot = new THREE.Mesh(
        new THREE.BoxGeometry(0.18, 0.06, 0.18),
        darkStructuralMat
      );
      mastFoot.position.set(mastSide, 2.22, z);

      const lowerArm = new THREE.Mesh(
        new THREE.BoxGeometry(1.12, 0.032, 0.032),
        brushedAluminumMat
      );
      lowerArm.position.set(-0.4, 3.04, z);

      const stayArm = new THREE.Mesh(
        new THREE.CylinderGeometry(0.012, 0.012, 1.18, 8),
        brushedAluminumMat
      );
      stayArm.rotation.z = Math.PI / 2 - 0.34;
      stayArm.position.set(-0.46, 3.24, z);

      const insulator = new THREE.Mesh(
        new THREE.CylinderGeometry(0.034, 0.034, 0.14, 10),
        new THREE.MeshStandardMaterial({ color: 0xb91c1c, roughness: 0.35 })
      );
      insulator.rotation.z = Math.PI / 2;
      insulator.position.set(-0.76, 3.04, z);

      const steadyDrop = new THREE.Mesh(
        new THREE.CylinderGeometry(0.008, 0.008, 0.12, 6),
        brushedAluminumMat
      );
      steadyDrop.position.set(0, 3.02, z);

      rackCorridorGroup.add(pier, mastPole, mastFoot, lowerArm, stayArm, insulator, steadyDrop);
    }

    const catenaryWireMat = new THREE.MeshStandardMaterial({
      color: 0xd4a373,
      metalness: 0.72,
      roughness: 0.34,
    });
    const contactCurve = new THREE.LineCurve3(
      new THREE.Vector3(0, 2.98, viaductStartZ - 1),
      new THREE.Vector3(0, 2.98, mastZList[mastZList.length - 1])
    );
    const contactWireMesh = new THREE.Mesh(
      new THREE.TubeGeometry(contactCurve, 32, 0.008, 6, false),
      catenaryWireMat
    );
    rackCorridorGroup.add(contactWireMesh);

    const dropperMat = brushedAluminumMat;
    for (let i = 0; i < mastZList.length - 1; i++) {
      const z0 = mastZList[i];
      const z1 = mastZList[i + 1];
      const zMid = (z0 + z1) * 0.5;
      const messengerCurve = new THREE.QuadraticBezierCurve3(
        new THREE.Vector3(0, 3.44, z0),
        new THREE.Vector3(0, 3.02, zMid),
        new THREE.Vector3(0, 3.44, z1)
      );
      const messengerMesh = new THREE.Mesh(
        new THREE.TubeGeometry(messengerCurve, 12, 0.007, 6, false),
        catenaryWireMat
      );
      rackCorridorGroup.add(messengerMesh);

      [0.25, 0.5, 0.75].forEach((u) => {
        const pt = messengerCurve.getPoint(u);
        const h = Math.max(0.04, pt.y - 2.98);
        const dropper = new THREE.Mesh(
          new THREE.CylinderGeometry(0.004, 0.004, h, 4),
          dropperMat
        );
        dropper.position.set(0, 2.98 + h * 0.5, pt.z);
        rackCorridorGroup.add(dropper);
      });
    }

    const tactileYellowMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      roughness: 0.65,
      metalness: 0.05,
    });
    const glassStationMat = new THREE.MeshPhysicalMaterial({
      color: 0x0f2744,
      metalness: 0.18,
      roughness: 0.1,
      clearcoat: 0.85,
      transparent: true,
      opacity: 0.72,
    });
    const stationLampMat = new THREE.MeshStandardMaterial({
      color: 0xfef3c7,
      emissive: 0xfde68a,
      emissiveIntensity: 1.5,
    });

    rackStops.forEach((rs, idx) => {
      const exp = EXPERIENCES[idx];
      const sideSign = rs.anchor[0] > 0 ? 1 : -1;
      const stGroup = new THREE.Group();
      stGroup.position.set(sideSign * 2.26, 2.15, rs.anchor[2]);

      const platformDeck = new THREE.Mesh(
        new THREE.BoxGeometry(2.65, 0.34, 5.4),
        concreteMat
      );
      platformDeck.position.set(0, 0.02, 0);

      const tactileStrip = new THREE.Mesh(
        new THREE.BoxGeometry(0.14, 0.012, 5.36),
        tactileYellowMat
      );
      tactileStrip.position.set(-sideSign * 1.18, 0.195, 0);

      [-1.7, 1.7].forEach((pz) => {
        const foundationPier = new THREE.Mesh(
          new THREE.CylinderGeometry(0.32, 0.42, 4.8, 10),
          concreteMat
        );
        foundationPier.position.set(0, -2.55, pz);
        stGroup.add(foundationPier);
      });

      const canopyRoof = new THREE.Mesh(
        new THREE.BoxGeometry(2.75, 0.09, 5.5),
        whiteHullMat
      );
      canopyRoof.position.set(0, 1.32, 0);
      canopyRoof.rotation.z = sideSign * 0.06;
      registerPickable(
        canopyRoof,
        `${exp.sectorCode} · ${exp.company.toUpperCase()}`,
        exp.role,
        exp.metricsBadge,
        rs.index
      );

      const solarRoof = new THREE.Mesh(
        new THREE.BoxGeometry(1.75, 0.03, 4.8),
        solarPanelMat
      );
      solarRoof.position.set(sideSign * 0.18, 1.39, 0);
      solarRoof.rotation.z = canopyRoof.rotation.z;

      [-1.95, 0, 1.95].forEach((cz) => {
        const col = new THREE.Mesh(
          new THREE.BoxGeometry(0.1, 1.15, 0.1),
          brushedAluminumMat
        );
        col.position.set(sideSign * 0.12, 0.74, cz);
        const colFoot = new THREE.Mesh(
          new THREE.BoxGeometry(0.22, 0.04, 0.22),
          darkStructuralMat
        );
        colFoot.position.set(sideSign * 0.12, 0.2, cz);
        stGroup.add(col, colFoot);
      });

      const signTex = textures.createStationSign(
        `STA 0${idx + 1}`,
        exp.company.toUpperCase().slice(0, 22),
        `0${idx + 1}`
      );
      const signBoard = new THREE.Mesh(
        new THREE.BoxGeometry(0.06, 0.34, 1.55),
        new THREE.MeshStandardMaterial({
          map: signTex,
          roughness: 0.35,
          metalness: 0.15,
        })
      );
      signBoard.position.set(-sideSign * 0.78, 1.06, 0);

      [-1.05, 1.05].forEach((bz) => {
        const benchSeat = new THREE.Mesh(
          new THREE.BoxGeometry(0.28, 0.04, 0.92),
          woodSleeperMat
        );
        benchSeat.position.set(sideSign * 0.18, 0.34, bz);
        const benchLegA = new THREE.Mesh(
          new THREE.BoxGeometry(0.24, 0.14, 0.05),
          darkStructuralMat
        );
        benchLegA.position.set(sideSign * 0.18, 0.26, bz - 0.36);
        const benchLegB = benchLegA.clone();
        benchLegB.position.z = bz + 0.36;
        stGroup.add(benchSeat, benchLegA, benchLegB);
      });

      [-2.35, 2.35].forEach((lz) => {
        const lampPost = new THREE.Mesh(
          new THREE.CylinderGeometry(0.024, 0.032, 1.02, 8),
          darkStructuralMat
        );
        lampPost.position.set(-sideSign * 0.92, 0.7, lz);
        const lampHead = new THREE.Mesh(
          new THREE.BoxGeometry(0.22, 0.035, 0.1),
          stationLampMat
        );
        lampHead.position.set(-sideSign * 0.86, 1.22, lz);
        stGroup.add(lampPost, lampHead);
      });

      const ticketBooth = new THREE.Mesh(
        new THREE.BoxGeometry(0.75, 0.82, 2.2),
        glassStationMat
      );
      ticketBooth.position.set(sideSign * 0.88, 0.6, 0);
      const boothFrame = new THREE.Mesh(
        new THREE.BoxGeometry(0.8, 0.08, 2.28),
        darkStructuralMat
      );
      boothFrame.position.set(sideSign * 0.88, 1.02, 0);

      const stairsDeck = new THREE.Mesh(
        new THREE.BoxGeometry(0.9, 0.12, 1.65),
        concreteMat
      );
      stairsDeck.position.set(sideSign * 0.95, -0.42, 3.25);
      stairsDeck.rotation.x = 0.55;

      const stairPier = new THREE.Mesh(
        new THREE.CylinderGeometry(0.14, 0.18, 3.2, 8),
        concreteMat
      );
      stairPier.position.set(sideSign * 0.95, -2.35, 3.9);

      const stairRail = new THREE.Mesh(
        new THREE.BoxGeometry(0.05, 0.05, 1.75),
        brushedAluminumMat
      );
      stairRail.position.set(sideSign * 1.36, -0.22, 3.25);
      stairRail.rotation.x = 0.55;

      stGroup.add(
        platformDeck,
        tactileStrip,
        canopyRoof,
        solarRoof,
        signBoard,
        ticketBooth,
        boothFrame,
        stairsDeck,
        stairPier,
        stairRail
      );
      rackCorridorGroup.add(stGroup);
    });

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

        const baseScale = (isBase ? 2.45 : isWisp ? 2.2 : 1.75) * (0.78 + hashSeed(seed + p * 17.9) * 0.65);
        puffRecords.push({
          x: cx + u * widthSpan,
          y: cy + py,
          z: cz + (hashSeed(seed + p * 19.3) - 0.5) * (widthSpan * 0.52),
          sx: baseScale * (isBase ? 1.45 : isWisp ? 1.55 : 1.15),
          sy: baseScale * (isBase ? 0.78 : isWisp ? 0.7 : 0.96),
          cell: isWisp ? (p % 2 === 0 ? 2 : 3) : p % 2,
          rot: (hashSeed(seed + p * 23.1) - 0.5) * 0.65,
          shade: isBase ? 0.28 + layerT * 0.4 : 0.65 + (py / Math.max(0.4, heightSpan)) * 0.35,
        });
      }
    };

    for (let i = 0; i < 14; i++) {
      const side = i % 2 === 0 ? 1 : -1;
      addVolumetricCloudBank(
        side * (12.5 + hashSeed(i * 3.1) * 16.0),
        10.2 + hashSeed(i * 7.3) * 5.2,
        6 - i * 8.4,
        5.8 + hashSeed(i * 11.7) * 4.5,
        2.4 + hashSeed(i * 13.9) * 1.6,
        100 + i * 31,
        11
      );
    }

    for (let i = 0; i < 28; i++) {
      const side = i % 2 === 0 ? 1 : -1;
      addVolumetricCloudBank(
        side * (1.8 + hashSeed(i * 5.7) * 9.5),
        1.8 + (i / 28) * 4.4 + (hashSeed(i * 9.3) - 0.5) * 0.9,
        -108 - i * 3.5,
        4.4 + hashSeed(i * 14.3) * 3.8,
        1.55 + hashSeed(i * 17.1) * 1.15,
        600 + i * 37,
        10
      );
    }

    for (let i = 0; i < 28; i++) {
      const side = i % 2 === 0 ? 1 : -1;
      puffRecords.push({
        x: side * (6.8 + hashSeed(i * 4.1 + 5) * 14.5),
        y: 2.0 + hashSeed(i * 8.3) * 2.6,
        z: -8 - i * 3.8,
        sx: 4.2 + hashSeed(i * 12.7) * 3.6,
        sy: 1.45 + hashSeed(i * 15.1) * 0.85,
        cell: i % 2 === 0 ? 2 : 3,
        rot: (hashSeed(i * 19.9) - 0.5) * 0.24,
        shade: 0.58,
      });
    }

    puffRecords.sort((a, b) => a.z - b.z);

    const cloudUniforms: Record<string, THREE.IUniform> = {
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

    const cloudInstancedMesh = new THREE.InstancedMesh(
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
      cloudInstancedMesh.setMatrixAt(idx, cloudDummy.matrix);
      cloudMetaArr[idx * 3] = p.cell;
      cloudMetaArr[idx * 3 + 1] = p.rot;
      cloudMetaArr[idx * 3 + 2] = p.shade;
    });
    cloudInstancedMesh.instanceMatrix.needsUpdate = true;
    cloudPlaneGeo.setAttribute('aCloudMeta', new THREE.InstancedBufferAttribute(cloudMetaArr, 3));
    scene.add(cloudInstancedMesh);

    const cityAboveGroup = new THREE.Group();
    cityAboveGroup.position.set(0, -6.5, -162);
    scene.add(cityAboveGroup);

    const cityGroundMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(168, 136),
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

    const CITY_BUILDING_COUNT = 380;
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
      new THREE.PlaneGeometry(176, 144),
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

    const ragStop = STOPS[findStopIndex('rag')];
    const ragGroup = new THREE.Group();
    ragGroup.position.set(ragStop.anchor[0] + 0.45, ragStop.anchor[1] + 0.85, ragStop.anchor[2]);
    scene.add(ragGroup);

    const balloonAssembly = new THREE.Group();
    ragGroup.add(balloonAssembly);

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
    const envelopeProfile = envelopeCurve.getPoints(30);
    const envelopeGeo = new THREE.LatheGeometry(envelopeProfile, 64);
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
        const scallop = 1 + 0.042 * Math.abs(Math.sin(theta * (goreCount * 0.5))) * bulgeEnvelope * crownFade;
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
    registerPickable(
      balloonEnvelope,
      'STRATOSPHERE HOT AIR BALLOON · FULL STACK',
      '4 Skill Clusters · Core Technologies',
      'React · Go · FastAPI · Postgres · WebGL',
      ragStop.index
    );

    const nomexCollarMat = new THREE.MeshStandardMaterial({
      color: 0xe5e0d4,
      normalMap: textures.fabricNormal,
      normalScale: new THREE.Vector2(0.25, 0.25),
      roughness: 0.85,
      side: THREE.DoubleSide,
    });
    const throatSkirt = new THREE.Mesh(
      new THREE.CylinderGeometry(0.34, 0.32, 0.2, 24, 1, true),
      nomexCollarMat
    );
    throatSkirt.position.y = -0.82;

    const loadRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.33, 0.015, 8, 28),
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
      balloonAssembly.add(mesh);
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

      const cableAnchorA = new THREE.Vector3(sx * 0.31, -0.86, sz * 0.08);
      const cableAnchorB = new THREE.Vector3(sx * 0.1, -0.86, sz * 0.31);
      addStrut(burnerCorner, cableAnchorA, 0.0045, brushedAluminumMat);
      addStrut(burnerCorner, cableAnchorB, 0.0045, brushedAluminumMat);
    });

    const burnerGroup = new THREE.Group();
    burnerGroup.position.set(0, -1.06, 0);
    const burnerFrame = new THREE.Mesh(
      new THREE.BoxGeometry(0.4, 0.025, 0.34),
      darkStructuralMat
    );
    burnerGroup.add(burnerFrame);

    [-0.075, 0.075].forEach((bx) => {
      const coil = new THREE.Mesh(
        new THREE.CylinderGeometry(0.056, 0.048, 0.12, 16),
        brushedAluminumMat
      );
      coil.position.set(bx, 0.06, 0);
      const manifold = new THREE.Mesh(
        new THREE.CylinderGeometry(0.012, 0.012, 0.09, 8),
        goldKaptonMat
      );
      manifold.position.set(bx, 0.01, 0);
      burnerGroup.add(coil, manifold);
    });

    const burnerFlameGeo = new THREE.ConeGeometry(0.095, 0.38, 16, 1, true);
    burnerFlameGeo.translate(0, 0.19, 0);
    const balloonFlameMesh = new THREE.Mesh(
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

    const burnerCoreMesh = new THREE.Mesh(
      new THREE.ConeGeometry(0.048, 0.18, 12, 1, true),
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

    const balloonBurnerLight = new THREE.PointLight(0xff7b1c, 2.4, 6.2, 1.8);
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
    const basketShell = new THREE.Mesh(
      new THREE.BoxGeometry(0.58, 0.38, 0.46),
      wickerMat
    );
    const basketInterior = new THREE.Mesh(
      new THREE.BoxGeometry(0.5, 0.08, 0.38),
      woodSleeperMat
    );
    basketInterior.position.y = 0.16;

    const rimW = 0.62;
    const rimD = 0.5;
    const bolsterThick = 0.068;
    const rimFB = new THREE.Mesh(
      new THREE.BoxGeometry(rimW, bolsterThick, bolsterThick),
      leatherTrimMat
    );
    rimFB.position.set(0, 0.2, 0.22);
    const rimBack = rimFB.clone();
    rimBack.position.z = -0.22;
    const rimSideL = new THREE.Mesh(
      new THREE.BoxGeometry(bolsterThick, bolsterThick, rimD),
      leatherTrimMat
    );
    rimSideL.position.set(-0.28, 0.2, 0);
    const rimSideR = rimSideL.clone();
    rimSideR.position.x = 0.28;

    [-0.16, 0.16].forEach((tz) => {
      const skid = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.028, 0.05), woodSleeperMat);
      skid.position.set(0, -0.205, tz);
      const fuelTank = new THREE.Mesh(
        new THREE.CylinderGeometry(0.055, 0.055, 0.26, 12),
        brushedAluminumMat
      );
      fuelTank.position.set(-0.18, 0.24, tz * 0.72);
      basketGroup.add(skid, fuelTank);
    });

    basketGroup.add(basketShell, basketInterior, rimFB, rimBack, rimSideL, rimSideR);
    balloonAssembly.add(balloonEnvelope, throatSkirt, loadRing, burnerGroup, basketGroup);

    const spacePlanetsRoot = new THREE.Group();
    spacePlanetsRoot.visible = false;
    scene.add(spacePlanetsRoot);

    const spacePlanetEntries: Array<{ pos: THREE.Vector3; radius: number }> = [];
    const spaceSunDir = new THREE.Vector3(36, 18, 24).normalize();
    const projectUpdaters: Array<(time: number) => void> = [];

    FEATURED_PROJECTS.forEach((proj) => {
      const stop = STOPS[findStopIndex(proj.id)];
      if (!stop) return;

      const nodeGroup = new THREE.Group();
      nodeGroup.position.set(...stop.anchor);

      if (proj.id === 'proj-vora-ai') {
        scene.add(nodeGroup);
        const relayStation = new THREE.Group();
        const coreBus = new THREE.Mesh(
          new THREE.CylinderGeometry(0.42, 0.48, 1.45, 16),
          whiteHullMat
        );
        coreBus.rotation.x = Math.PI / 2;
        const trussRing = new THREE.Mesh(
          new THREE.TorusGeometry(1.18, 0.04, 10, 48),
          brushedAluminumMat
        );
        trussRing.rotation.x = Math.PI / 2;
        const mastAntenna = new THREE.Mesh(
          new THREE.CylinderGeometry(0.03, 0.05, 1.3, 10),
          darkStructuralMat
        );
        const beaconCrown = new THREE.Mesh(
          new THREE.SphereGeometry(0.08, 12, 12),
          new THREE.MeshStandardMaterial({
            color: 0x38bdf8,
            emissive: 0x0284c7,
            emissiveIntensity: 1.5,
          })
        );
        beaconCrown.position.y = 0.7;

        [-1, 1].forEach((side) => {
          const wing = new THREE.Mesh(
            new THREE.BoxGeometry(2.15, 0.04, 0.78),
            solarPanelMat
          );
          wing.position.set(side * 1.52, 0.08, 0);
          wing.rotation.z = side * 0.08;
          relayStation.add(wing);
        });
        relayStation.add(coreBus, trussRing, mastAntenna, beaconCrown);
        registerPickable(
          coreBus,
          `${proj.planetName} · ${proj.title.toUpperCase()}`,
          proj.subtitle,
          proj.metric,
          stop.index
        );
        nodeGroup.add(relayStation);

        projectUpdaters.push((time) => {
          nodeGroup.visible = Math.abs(engineState.t - stop.index) <= 2.6;
          if (!nodeGroup.visible) return;
          const open = stopOpenProgress(stop.index);
          relayStation.rotation.y = time * 0.16;
          nodeGroup.scale.setScalar(0.84 + 0.16 * open);
        });
      } else if (proj.id === 'proj-tiss') {
        scene.add(nodeGroup);
        const mesosphereArray = new THREE.Group();
        const centralHub = new THREE.Mesh(
          new THREE.CylinderGeometry(0.36, 0.44, 1.8, 12),
          darkStructuralMat
        );
        centralHub.rotation.z = Math.PI / 2;
        const aeroWingL = new THREE.Mesh(new THREE.BoxGeometry(1.85, 0.04, 0.9), whiteHullMat);
        aeroWingL.position.set(-1.35, 0, 0);
        const aeroWingR = aeroWingL.clone();
        aeroWingR.position.x = 1.35;
        const commsLoop = new THREE.Mesh(
          new THREE.TorusGeometry(1.35, 0.03, 10, 48),
          brushedAluminumMat
        );
        commsLoop.rotation.y = Math.PI / 3;
        const relaySatA = createSatelliteAssembly(0.38, false);
        relaySatA.position.set(0, 1.15, 0.85);
        const relaySatB = createSatelliteAssembly(0.38, true);
        relaySatB.position.set(0, -1.15, -0.85);
        mesosphereArray.add(centralHub, aeroWingL, aeroWingR, commsLoop, relaySatA, relaySatB);
        registerPickable(
          centralHub,
          `${proj.planetName} · ${proj.title.toUpperCase()}`,
          proj.subtitle,
          proj.metric,
          stop.index
        );
        nodeGroup.add(mesosphereArray);

        projectUpdaters.push((time) => {
          nodeGroup.visible = Math.abs(engineState.t - stop.index) <= 2.6;
          if (!nodeGroup.visible) return;
          const open = stopOpenProgress(stop.index);
          mesosphereArray.rotation.y = -time * 0.18;
          commsLoop.rotation.z = time * 0.24;
          nodeGroup.scale.setScalar(0.84 + 0.16 * open);
        });
      } else if (proj.id === 'proj-neo-era-cuan') {
        spacePlanetsRoot.add(nodeGroup);
        const MOON_RADIUS = 2.05;
        const moonMesh = new THREE.Mesh(
          new THREE.SphereGeometry(MOON_RADIUS, 56, 40),
          new THREE.MeshStandardMaterial({
            map: textures.moon,
            roughness: 0.94,
            metalness: 0.02,
          })
        );
        registerPickable(
          moonMesh,
          `${proj.planetName} · ${proj.title.toUpperCase()}`,
          proj.subtitle,
          proj.metric,
          stop.index
        );
        spacePlanetEntries.push({
          pos: new THREE.Vector3(...stop.anchor),
          radius: MOON_RADIUS,
        });

        const JUPITER_RADIUS = 2.45;
        const jupiterMesh = new THREE.Mesh(
          new THREE.SphereGeometry(JUPITER_RADIUS, 56, 40),
          new THREE.MeshStandardMaterial({
            map: textures.jupiter,
            roughness: 0.76,
            metalness: 0.02,
          })
        );
        jupiterMesh.position.set(9.4, 1.5, -12.5);
        const jupiterAtmo = createPlanetAtmosphereMesh(JUPITER_RADIUS * 1.045, 0xd99b52, 0.42);
        jupiterAtmo.position.copy(jupiterMesh.position);
        spacePlanetEntries.push({
          pos: new THREE.Vector3(
            stop.anchor[0] + 9.4,
            stop.anchor[1] + 1.5,
            stop.anchor[2] - 12.5
          ),
          radius: JUPITER_RADIUS,
        });

        const observatoryGroup = new THREE.Group();
        const lunarProbe = createSatelliteAssembly(0.42, true);
        lunarProbe.position.set(MOON_RADIUS * 1.65, 0.55, 0.5);
        observatoryGroup.add(lunarProbe);
        nodeGroup.add(moonMesh, jupiterMesh, jupiterAtmo, observatoryGroup);

        projectUpdaters.push((time) => {
          nodeGroup.visible = Math.abs(engineState.t - stop.index) <= 2.3;
          if (!nodeGroup.visible) return;
          const open = stopOpenProgress(stop.index);
          moonMesh.rotation.y = time * 0.07;
          jupiterMesh.rotation.y = time * 0.09;
          observatoryGroup.rotation.y = time * 0.24;
          nodeGroup.scale.setScalar(0.84 + 0.16 * open);
        });
      } else {
        spacePlanetsRoot.add(nodeGroup);
        const SATURN_RADIUS = 2.05;
        const saturnGroup = new THREE.Group();
        saturnGroup.rotation.z = THREE.MathUtils.degToRad(26.7);
        const saturnSphere = new THREE.Mesh(
          new THREE.SphereGeometry(SATURN_RADIUS, 56, 40),
          new THREE.MeshStandardMaterial({
            map: textures.saturn,
            roughness: 0.78,
            metalness: 0.03,
          })
        );
        registerPickable(
          saturnSphere,
          `${proj.planetName} · ${proj.title.toUpperCase()}`,
          proj.subtitle,
          proj.metric,
          stop.index
        );
        spacePlanetEntries.push({
          pos: new THREE.Vector3(...stop.anchor),
          radius: SATURN_RADIUS,
        });
        const saturnAtmo = createPlanetAtmosphereMesh(SATURN_RADIUS * 1.045, 0xe8c488, 0.44);
        const saturnRingGeo = createPlanetaryRingGeometry(
          SATURN_RADIUS * 1.28,
          SATURN_RADIUS * 2.34,
          96
        );
        const saturnRings = new THREE.Mesh(
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
        saturnGroup.add(saturnSphere, saturnAtmo, saturnRings);
        nodeGroup.add(saturnGroup);

        projectUpdaters.push((time) => {
          nodeGroup.visible = Math.abs(engineState.t - stop.index) <= 2.3;
          if (!nodeGroup.visible) return;
          const open = stopOpenProgress(stop.index);
          saturnSphere.rotation.y = time * 0.12;
          saturnRings.rotation.y = time * 0.03;
          nodeGroup.scale.setScalar(0.84 + 0.16 * open);
        });
      }
    });

    const archiveStop = STOPS[findStopIndex('archive')];
    const archiveGroup = new THREE.Group();
    archiveGroup.position.set(...archiveStop.anchor);
    spacePlanetsRoot.add(archiveGroup);

    const MARS_RADIUS = 2.1;
    const marsPlanet = new THREE.Mesh(
      new THREE.SphereGeometry(MARS_RADIUS, 56, 40),
      new THREE.MeshStandardMaterial({
        map: textures.mars,
        roughness: 0.89,
        metalness: 0.02,
      })
    );
    const marsAtmo = createPlanetAtmosphereMesh(MARS_RADIUS * 1.045, 0xd97742, 0.42);
    archiveGroup.add(marsPlanet, marsAtmo);
    spacePlanetEntries.push({
      pos: new THREE.Vector3(...archiveStop.anchor),
      radius: MARS_RADIUS,
    });

    const archiveModules: THREE.Group[] = [];
    ARCHIVE_PROJECTS.forEach((ap, idx) => {
      const orbitPivot = new THREE.Group();
      orbitPivot.rotation.z = (idx % 2 === 0 ? 1 : -1) * 0.22;
      const angle = (idx / ARCHIVE_PROJECTS.length) * Math.PI * 2;
      const rad = MARS_RADIUS * 1.68;

      const cubeSat = createSatelliteAssembly(0.36, idx % 2 === 0);
      cubeSat.position.set(Math.cos(angle) * rad, (idx - 1.5) * 0.32, Math.sin(angle) * rad);
      cubeSat.lookAt(0, 0, 0);
      registerPickable(
        cubeSat.children[0],
        `${ap.planetName} · ${ap.title.toUpperCase()}`,
        ap.subtitle,
        ap.metric,
        archiveStop.index
      );
      orbitPivot.add(cubeSat);
      archiveModules.push(orbitPivot);
      archiveGroup.add(orbitPivot);
    });

    const deliveredStop = STOPS[findStopIndex('delivered')];
    const deliveredGroup = new THREE.Group();
    deliveredGroup.position.set(...deliveredStop.anchor);
    spacePlanetsRoot.add(deliveredGroup);

    const EARTH_RADIUS = 2.45;
    const earthAnchorOffset = new THREE.Vector3(1.1, 0.2, -2.0);
    const earthTiltPivot = new THREE.Group();
    earthTiltPivot.position.copy(earthAnchorOffset);
    earthTiltPivot.rotation.z = THREE.MathUtils.degToRad(23.4);

    const earthUniforms: Record<string, THREE.IUniform> = {
      uDayMap: { value: textures.earthDay },
      uNightMap: { value: textures.earthNight },
      uNormalMap: { value: textures.earthNormal },
      uSpecularMap: { value: textures.earthSpecular },
      uSunDir: { value: spaceSunDir },
    };

    const earthSurfaceMesh = new THREE.Mesh(
      new THREE.SphereGeometry(EARTH_RADIUS, 56, 40),
      new THREE.ShaderMaterial({
        uniforms: earthUniforms,
        vertexShader: EARTH_DAY_NIGHT_VERTEX,
        fragmentShader: EARTH_DAY_NIGHT_FRAGMENT,
      })
    );
    registerPickable(
      earthSurfaceMesh,
      'PLANET EARTH · HOMEWORLD SANCTUARY',
      'Rocket Docked · Ready for Direct Contact',
      'akromfadhil234@gmail.com',
      deliveredStop.index
    );
    spacePlanetEntries.push({
      pos: new THREE.Vector3(...deliveredStop.anchor).add(earthAnchorOffset),
      radius: EARTH_RADIUS,
    });

    const earthCloudsMesh = new THREE.Mesh(
      new THREE.SphereGeometry(EARTH_RADIUS * 1.016, 48, 36),
      new THREE.MeshStandardMaterial({
        color: 0xffffff,
        map: textures.earthClouds,
        alphaMap: textures.earthClouds,
        transparent: true,
        opacity: 0.82,
        depthWrite: false,
        roughness: 0.9,
      })
    );

    const earthAtmoShell = createPlanetAtmosphereMesh(EARTH_RADIUS * 1.055, 0x60a5fa, 0.68);
    earthTiltPivot.add(earthSurfaceMesh, earthCloudsMesh, earthAtmoShell);

    const VENUS_RADIUS = 1.65;
    const venusMesh = new THREE.Mesh(
      new THREE.SphereGeometry(VENUS_RADIUS, 48, 36),
      new THREE.MeshStandardMaterial({
        map: textures.venus,
        roughness: 0.8,
        metalness: 0.02,
      })
    );
    venusMesh.position.set(-8.8, 2.2, -16.5);
    const venusAtmo = createPlanetAtmosphereMesh(VENUS_RADIUS * 1.045, 0xfbbf24, 0.4);
    venusAtmo.position.copy(venusMesh.position);

    const dockingAdapterGroup = new THREE.Group();
    dockingAdapterGroup.position.set(-0.9, 0, 1.4);
    const outerDockRing = new THREE.Mesh(
      new THREE.TorusGeometry(1.05, 0.07, 16, 64),
      brushedAluminumMat
    );
    const innerDockRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.75, 0.038, 12, 48),
      goldKaptonMat
    );
    innerDockRing.position.z = 0.09;
    dockingAdapterGroup.add(outerDockRing, innerDockRing);

    deliveredGroup.add(earthTiltPivot, venusMesh, venusAtmo, dockingAdapterGroup);

    const raycaster = new THREE.Raycaster();
    raycaster.layers.set(1);
    const pointerNdc = new THREE.Vector2();
    const projectedVec = new THREE.Vector3();
    const camSplineTarget = new THREE.Vector3();
    const lookSplineTarget = new THREE.Vector3();
    const rocketPos = new THREE.Vector3();
    const rocketAheadPos = new THREE.Vector3();
    const rocketFarAheadPos = new THREE.Vector3();
    const rocketTangent = new THREE.Vector3();
    const rocketNextTangent = new THREE.Vector3();
    const pointerParallax = { x: 0, y: 0 };
    const zoneColorA = new THREE.Color();
    const zoneColorB = new THREE.Color();

    let lastOrbitStop = -1;
    let frameCount = 0;
    let fpsAccum = 0;

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

      const spaceFactor = THREE.MathUtils.smoothstep(t, 8.0, 8.9);
      hemiLight.intensity = THREE.MathUtils.lerp(0.58, 0.12, spaceFactor);
      rimLight.intensity = THREE.MathUtils.lerp(0.34, 0.08, spaceFactor);
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
      starUniforms.uOpacity.value = spaceFactor;
      milkyWayUniforms.uOpacity.value = spaceFactor;
      skyDome.visible = spaceFactor < 0.99;

      (cloudUniforms.uFogColor.value as THREE.Color).copy(fogColor);
      cloudUniforms.uGlobalOpacity.value = 1 - THREE.MathUtils.smoothstep(t, 7.8, 9.3);
      const duskWarm = THREE.MathUtils.smoothstep(t, 5.5, 8.2);
      (cloudUniforms.uSunColor.value as THREE.Color)
        .copy(zoneColorA.setHex(0xfbf6ed))
        .lerp(zoneColorB.setHex(0xc8dcf0), duskWarm);
      (cloudUniforms.uShadowColor.value as THREE.Color)
        .copy(zoneColorA.setHex(0x637991))
        .lerp(zoneColorB.setHex(0x283c5c), duskWarm);
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
      composer.setSize(w, h);
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

      updateSpectrumBands();
      updateAtmosphereColors(engineState.t);
      updateAmbientAudio(engineState.t, engineState.velocity, engineState.pulse);

      const normT = Math.min(1, Math.max(0, engineState.t / (STOPS.length - 1)));
      const aheadT = Math.min(1, normT + 0.008);
      const farAheadT = Math.min(1, normT + 0.024);

      packetSpline.getPoint(normT, rocketPos);
      if (normT >= 0.992) {
        packetSpline.getPoint(Math.max(0, normT - 0.008), rocketAheadPos);
        rocketTangent.subVectors(rocketPos, rocketAheadPos).normalize();
        rocketNextTangent.copy(rocketTangent);
      } else {
        packetSpline.getPoint(aheadT, rocketAheadPos);
        packetSpline.getPoint(farAheadT, rocketFarAheadPos);
        rocketTangent.subVectors(rocketAheadPos, rocketPos).normalize();
        rocketNextTangent.subVectors(rocketFarAheadPos, rocketAheadPos).normalize();
      }

      let minPlanetDist = 999;
      if (engineState.t >= 7.8) {
        for (let i = 0; i < spacePlanetEntries.length; i++) {
          const entry = spacePlanetEntries[i];
          const surfaceDist = rocketPos.distanceTo(entry.pos) - entry.radius;
          if (surfaceDist < minPlanetDist) {
            minPlanetDist = surfaceDist;
          }
        }
      }

      const morphEase = starship.update(
        dt,
        elapsed,
        engineState.t,
        rocketPos,
        rocketTangent,
        rocketNextTangent,
        engineState.velocity,
        engineState.pulse,
        engineState.pointer.x,
        engineState.pointer.y,
        responsiveRocketScale,
        minPlanetDist
      );

      starUniforms.uTime.value = elapsed;
      starUniforms.uBoost.value = Math.min(1, engineState.pulse + Math.abs(engineState.velocity) * 0.18);
      starUniforms.uSize.value = renderer.getPixelRatio() * 1.55;

      if (engineState.cameraMode === 'orbit') {
        if (!orbitControls.enabled) {
          orbitControls.enabled = true;
          applyCameraFrustum(window.innerWidth, window.innerHeight);
        }
        if (lastOrbitStop !== engineState.activeStop) {
          lastOrbitStop = engineState.activeStop;
          const activeAnchor = STOPS[engineState.activeStop]?.packet ?? [0, 0, 0];
          orbitControls.target.set(activeAnchor[0], activeAnchor[1], activeAnchor[2]);
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

        const morphPull = Math.sin(morphEase * Math.PI) * 1.35;
        camSplineTarget.z += morphPull;
        camSplineTarget.y -= morphPull * 0.22;

        if (!engineState.reduced) {
          const dampFactor = 1 - Math.exp(-dt * 3.8);
          pointerParallax.x += (engineState.pointer.x * 0.34 - pointerParallax.x) * dampFactor;
          pointerParallax.y += (engineState.pointer.y * 0.2 - pointerParallax.y) * dampFactor;
        }

        if (isMobileViewport) {
          camera.position.set(
            camSplineTarget.x * 0.65 + pointerParallax.x * 0.35,
            camSplineTarget.y + 0.55 + pointerParallax.y * 0.35,
            camSplineTarget.z + 2.2
          );
          lookSplineTarget.x *= 0.4;
          lookSplineTarget.y -= 0.85;
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

      earthLandscapeGroup.visible = engineState.lo <= 6;
      highwayGroup.visible = engineState.lo <= 2;
      scenicGantryGroup.visible = engineState.lo <= 1;
      proxyGroup.visible = engineState.lo <= 2 && engineState.hi >= 1;

      const firstRackIdx = rackStops[0].index;
      const lastRackIdx = rackStops[rackStops.length - 1].index;
      rackCorridorGroup.visible = engineState.hi >= firstRackIdx - 1 && engineState.lo <= lastRackIdx + 1;

      cloudUniforms.uTime.value = elapsed;
      cloudInstancedMesh.visible = (cloudUniforms.uGlobalOpacity.value as number) > 0.01;

      cityAboveGroup.visible = engineState.hi >= 5 && engineState.lo <= 9 && (milkyWayUniforms.uOpacity.value as number) < 0.9;
      spacePlanetsRoot.visible = engineState.t >= 8.22 || morphEase > 0.03;

      ragGroup.visible = engineState.hi >= ragStop.index && engineState.lo <= ragStop.index;
      if (ragGroup.visible) {
        balloonAssembly.position.y = Math.sin(elapsed * 0.75) * 0.14;
        balloonAssembly.rotation.y = elapsed * 0.08;
        balloonAssembly.rotation.z = Math.sin(elapsed * 0.42) * 0.032;
        balloonAssembly.rotation.x = Math.cos(elapsed * 0.35) * 0.025;
        const burnerPulse = 0.65 + 0.35 * Math.sin(elapsed * 3.4) * Math.sin(elapsed * 19.0 + 0.8);
        balloonFlameMesh.scale.set(0.85 + burnerPulse * 0.25, 0.72 + burnerPulse * 0.52, 0.85 + burnerPulse * 0.25);
        burnerCoreMesh.scale.set(1, 0.8 + burnerPulse * 0.45, 1);
        balloonBurnerLight.intensity = 1.8 + burnerPulse * 1.6;
      } else {
        balloonBurnerLight.intensity = 0;
      }

      projectUpdaters.forEach((fn) => fn(elapsed));

      archiveGroup.visible =
        engineState.hi >= archiveStop.index && engineState.lo <= archiveStop.index;
      if (archiveGroup.visible) {
        marsPlanet.rotation.y = elapsed * 0.1;
        archiveModules.forEach((mod, idx) => {
          mod.rotation.y = elapsed * (0.2 + idx * 0.04);
        });
      }

      deliveredGroup.visible =
        engineState.hi >= deliveredStop.index && engineState.lo <= deliveredStop.index;
      if (deliveredGroup.visible) {
        earthSurfaceMesh.rotation.y = elapsed * 0.06;
        earthCloudsMesh.rotation.y = elapsed * 0.095;
        venusMesh.rotation.y = -elapsed * 0.04;
        dockingAdapterGroup.rotation.z = elapsed * 0.22;
      }

      if (engineState.pointer.active && frameCount % 3 === 0) {
        pointerNdc.set(engineState.pointer.x, engineState.pointer.y);
        raycaster.setFromCamera(pointerNdc, camera);
        const hits = raycaster.intersectObjects(pickables, false);
        if (hits.length > 0 && hits[0].distance < 48) {
          const hitObj = hits[0].object;
          hitObj.getWorldPosition(projectedVec);
          projectedVec.project(camera);
          const sx = ((projectedVec.x + 1) / 2) * window.innerWidth;
          const sy = ((-projectedVec.y + 1) / 2) * window.innerHeight;
          engineState.hovered = {
            name: String(hitObj.userData.nodeName ?? 'NODE'),
            category: String(hitObj.userData.nodeCategory ?? ''),
            metric: String(hitObj.userData.nodeMetric ?? ''),
            screenX: sx,
            screenY: sy,
            stopIndex: Number(hitObj.userData.stopIndex ?? 0),
          };
        } else {
          engineState.hovered = null;
        }
      }

      postPass.uniforms.uTime.value = elapsed;
      postPass.uniforms.uPulse.value = engineState.pulse;
      postPass.uniforms.uAberration.value =
        0.00014 + Math.min(0.0012, Math.abs(engineState.velocity) * 0.0008);
      bloomPass.strength = (engineState.quality === 'epic' ? 0.08 : 0.05) + engineState.pulse * 0.12;

      composer.render(dt);

      frameCount++;
      fpsAccum += dt;
      if (frameCount === 1 || frameCount >= 20) {
        if (frameCount >= 20) {
          engineState.stats.fps = Math.min(120, Math.round(frameCount / Math.max(0.001, fpsAccum)));
          frameCount = 0;
          fpsAccum = 0;
        }
        engineState.stats.drawCalls = renderer.info.render.calls;
        engineState.stats.triangles = renderer.info.render.triangles;
        engineState.stats.camZ = Math.round(camera.position.z * 10) / 10;
        notifyEngineUi();
      }
    };

    renderer.setAnimationLoop(animate);

    return () => {
      renderer.setAnimationLoop(null);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('pointerdown', onPointerDown);
      orbitControls.dispose();
      starship.dispose();
      timer.dispose();
      composer.dispose();
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
