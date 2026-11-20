import * as THREE from 'three';

export type Vec3Tuple = [number, number, number];

export const CAR_WAYPOINTS: Vec3Tuple[] = [
  [-0.8, 0.0, 4.0],
  [2.6, 0.0, -4.5],
  [4.6, 0.0, -14.0],
  [0.4, 0.0, -22.5],
  [-3.8, 0.0, -31.0],
  [-2.6, 0.0, -40.5],
  [-2.2, 0.0, -48.5],
];

export const CAR_ROAD_WAYPOINTS: Vec3Tuple[] = [
  [-2.4, 0.0, 18.0],
  [-1.6, 0.0, 11.0],
  ...CAR_WAYPOINTS,
  [-2.2, 0.0, -52.0],
];

export const TRAIN_WAYPOINTS: Vec3Tuple[] = [
  [1.8, 0.14, -52.8],
  [2.1, 0.14, -57.2],
  [3.6, 0.48, -64.0],
  [5.2, 1.25, -72.0],
  [2.4, 1.72, -80.5],
  [-1.2, 1.85, -88.0],
  [-4.6, 1.8, -96.0],
  [-6.2, 1.65, -104.0],
  [-4.4, 1.12, -113.5],
  [-1.4, 0.42, -122.0],
  [-0.6, 0.24, -128.0],
];

export const TRAIN_TRACK_WAYPOINTS: Vec3Tuple[] = [
  [1.72, 0.14, -49.0],
  ...TRAIN_WAYPOINTS,
  [-0.6, 0.24, -132.2],
];

export const AIRCRAFT_WAYPOINTS: Vec3Tuple[] = [
  [2.8, 0.22, -135.0],
  [2.8, 0.22, -148.5],
  [2.8, 0.36, -158.0],
  [2.3, 3.8, -169.5],
  [-3.8, 9.6, -184.0],
  [1.2, 12.5, -196.0],
  [5.2, 13.8, -206.0],
  [2.0, 11.2, -220.0],
  [-2.8, 7.6, -230.0],
  [-2.8, 6.06, -239.0],
  [-2.8, 6.02, -252.0],
];

export const ROCKET_WAYPOINTS: Vec3Tuple[] = [
  [3.6, 7.95, -261.0],
  [3.6, 13.6, -261.04],
  [3.4, 19.6, -264.2],
  [2.2, 23.4, -273.0],
  [0.5, 25.4, -284.0],
  [-1.2, 27.5, -299.0],
  [-2.2, 29.2, -314.0],
  [0.2, 31.1, -330.0],
  [1.8, 32.8, -346.0],
  [0.6, 34.7, -362.0],
  [-0.6, 36.2, -378.0],
];

export const HUB_ANCHORS = {
  grandStation: [0.4, 0.0, -53.8] as Vec3Tuple,
  carDropOff: [-2.2, 0.0, -48.5] as Vec3Tuple,
  midStationCanyon: [-1.2, 1.85, -88.0] as Vec3Tuple,
  midStationValley: [-6.2, 1.65, -104.0] as Vec3Tuple,
  airportRailStop: [-0.6, 0.24, -128.0] as Vec3Tuple,
  airportTerminal: [-5.6, 0.2, -139.0] as Vec3Tuple,
  atcTower: [-8.6, 0.2, -147.0] as Vec3Tuple,
  runwayCenter: [2.8, 0.21, -147.5] as Vec3Tuple,
  balloonAnchor: [-1.8, 6.4, -174.5] as Vec3Tuple,
  voraRelayAnchor: [-0.2, 13.8, -210.5] as Vec3Tuple,
  spaceportPlateauY: 6.0,
  spaceportRunwayCenter: [-2.8, 6.01, -244.0] as Vec3Tuple,
  spaceportApronPark: [-2.8, 6.02, -252.0] as Vec3Tuple,
  launchpadCenter: [3.6, 6.0, -261.0] as Vec3Tuple,
  recedingEarth: [10.5, 8.5, -256.0] as Vec3Tuple,
  moonAnchor: [-3.8, 24.8, -282.0] as Vec3Tuple,
  marsAnchor: [3.4, 28.9, -315.5] as Vec3Tuple,
  jupiterAnchor: [-9.6, 30.8, -327.0] as Vec3Tuple,
  saturnAnchor: [-3.8, 32.8, -349.0] as Vec3Tuple,
  observatoryAnchor: [1.5, 36.2, -382.5] as Vec3Tuple,
  exoplanetAnchor: [5.8, 36.8, -390.5] as Vec3Tuple,
};

export interface JourneyCurves {
  carDriveCurve: THREE.CatmullRomCurve3;
  carRoadCurve: THREE.CatmullRomCurve3;
  trainDriveCurve: THREE.CatmullRomCurve3;
  trainTrackCurve: THREE.CatmullRomCurve3;
  aircraftCurve: THREE.CatmullRomCurve3;
  rocketCurve: THREE.CatmullRomCurve3;
}

export function createJourneyCurves(): JourneyCurves {
  return {
    carDriveCurve: new THREE.CatmullRomCurve3(
      CAR_WAYPOINTS.map((p) => new THREE.Vector3(...p)),
      false,
      'catmullrom',
      0.35
    ),
    carRoadCurve: new THREE.CatmullRomCurve3(
      CAR_ROAD_WAYPOINTS.map((p) => new THREE.Vector3(...p)),
      false,
      'catmullrom',
      0.35
    ),
    trainDriveCurve: new THREE.CatmullRomCurve3(
      TRAIN_WAYPOINTS.map((p) => new THREE.Vector3(...p)),
      false,
      'catmullrom',
      0.32
    ),
    trainTrackCurve: new THREE.CatmullRomCurve3(
      TRAIN_TRACK_WAYPOINTS.map((p) => new THREE.Vector3(...p)),
      false,
      'catmullrom',
      0.32
    ),
    aircraftCurve: new THREE.CatmullRomCurve3(
      AIRCRAFT_WAYPOINTS.map((p) => new THREE.Vector3(...p)),
      false,
      'catmullrom',
      0.36
    ),
    rocketCurve: new THREE.CatmullRomCurve3(
      ROCKET_WAYPOINTS.map((p) => new THREE.Vector3(...p)),
      false,
      'catmullrom',
      0.28
    ),
  };
}

const CORRIDOR_Z_SAMPLES: Array<[number, number]> = [
  [20, -2.4],
  [11, -1.6],
  [4, -0.8],
  [-4.5, 2.6],
  [-14, 4.6],
  [-22.5, 0.4],
  [-31, -3.8],
  [-40.5, -2.6],
  [-48.5, -0.6],
  [-56, 1.4],
  [-64, 3.6],
  [-72, 5.2],
  [-80.5, 2.4],
  [-88, -1.2],
  [-96, -4.6],
  [-104, -6.2],
  [-113.5, -4.4],
  [-122, -1.4],
  [-130, 0.2],
  [-150, 0.0],
  [-175, 0.0],
];

export function sampleRouteCenterX(z: number): number {
  if (z >= CORRIDOR_Z_SAMPLES[0][0]) return CORRIDOR_Z_SAMPLES[0][1];
  const last = CORRIDOR_Z_SAMPLES[CORRIDOR_Z_SAMPLES.length - 1];
  if (z <= last[0]) return last[1];
  for (let i = 0; i < CORRIDOR_Z_SAMPLES.length - 1; i++) {
    const [z0, x0] = CORRIDOR_Z_SAMPLES[i];
    const [z1, x1] = CORRIDOR_Z_SAMPLES[i + 1];
    if (z <= z0 && z >= z1) {
      const f = (z0 - z) / Math.max(0.001, z0 - z1);
      const s = f * f * (3 - 2 * f);
      return x0 + (x1 - x0) * s;
    }
  }
  return 0;
}

export function buildCurvedRibbonGeometry(
  curve: THREE.CatmullRomCurve3,
  segments: number,
  halfWidth: number,
  thickness: number,
  yOffset: number,
  lateralOffset = 0,
  uvRepeatV = 1,
  uEnd = 1
): THREE.BufferGeometry {
  const worldUp = new THREE.Vector3(0, 1, 0);
  const pt = new THREE.Vector3();
  const tan = new THREE.Vector3();
  const right = new THREE.Vector3();

  const leftTop: THREE.Vector3[] = [];
  const rightTop: THREE.Vector3[] = [];
  const leftBot: THREE.Vector3[] = [];
  const rightBot: THREE.Vector3[] = [];
  const vCoords: number[] = [];

  for (let i = 0; i <= segments; i++) {
    const u = (i / segments) * uEnd;
    curve.getPointAt(u, pt);
    curve.getTangentAt(u, tan);
    tan.y = 0;
    if (tan.length() < 0.0001) {
      tan.set(0, 0, -1);
    } else {
      tan.normalize();
    }
    right.crossVectors(tan, worldUp).normalize();

    const lTop = pt
      .clone()
      .addScaledVector(right, lateralOffset - halfWidth);
    lTop.y += yOffset;

    const rTop = pt
      .clone()
      .addScaledVector(right, lateralOffset + halfWidth);
    rTop.y += yOffset;

    const lBot = lTop.clone();
    lBot.y -= thickness;
    const rBot = rTop.clone();
    rBot.y -= thickness;

    leftTop.push(lTop);
    rightTop.push(rTop);
    leftBot.push(lBot);
    rightBot.push(rBot);
    vCoords.push(u * uvRepeatV);
  }

  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  const pushQuad = (
    a: THREE.Vector3,
    b: THREE.Vector3,
    c: THREE.Vector3,
    d: THREE.Vector3,
    uvA: [number, number],
    uvB: [number, number],
    uvC: [number, number],
    uvD: [number, number]
  ) => {
    const base = positions.length / 3;
    positions.push(a.x, a.y, a.z, b.x, b.y, b.z, c.x, c.y, c.z, d.x, d.y, d.z);
    uvs.push(uvA[0], uvA[1], uvB[0], uvB[1], uvC[0], uvC[1], uvD[0], uvD[1]);
    indices.push(base, base + 1, base + 2, base, base + 2, base + 3);
  };

  for (let i = 0; i < segments; i++) {
    const v0 = vCoords[i];
    const v1 = vCoords[i + 1];

    pushQuad(
      leftTop[i],
      rightTop[i],
      rightTop[i + 1],
      leftTop[i + 1],
      [0, v0],
      [1, v0],
      [1, v1],
      [0, v1]
    );

    if (thickness > 0.001) {
      pushQuad(
        rightBot[i],
        rightBot[i + 1],
        rightTop[i + 1],
        rightTop[i],
        [0, v0],
        [0, v1],
        [1, v1],
        [1, v0]
      );

      pushQuad(
        leftTop[i],
        leftTop[i + 1],
        leftBot[i + 1],
        leftBot[i],
        [1, v0],
        [1, v1],
        [0, v1],
        [0, v0]
      );
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}

export function freezeStaticTree(root: THREE.Object3D): void {
  root.traverse((obj) => {
    if (obj === root) return;
    obj.updateMatrix();
    obj.matrixAutoUpdate = false;
  });
}
