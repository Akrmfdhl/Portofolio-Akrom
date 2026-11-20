import * as THREE from 'three';
import { EXPERIENCES, STOPS } from '../../data/portfolioJourney';
import { hashSeed, sampleMountainElevation } from './proceduralTextures';
import type { TextureBundle } from './textureLibrary';
import {
  HUB_ANCHORS,
  buildCurvedRibbonGeometry,
  freezeStaticTree,
} from './routeMath';

export interface HubMaterialPalette {
  concreteMat: THREE.MeshStandardMaterial;
  asphaltMat: THREE.MeshStandardMaterial;
  ballastMat: THREE.MeshStandardMaterial;
  brushedAluminumMat: THREE.MeshPhysicalMaterial;
  railSteelMat: THREE.MeshPhysicalMaterial;
  whiteHullMat: THREE.MeshPhysicalMaterial;
  darkStructuralMat: THREE.MeshStandardMaterial;
  woodSleeperMat: THREE.MeshStandardMaterial;
  solarPanelMat: THREE.MeshPhysicalMaterial;
  goldKaptonMat: THREE.MeshStandardMaterial;
  glassArchMat: THREE.MeshPhysicalMaterial;
  tactileYellowMat: THREE.MeshStandardMaterial;
  warmGlowMat: THREE.MeshStandardMaterial;
  cyanGlowMat: THREE.MeshStandardMaterial;
  redBeaconMat: THREE.MeshStandardMaterial;
  greenBeaconMat: THREE.MeshStandardMaterial;
  textures: TextureBundle;
  registerPickable: (obj: THREE.Object3D, hoverKey: string, stopIndex: number) => void;
  createPlanetAtmosphereMesh: (radius: number, colorHex: number, intensity?: number) => THREE.Mesh;
  createPlanetaryRingGeometry: (
    innerRadius: number,
    outerRadius: number,
    segments?: number
  ) => THREE.BufferGeometry;
}

export interface AirportHubResult {
  group: THREE.Group;
  radarPivot: THREE.Group;
  runwayBeaconMat: THREE.MeshStandardMaterial;
}

export interface SpaceportHubResult {
  group: THREE.Group;
  swingArms: THREE.Group[];
  cryoPlumes: THREE.Mesh[];
  padBeaconMat: THREE.MeshStandardMaterial;
}

export interface ObservatoryHubResult {
  group: THREE.Group;
  exoplanetMesh: THREE.Mesh;
  exoplanetRing: THREE.Mesh;
  centrifugePivot: THREE.Group;
  dockingRingGroup: THREE.Group;
}

export function buildCurvedHighway(
  carRoadCurve: THREE.CatmullRomCurve3,
  mats: HubMaterialPalette
): THREE.Group {
  const group = new THREE.Group();

  const roadDeckGeo = buildCurvedRibbonGeometry(carRoadCurve, 92, 1.38, 0.14, 0.0, 0, 1);
  const roadDeck = new THREE.Mesh(roadDeckGeo, mats.asphaltMat);
  group.add(roadDeck);

  const shoulderGeo = buildCurvedRibbonGeometry(carRoadCurve, 92, 1.82, 0.14, -0.025, 0, 1);
  const shoulder = new THREE.Mesh(shoulderGeo, mats.concreteMat);
  group.add(shoulder);

  const edgeLineMat = new THREE.MeshStandardMaterial({ color: 0xeab308, roughness: 0.55 });
  [-1.22, 1.22].forEach((offset) => {
    const lineGeo = buildCurvedRibbonGeometry(carRoadCurve, 84, 0.03, 0.008, 0.008, offset, 1);
    group.add(new THREE.Mesh(lineGeo, edgeLineMat));
  });

  [-1.54, 1.54].forEach((offset) => {
    const railGeo = buildCurvedRibbonGeometry(carRoadCurve, 74, 0.035, 0.14, 0.24, offset, 1, 0.84);
    group.add(new THREE.Mesh(railGeo, mats.brushedAluminumMat));
  });

  const worldUp = new THREE.Vector3(0, 1, 0);
  const pt = new THREE.Vector3();
  const tan = new THREE.Vector3();
  const right = new THREE.Vector3();
  const dummy = new THREE.Object3D();

  const dashCount = 34;
  const dashInst = new THREE.InstancedMesh(
    new THREE.BoxGeometry(0.06, 0.008, 0.92),
    new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.6 }),
    dashCount
  );
  for (let i = 0; i < dashCount; i++) {
    const u = 0.03 + (i / (dashCount - 1)) * 0.91;
    carRoadCurve.getPointAt(u, pt);
    carRoadCurve.getTangentAt(u, tan);
    tan.y = 0;
    tan.normalize();
    dummy.position.set(pt.x, pt.y + 0.006, pt.z);
    dummy.rotation.set(0, Math.atan2(tan.x, tan.z), 0);
    dummy.scale.set(1, 1, 1);
    dummy.updateMatrix();
    dashInst.setMatrixAt(i, dummy.matrix);
  }
  dashInst.instanceMatrix.needsUpdate = true;
  group.add(dashInst);

  const postPairs = 22;
  const postInst = new THREE.InstancedMesh(
    new THREE.BoxGeometry(0.045, 0.26, 0.045),
    mats.darkStructuralMat,
    postPairs * 2
  );
  let pIdx = 0;
  for (let i = 0; i < postPairs; i++) {
    const u = 0.03 + (i / (postPairs - 1)) * 0.8;
    carRoadCurve.getPointAt(u, pt);
    carRoadCurve.getTangentAt(u, tan);
    tan.y = 0;
    tan.normalize();
    right.crossVectors(tan, worldUp).normalize();
    const yaw = Math.atan2(tan.x, tan.z);
    [-1.56, 1.56].forEach((side) => {
      dummy.position.copy(pt).addScaledVector(right, side);
      dummy.position.y += 0.11;
      dummy.rotation.set(0, yaw, 0);
      dummy.updateMatrix();
      postInst.setMatrixAt(pIdx++, dummy.matrix);
    });
  }
  postInst.instanceMatrix.needsUpdate = true;
  group.add(postInst);

  const lampPairs = 8;
  const lampPoles = new THREE.InstancedMesh(
    new THREE.CylinderGeometry(0.026, 0.038, 1.72, 8),
    mats.darkStructuralMat,
    lampPairs * 2
  );
  const lampHeads = new THREE.InstancedMesh(
    new THREE.BoxGeometry(0.24, 0.04, 0.09),
    mats.warmGlowMat,
    lampPairs * 2
  );
  let lIdx = 0;
  for (let i = 0; i < lampPairs; i++) {
    const u = 0.08 + (i / (lampPairs - 1)) * 0.8;
    carRoadCurve.getPointAt(u, pt);
    carRoadCurve.getTangentAt(u, tan);
    tan.y = 0;
    tan.normalize();
    right.crossVectors(tan, worldUp).normalize();
    const yaw = Math.atan2(tan.x, tan.z);
    [-1.72, 1.72].forEach((side) => {
      dummy.position.copy(pt).addScaledVector(right, side);
      dummy.position.y += 0.86;
      dummy.rotation.set(0, yaw, 0);
      dummy.updateMatrix();
      lampPoles.setMatrixAt(lIdx, dummy.matrix);

      dummy.position.copy(pt).addScaledVector(right, side * 0.88);
      dummy.position.y += 1.7;
      dummy.rotation.set(0, yaw, 0);
      dummy.updateMatrix();
      lampHeads.setMatrixAt(lIdx, dummy.matrix);
      lIdx++;
    });
  }
  lampPoles.instanceMatrix.needsUpdate = true;
  lampHeads.instanceMatrix.needsUpdate = true;
  group.add(lampPoles, lampHeads);

  const gantryGroup = new THREE.Group();
  carRoadCurve.getPointAt(0.23, pt);
  carRoadCurve.getTangentAt(0.23, tan);
  tan.y = 0;
  tan.normalize();
  gantryGroup.position.set(pt.x, 0, pt.z);
  gantryGroup.rotation.y = Math.atan2(-tan.x, -tan.z);

  const gantrySignTex = mats.textures.createStationSign(
    'AKROM FADHIL',
    'FULL-STACK & AI PORTFOLIO',
    '01'
  );
  const gantryBoard = new THREE.Mesh(
    new THREE.BoxGeometry(3.4, 0.68, 0.14),
    new THREE.MeshStandardMaterial({
      map: gantrySignTex,
      roughness: 0.34,
      metalness: 0.18,
    })
  );
  gantryBoard.position.set(0, 2.08, 0);
  mats.registerPickable(gantryBoard, 'edge', 0);

  const gantryAccent = new THREE.Mesh(
    new THREE.BoxGeometry(3.2, 0.05, 0.16),
    mats.warmGlowMat
  );
  gantryAccent.position.set(0, 1.78, 0);

  [-1.75, 1.75].forEach((px) => {
    const col = new THREE.Mesh(
      new THREE.CylinderGeometry(0.06, 0.08, 2.3, 10),
      mats.brushedAluminumMat
    );
    col.position.set(px, 1.15, 0);
    gantryGroup.add(col);
  });
  gantryGroup.add(gantryBoard, gantryAccent);
  group.add(gantryGroup);

  freezeStaticTree(group);
  return group;
}

export function buildGrandTrainStation(mats: HubMaterialPalette): THREE.Group {
  const group = new THREE.Group();
  const [gx, gy, gz] = HUB_ANCHORS.grandStation;
  group.position.set(gx, gy, gz);

  const plazaSlab = new THREE.Mesh(
    new THREE.BoxGeometry(12.6, 0.16, 16.4),
    mats.concreteMat
  );
  plazaSlab.position.set(-0.2, -0.09, 0.4);
  group.add(plazaSlab);

  const dropBayAsphalt = new THREE.Mesh(
    new THREE.BoxGeometry(3.6, 0.04, 10.6),
    mats.asphaltMat
  );
  dropBayAsphalt.position.set(-2.6, 0.0, 2.8);
  group.add(dropBayAsphalt);

  const dropCanopy = new THREE.Mesh(
    new THREE.BoxGeometry(3.8, 0.12, 6.2),
    mats.whiteHullMat
  );
  dropCanopy.position.set(-2.6, 1.75, 4.2);
  dropCanopy.rotation.z = -0.05;

  const dropGlassRoof = new THREE.Mesh(
    new THREE.BoxGeometry(2.9, 0.05, 5.6),
    mats.glassArchMat
  );
  dropGlassRoof.position.set(-2.6, 1.82, 4.2);
  dropGlassRoof.rotation.z = -0.05;

  const dropLightStrip = new THREE.Mesh(
    new THREE.BoxGeometry(0.08, 0.04, 5.4),
    mats.warmGlowMat
  );
  dropLightStrip.position.set(-1.1, 1.68, 4.2);
  group.add(dropCanopy, dropGlassRoof, dropLightStrip);

  const bollardCount = 6;
  const bollards = new THREE.InstancedMesh(
    new THREE.CylinderGeometry(0.045, 0.052, 0.42, 8),
    mats.brushedAluminumMat,
    bollardCount
  );
  const dObj = new THREE.Object3D();
  for (let i = 0; i < bollardCount; i++) {
    dObj.position.set(-1.05, 0.21, 1.4 + i * 1.15);
    dObj.rotation.set(0, 0, 0);
    dObj.scale.set(1, 1, 1);
    dObj.updateMatrix();
    bollards.setMatrixAt(i, dObj.matrix);
  }
  bollards.instanceMatrix.needsUpdate = true;
  group.add(bollards);

  const trackLocalX = 1.4;
  const westPlatform = new THREE.Mesh(
    new THREE.BoxGeometry(2.05, 0.3, 12.6),
    mats.concreteMat
  );
  westPlatform.position.set(-0.45, 0.14, 0.0);

  const eastPlatform = new THREE.Mesh(
    new THREE.BoxGeometry(1.9, 0.3, 12.6),
    mats.concreteMat
  );
  eastPlatform.position.set(3.2, 0.14, 0.0);

  const tactileW = new THREE.Mesh(
    new THREE.BoxGeometry(0.14, 0.015, 12.4),
    mats.tactileYellowMat
  );
  tactileW.position.set(0.46, 0.298, 0.0);

  const tactileE = tactileW.clone();
  tactileE.position.set(2.36, 0.298, 0.0);
  group.add(westPlatform, eastPlatform, tactileW, tactileE);

  const archCount = 6;
  const archSpanR = 3.25;
  const archInst = new THREE.InstancedMesh(
    new THREE.TorusGeometry(archSpanR, 0.1, 8, 28, Math.PI),
    mats.brushedAluminumMat,
    archCount
  );
  const archFootInst = new THREE.InstancedMesh(
    new THREE.BoxGeometry(0.32, 0.55, 0.32),
    mats.darkStructuralMat,
    archCount * 2
  );
  let footIdx = 0;
  for (let i = 0; i < archCount; i++) {
    const az = -5.2 + i * 2.08;
    dObj.position.set(trackLocalX, 0.45, az);
    dObj.rotation.set(0, 0, 0);
    dObj.scale.set(1, 0.92, 1);
    dObj.updateMatrix();
    archInst.setMatrixAt(i, dObj.matrix);

    [-archSpanR, archSpanR].forEach((side) => {
      dObj.position.set(trackLocalX + side, 0.26, az);
      dObj.scale.set(1, 1, 1);
      dObj.updateMatrix();
      archFootInst.setMatrixAt(footIdx++, dObj.matrix);
    });
  }
  archInst.instanceMatrix.needsUpdate = true;
  archFootInst.instanceMatrix.needsUpdate = true;
  group.add(archInst, archFootInst);

  const glassVaultGeo = new THREE.CylinderGeometry(
    archSpanR - 0.08,
    archSpanR - 0.08,
    10.8,
    24,
    1,
    true,
    0,
    Math.PI
  );
  glassVaultGeo.rotateZ(Math.PI / 2);
  glassVaultGeo.rotateY(Math.PI / 2);
  const glassVault = new THREE.Mesh(glassVaultGeo, mats.glassArchMat);
  glassVault.scale.set(1, 0.92, 1);
  glassVault.position.set(trackLocalX, 0.45, 0.0);
  mats.registerPickable(glassVault, 'proxy', 1);
  group.add(glassVault);

  const purlinCount = 5;
  const purlinInst = new THREE.InstancedMesh(
    new THREE.BoxGeometry(0.07, 0.07, 11.0),
    mats.darkStructuralMat,
    purlinCount
  );
  for (let i = 0; i < purlinCount; i++) {
    const ang = 0.22 + (i / (purlinCount - 1)) * (Math.PI - 0.44);
    dObj.position.set(
      trackLocalX + Math.cos(ang) * archSpanR,
      0.45 + Math.sin(ang) * archSpanR * 0.92,
      0.0
    );
    dObj.rotation.set(0, 0, ang - Math.PI / 2);
    dObj.scale.set(1, 1, 1);
    dObj.updateMatrix();
    purlinInst.setMatrixAt(i, dObj.matrix);
  }
  purlinInst.instanceMatrix.needsUpdate = true;
  group.add(purlinInst);

  const concourseHall = new THREE.Mesh(
    new THREE.BoxGeometry(2.2, 1.9, 7.6),
    mats.glassArchMat
  );
  concourseHall.position.set(-2.2, 0.95, -0.4);
  const concourseRoof = new THREE.Mesh(
    new THREE.BoxGeometry(2.6, 0.14, 8.2),
    mats.whiteHullMat
  );
  concourseRoof.position.set(-2.2, 1.96, -0.4);
  const concourseCore = new THREE.Mesh(
    new THREE.BoxGeometry(1.5, 1.45, 6.4),
    mats.warmGlowMat
  );
  concourseCore.position.set(-2.2, 0.86, -0.4);
  group.add(concourseHall, concourseRoof, concourseCore);

  const skybridgeDeck = new THREE.Mesh(
    new THREE.BoxGeometry(6.8, 0.16, 1.25),
    mats.whiteHullMat
  );
  skybridgeDeck.position.set(1.2, 2.05, -2.8);
  const skybridgeGlassF = new THREE.Mesh(
    new THREE.BoxGeometry(6.8, 0.68, 0.05),
    mats.glassArchMat
  );
  skybridgeGlassF.position.set(1.2, 2.45, -2.2);
  const skybridgeGlassB = skybridgeGlassF.clone();
  skybridgeGlassB.position.z = -3.4;
  group.add(skybridgeDeck, skybridgeGlassF, skybridgeGlassB);

  const signTex = mats.textures.createStationSign(
    'GRAND STATION',
    'AKROM EXPRESS · PLATFORM 01',
    '01'
  );
  const facadeSign = new THREE.Mesh(
    new THREE.BoxGeometry(3.2, 0.72, 0.12),
    new THREE.MeshStandardMaterial({ map: signTex, roughness: 0.32, metalness: 0.18 })
  );
  facadeSign.position.set(trackLocalX, 3.62, 5.25);
  mats.registerPickable(facadeSign, 'proxy', 1);
  group.add(facadeSign);

  const clockMonolith = new THREE.Mesh(
    new THREE.BoxGeometry(0.46, 3.3, 0.46),
    mats.darkStructuralMat
  );
  clockMonolith.position.set(-3.9, 1.65, 5.2);
  const clockFace = new THREE.Mesh(
    new THREE.CylinderGeometry(0.24, 0.24, 0.06, 20),
    mats.warmGlowMat
  );
  clockFace.rotation.x = Math.PI / 2;
  clockFace.position.set(-3.9, 2.85, 5.45);
  group.add(clockMonolith, clockFace);

  const bumper = new THREE.Mesh(
    new THREE.BoxGeometry(0.86, 0.34, 0.26),
    mats.redBeaconMat
  );
  bumper.position.set(trackLocalX, 0.22, 4.9);
  group.add(bumper);

  const benchInst = new THREE.InstancedMesh(
    new THREE.BoxGeometry(0.32, 0.08, 1.15),
    mats.woodSleeperMat,
    6
  );
  const lampInst = new THREE.InstancedMesh(
    new THREE.BoxGeometry(0.18, 0.06, 0.65),
    mats.warmGlowMat,
    6
  );
  let bIdx = 0;
  [-3.2, 0.0, 3.2].forEach((bz) => {
    [-0.55, 3.35].forEach((bx) => {
      dObj.position.set(bx, 0.42, bz);
      dObj.rotation.set(0, 0, 0);
      dObj.scale.set(1, 1, 1);
      dObj.updateMatrix();
      benchInst.setMatrixAt(bIdx, dObj.matrix);

      dObj.position.set(bx, 2.68, bz);
      dObj.updateMatrix();
      lampInst.setMatrixAt(bIdx, dObj.matrix);
      bIdx++;
    });
  });
  benchInst.instanceMatrix.needsUpdate = true;
  lampInst.instanceMatrix.needsUpdate = true;
  group.add(benchInst, lampInst);

  freezeStaticTree(group);
  return group;
}

export function buildCurvedRailwayAndMidStations(
  trainTrackCurve: THREE.CatmullRomCurve3,
  mats: HubMaterialPalette
): THREE.Group {
  const group = new THREE.Group();

  const deckGeo = buildCurvedRibbonGeometry(trainTrackCurve, 130, 1.06, 0.32, -0.14, 0, 1);
  group.add(new THREE.Mesh(deckGeo, mats.concreteMat));

  [-0.96, 0.96].forEach((offset) => {
    const curbGeo = buildCurvedRibbonGeometry(trainTrackCurve, 120, 0.09, 0.14, -0.05, offset, 1);
    group.add(new THREE.Mesh(curbGeo, mats.concreteMat));
  });

  const ballastGeo = buildCurvedRibbonGeometry(trainTrackCurve, 120, 0.68, 0.06, -0.08, 0, 1);
  group.add(new THREE.Mesh(ballastGeo, mats.ballastMat));

  [-0.24, 0.24].forEach((offset) => {
    const railBaseGeo = buildCurvedRibbonGeometry(
      trainTrackCurve,
      130,
      0.036,
      0.025,
      -0.026,
      offset,
      1
    );
    const railHeadGeo = buildCurvedRibbonGeometry(
      trainTrackCurve,
      130,
      0.026,
      0.026,
      0.0,
      offset,
      1
    );
    group.add(
      new THREE.Mesh(railBaseGeo, mats.darkStructuralMat),
      new THREE.Mesh(railHeadGeo, mats.railSteelMat)
    );
  });

  const worldUp = new THREE.Vector3(0, 1, 0);
  const pt = new THREE.Vector3();
  const tan = new THREE.Vector3();
  const right = new THREE.Vector3();
  const dummy = new THREE.Object3D();

  const sleeperCount = 175;
  const sleepers = new THREE.InstancedMesh(
    new THREE.BoxGeometry(1.06, 0.052, 0.16),
    mats.woodSleeperMat,
    sleeperCount
  );
  const fasteners = new THREE.InstancedMesh(
    new THREE.BoxGeometry(0.08, 0.02, 0.07),
    mats.darkStructuralMat,
    sleeperCount * 2
  );

  for (let i = 0; i < sleeperCount; i++) {
    const u = i / (sleeperCount - 1);
    trainTrackCurve.getPointAt(u, pt);
    trainTrackCurve.getTangentAt(u, tan);
    const horizLen = Math.hypot(tan.x, tan.z) || 1;
    const yaw = Math.atan2(tan.x, tan.z);
    const pitch = -Math.atan2(tan.y, horizLen);
    const flatTan = new THREE.Vector3(tan.x, 0, tan.z).normalize();
    right.crossVectors(flatTan, worldUp).normalize();

    dummy.position.set(pt.x, pt.y - 0.062, pt.z);
    dummy.rotation.set(pitch, yaw, 0, 'YXZ');
    dummy.scale.set(1, 1, 1);
    dummy.updateMatrix();
    sleepers.setMatrixAt(i, dummy.matrix);

    [-0.24, 0.24].forEach((side, sIdx) => {
      dummy.position.copy(pt).addScaledVector(right, side);
      dummy.position.y -= 0.036;
      dummy.updateMatrix();
      fasteners.setMatrixAt(i * 2 + sIdx, dummy.matrix);
    });
  }
  sleepers.instanceMatrix.needsUpdate = true;
  fasteners.instanceMatrix.needsUpdate = true;
  group.add(sleepers, fasteners);

  const mastCount = 14;
  const pierInst = new THREE.InstancedMesh(
    new THREE.CylinderGeometry(0.32, 0.44, 1, 10),
    mats.concreteMat,
    mastCount
  );
  const mastPoleInst = new THREE.InstancedMesh(
    new THREE.BoxGeometry(0.085, 1.48, 0.085),
    mats.brushedAluminumMat,
    mastCount
  );
  const armInst = new THREE.InstancedMesh(
    new THREE.BoxGeometry(1.12, 0.034, 0.034),
    mats.brushedAluminumMat,
    mastCount
  );
  const insulatorInst = new THREE.InstancedMesh(
    new THREE.CylinderGeometry(0.032, 0.032, 0.14, 8),
    mats.redBeaconMat,
    mastCount
  );

  const contactWirePts: THREE.Vector3[] = [];
  const messengerWirePts: THREE.Vector3[] = [];
  let pierUsed = 0;

  for (let i = 0; i < mastCount; i++) {
    const u = 0.08 + (i / (mastCount - 1)) * 0.84;
    trainTrackCurve.getPointAt(u, pt);
    trainTrackCurve.getTangentAt(u, tan);
    const flatTan = new THREE.Vector3(tan.x, 0, tan.z).normalize();
    right.crossVectors(flatTan, worldUp).normalize();
    const yaw = Math.atan2(flatTan.x, flatTan.z);

    contactWirePts.push(new THREE.Vector3(pt.x, pt.y + 0.72, pt.z));
    messengerWirePts.push(new THREE.Vector3(pt.x, pt.y + 1.06, pt.z));

    const groundY = sampleMountainElevation(pt.x, pt.z) - 0.7;
    const deckBottomY = pt.y - 0.42;
    const pierH = deckBottomY - groundY;
    if (pierH > 0.25) {
      dummy.position.set(pt.x, groundY + pierH * 0.5, pt.z);
      dummy.rotation.set(0, 0, 0);
      dummy.scale.set(1, pierH, 1);
      dummy.updateMatrix();
      pierInst.setMatrixAt(pierUsed++, dummy.matrix);
    }

    dummy.scale.set(1, 1, 1);
    dummy.position.copy(pt).addScaledVector(right, -0.96);
    dummy.position.y += 0.64;
    dummy.rotation.set(0, yaw, 0);
    dummy.updateMatrix();
    mastPoleInst.setMatrixAt(i, dummy.matrix);

    dummy.position.copy(pt).addScaledVector(right, -0.4);
    dummy.position.y += 0.78;
    dummy.updateMatrix();
    armInst.setMatrixAt(i, dummy.matrix);

    dummy.position.copy(pt).addScaledVector(right, -0.74);
    dummy.position.y += 0.78;
    dummy.rotation.set(0, yaw, Math.PI / 2, 'YXZ');
    dummy.updateMatrix();
    insulatorInst.setMatrixAt(i, dummy.matrix);
  }
  pierInst.count = pierUsed;
  [pierInst, mastPoleInst, armInst, insulatorInst].forEach((inst) => {
    inst.instanceMatrix.needsUpdate = true;
    group.add(inst);
  });

  const wireMat = new THREE.MeshStandardMaterial({
    color: 0xd4a373,
    metalness: 0.72,
    roughness: 0.34,
  });
  const contactCurve = new THREE.CatmullRomCurve3(contactWirePts);
  const messengerCurve = new THREE.CatmullRomCurve3(messengerWirePts);
  group.add(
    new THREE.Mesh(new THREE.TubeGeometry(contactCurve, 48, 0.009, 6, false), wireMat),
    new THREE.Mesh(new THREE.TubeGeometry(messengerCurve, 48, 0.007, 6, false), wireMat)
  );

  const midStationConfigs = [
    { u: 0.25, expIndex: 0, stopIndex: 2, side: 1, code: 'VIADUCT 02' },
    { u: 0.47, expIndex: 1, stopIndex: 3, side: -1, code: 'CANYON 03' },
    { u: 0.7, expIndex: 2, stopIndex: 4, side: 1, code: 'VALLEY 04' },
  ];

  midStationConfigs.forEach((cfg) => {
    const exp = EXPERIENCES[cfg.expIndex];
    trainTrackCurve.getPointAt(cfg.u, pt);
    trainTrackCurve.getTangentAt(cfg.u, tan);
    const flatTan = new THREE.Vector3(tan.x, 0, tan.z).normalize();
    const yaw = Math.atan2(-flatTan.x, -flatTan.z);

    const stGroup = new THREE.Group();
    stGroup.position.copy(pt);
    stGroup.rotation.y = yaw;

    const ox = cfg.side * 2.18;
    const plat = new THREE.Mesh(new THREE.BoxGeometry(2.35, 0.34, 5.2), mats.concreteMat);
    plat.position.set(ox, -0.02, 0);

    const tactile = new THREE.Mesh(
      new THREE.BoxGeometry(0.14, 0.015, 5.12),
      mats.tactileYellowMat
    );
    tactile.position.set(ox - cfg.side * 1.04, 0.16, 0);

    const canopy = new THREE.Mesh(new THREE.BoxGeometry(2.55, 0.09, 5.35), mats.whiteHullMat);
    canopy.position.set(ox, 1.32, 0);
    canopy.rotation.z = cfg.side * 0.05;
    mats.registerPickable(canopy, exp.id, cfg.stopIndex);

    const glassWall = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.96, 3.6), mats.glassArchMat);
    glassWall.position.set(ox + cfg.side * 0.96, 0.65, 0);

    const signTex = mats.textures.createStationSign(
      cfg.code,
      exp.company.toUpperCase().slice(0, 22),
      `0${cfg.expIndex + 1}`
    );
    const signBoard = new THREE.Mesh(
      new THREE.BoxGeometry(0.06, 0.34, 1.65),
      new THREE.MeshStandardMaterial({ map: signTex, roughness: 0.35, metalness: 0.15 })
    );
    signBoard.position.set(ox - cfg.side * 0.72, 1.04, 0);

    [-1.7, 0, 1.7].forEach((cz) => {
      const col = new THREE.Mesh(new THREE.BoxGeometry(0.09, 1.15, 0.09), mats.brushedAluminumMat);
      col.position.set(ox + cfg.side * 0.14, 0.72, cz);
      stGroup.add(col);
    });

    const groundBelow = sampleMountainElevation(pt.x, pt.z) - 1.2;
    const supportH = Math.max(1.2, pt.y - groundBelow);
    [-1.6, 1.6].forEach((pz) => {
      const supportPier = new THREE.Mesh(
        new THREE.CylinderGeometry(0.28, 0.38, supportH, 10),
        mats.concreteMat
      );
      supportPier.position.set(ox, -0.18 - supportH * 0.5, pz);
      stGroup.add(supportPier);
    });

    const lampStrip = new THREE.Mesh(
      new THREE.BoxGeometry(0.1, 0.04, 4.4),
      mats.warmGlowMat
    );
    lampStrip.position.set(ox - cfg.side * 0.45, 1.26, 0);

    stGroup.add(plat, tactile, canopy, glassWall, signBoard, lampStrip);
    group.add(stGroup);
  });

  freezeStaticTree(group);
  return group;
}

export function buildAirportHub(mats: HubMaterialPalette): AirportHubResult {
  const group = new THREE.Group();
  const plateauY = 0.2;

  const apronSlab = new THREE.Mesh(
    new THREE.BoxGeometry(26.5, 0.16, 46.0),
    mats.concreteMat
  );
  apronSlab.position.set(0.4, plateauY - 0.08, -147.0);
  group.add(apronSlab);

  const runwayMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(5.2, 42.0),
    new THREE.MeshStandardMaterial({
      map: mats.textures.runwayMap,
      roughness: 0.84,
      metalness: 0.06,
    })
  );
  runwayMesh.rotation.x = -Math.PI / 2;
  runwayMesh.position.set(HUB_ANCHORS.runwayCenter[0], plateauY + 0.015, HUB_ANCHORS.runwayCenter[2]);
  group.add(runwayMesh);

  const taxiwayA = new THREE.Mesh(new THREE.BoxGeometry(5.4, 0.02, 2.2), mats.asphaltMat);
  taxiwayA.position.set(-1.6, plateauY + 0.008, -137.0);
  const taxiwayB = taxiwayA.clone();
  taxiwayB.position.set(-1.6, plateauY + 0.008, -148.0);
  group.add(taxiwayA, taxiwayB);

  const runwayBeaconMat = new THREE.MeshStandardMaterial({
    color: 0xf8fafc,
    emissive: 0xe0f2fe,
    emissiveIntensity: 1.8,
  });
  const edgeLightCount = 24;
  const edgeLights = new THREE.InstancedMesh(
    new THREE.SphereGeometry(0.065, 8, 8),
    runwayBeaconMat,
    edgeLightCount
  );
  const dObj = new THREE.Object3D();
  let elIdx = 0;
  for (let i = 0; i < 12; i++) {
    const lz = -128.0 - i * 3.5;
    [0.05, 5.55].forEach((lx) => {
      dObj.position.set(lx, plateauY + 0.09, lz);
      dObj.rotation.set(0, 0, 0);
      dObj.scale.set(1, 1, 1);
      dObj.updateMatrix();
      edgeLights.setMatrixAt(elIdx++, dObj.matrix);
    });
  }
  edgeLights.instanceMatrix.needsUpdate = true;
  group.add(edgeLights);

  const thresholdLights = new THREE.InstancedMesh(
    new THREE.BoxGeometry(0.18, 0.09, 0.14),
    mats.greenBeaconMat,
    6
  );
  for (let i = 0; i < 6; i++) {
    dObj.position.set(0.6 + i * 0.88, plateauY + 0.07, -126.8);
    dObj.updateMatrix();
    thresholdLights.setMatrixAt(i, dObj.matrix);
  }
  thresholdLights.instanceMatrix.needsUpdate = true;
  group.add(thresholdLights);

  const railTermGroup = new THREE.Group();
  railTermGroup.position.set(
    HUB_ANCHORS.airportRailStop[0],
    plateauY,
    HUB_ANCHORS.airportRailStop[2]
  );

  const railPlat = new THREE.Mesh(new THREE.BoxGeometry(2.3, 0.28, 8.2), mats.concreteMat);
  railPlat.position.set(-1.6, 0.14, 0.0);
  const railTactile = new THREE.Mesh(
    new THREE.BoxGeometry(0.14, 0.015, 8.1),
    mats.tactileYellowMat
  );
  railTactile.position.set(-0.54, 0.29, 0.0);
  const railCanopy = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.12, 8.6), mats.whiteHullMat);
  railCanopy.position.set(-1.25, 1.56, 0.0);
  const railSignTex = mats.textures.createStationSign(
    'AIRPORT RAIL',
    'SKYWAY TO TERMINAL 1',
    '05'
  );
  const railSign = new THREE.Mesh(
    new THREE.BoxGeometry(2.4, 0.46, 0.1),
    new THREE.MeshStandardMaterial({ map: railSignTex, roughness: 0.34, metalness: 0.16 })
  );
  railSign.position.set(-1.3, 1.88, 4.15);
  mats.registerPickable(railCanopy, 'exp-inovindo', 5);
  const railBumper = new THREE.Mesh(new THREE.BoxGeometry(0.84, 0.32, 0.24), mats.redBeaconMat);
  railBumper.position.set(0, 0.2, -4.1);
  railTermGroup.add(railPlat, railTactile, railCanopy, railSign, railBumper);
  group.add(railTermGroup);

  const skywalk = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.85, 1.2), mats.glassArchMat);
  skywalk.position.set(-3.4, plateauY + 1.55, -131.6);
  skywalk.rotation.y = 0.45;
  const skywalkFloor = new THREE.Mesh(new THREE.BoxGeometry(4.3, 0.14, 1.32), mats.whiteHullMat);
  skywalkFloor.position.set(-3.4, plateauY + 1.12, -131.6);
  skywalkFloor.rotation.y = 0.45;
  group.add(skywalk, skywalkFloor);

  const [tx, ty, tz] = HUB_ANCHORS.airportTerminal;
  const termGroup = new THREE.Group();
  termGroup.position.set(tx, ty, tz);

  const termBase = new THREE.Mesh(new THREE.BoxGeometry(5.6, 0.36, 15.2), mats.concreteMat);
  termBase.position.set(0, 0.18, 0);
  const termGlass = new THREE.Mesh(new THREE.BoxGeometry(4.8, 2.35, 14.4), mats.glassArchMat);
  termGlass.position.set(0.2, 1.5, 0);
  const termWarmCore = new THREE.Mesh(new THREE.BoxGeometry(3.4, 1.75, 12.8), mats.warmGlowMat);
  termWarmCore.position.set(-0.2, 1.32, 0);
  const termWingRoof = new THREE.Mesh(new THREE.BoxGeometry(7.2, 0.22, 16.8), mats.whiteHullMat);
  termWingRoof.position.set(0.55, 2.92, 0);
  termWingRoof.rotation.z = 0.08;
  mats.registerPickable(termWingRoof, 'exp-inovindo', 5);

  const termRoofAccent = new THREE.Mesh(
    new THREE.BoxGeometry(0.14, 0.08, 16.4),
    mats.cyanGlowMat
  );
  termRoofAccent.position.set(4.1, 3.18, 0);
  termGroup.add(termBase, termGlass, termWarmCore, termWingRoof, termRoofAccent);

  [-3.8, 3.2].forEach((jz) => {
    const bridgeArm = new THREE.Mesh(
      new THREE.BoxGeometry(3.2, 0.54, 0.62),
      mats.brushedAluminumMat
    );
    bridgeArm.position.set(3.8, 1.25, jz);
    const bridgeLeg = new THREE.Mesh(
      new THREE.CylinderGeometry(0.08, 0.1, 1.1, 8),
      mats.darkStructuralMat
    );
    bridgeLeg.position.set(5.1, 0.55, jz);
    termGroup.add(bridgeArm, bridgeLeg);
  });
  group.add(termGroup);

  const [ax, ay, az] = HUB_ANCHORS.atcTower;
  const atcGroup = new THREE.Group();
  atcGroup.position.set(ax, ay, az);

  const shaft = new THREE.Mesh(
    new THREE.CylinderGeometry(0.46, 0.78, 5.2, 10),
    mats.concreteMat
  );
  shaft.position.y = 2.6;
  const neckCollar = new THREE.Mesh(
    new THREE.CylinderGeometry(0.88, 0.54, 0.45, 10),
    mats.darkStructuralMat
  );
  neckCollar.position.y = 5.35;
  const cabGlass = new THREE.Mesh(
    new THREE.CylinderGeometry(1.22, 0.86, 0.96, 8),
    mats.glassArchMat
  );
  cabGlass.position.y = 6.02;
  const cabInterior = new THREE.Mesh(
    new THREE.CylinderGeometry(0.76, 0.68, 0.45, 8),
    mats.cyanGlowMat
  );
  cabInterior.position.y = 5.88;
  const cabRoof = new THREE.Mesh(
    new THREE.CylinderGeometry(1.42, 1.28, 0.22, 8),
    mats.whiteHullMat
  );
  cabRoof.position.y = 6.6;
  const spire = new THREE.Mesh(
    new THREE.CylinderGeometry(0.02, 0.04, 1.25, 8),
    mats.brushedAluminumMat
  );
  spire.position.set(0.55, 7.25, 0);
  const spireBeacon = new THREE.Mesh(
    new THREE.SphereGeometry(0.075, 10, 10),
    mats.redBeaconMat
  );
  spireBeacon.position.set(0.55, 7.9, 0);

  const radarPivot = new THREE.Group();
  radarPivot.position.set(0, 6.86, 0);
  const radarPedestal = new THREE.Mesh(
    new THREE.CylinderGeometry(0.14, 0.18, 0.34, 10),
    mats.darkStructuralMat
  );
  const radarBar = new THREE.Mesh(
    new THREE.BoxGeometry(1.15, 0.18, 0.12),
    mats.whiteHullMat
  );
  radarBar.position.y = 0.22;
  radarPivot.add(radarPedestal, radarBar);

  atcGroup.add(shaft, neckCollar, cabGlass, cabInterior, cabRoof, spire, spireBeacon, radarPivot);
  group.add(atcGroup);

  [-139.0, -148.5].forEach((hz) => {
    const hangar = new THREE.Group();
    hangar.position.set(9.2, plateauY, hz);
    const body = new THREE.Mesh(new THREE.BoxGeometry(4.4, 1.7, 6.6), mats.concreteMat);
    body.position.y = 0.85;
    const archRoof = new THREE.Mesh(
      new THREE.CylinderGeometry(2.25, 2.25, 6.8, 16, 1, false, 0, Math.PI),
      mats.brushedAluminumMat
    );
    archRoof.rotation.z = Math.PI / 2;
    archRoof.rotation.y = Math.PI / 2;
    archRoof.scale.set(1, 0.45, 1);
    archRoof.position.y = 1.65;
    const door = new THREE.Mesh(new THREE.BoxGeometry(0.08, 1.32, 4.8), mats.darkStructuralMat);
    door.position.set(-2.22, 0.68, 0);
    hangar.add(body, archRoof, door);
    group.add(hangar);
  });

  group.traverse((obj) => {
    if (obj === group || obj === radarPivot || obj.parent === radarPivot) return;
    obj.updateMatrix();
    obj.matrixAutoUpdate = false;
  });

  return { group, radarPivot, runwayBeaconMat };
}

export function buildSpaceportComplex(mats: HubMaterialPalette): SpaceportHubResult {
  const group = new THREE.Group();
  const plateauY = HUB_ANCHORS.spaceportPlateauY;

  const mesaW = 74;
  const mesaD = 64;
  const mesaGeo = new THREE.PlaneGeometry(mesaW, mesaD, 48, 44);
  mesaGeo.rotateX(-Math.PI / 2);
  mesaGeo.translate(0, 0, -252);

  const pos = mesaGeo.attributes.position;
  const colors = new Float32Array(pos.count * 3);
  const cTop = new THREE.Color(0x283242);
  const cCliff = new THREE.Color(0x3a4352);
  const cDeep = new THREE.Color(0x131b2c);
  const cSnow = new THREE.Color(0x9fb2c8);
  const tmpC = new THREE.Color();

  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const z = pos.getZ(i);
    const dx = Math.max(0, Math.abs(x - 0.8) - 11.8);
    const dz = Math.max(0, Math.abs(z + 251.5) - 17.5);
    const edgeDist = Math.hypot(dx, dz);
    const dropFactor = THREE.MathUtils.smoothstep(edgeDist, 0.2, 18.0);
    const noise = (hashSeed(Math.floor(x * 1.4) + Math.floor(z * 2.1)) - 0.5) * 1.6;
    const h =
      edgeDist <= 0.1
        ? plateauY - 0.05
        : THREE.MathUtils.lerp(plateauY - 0.05, -9.5, dropFactor) + noise * dropFactor;
    pos.setXYZ(i, x, h, z);

    if (edgeDist <= 0.5) {
      tmpC.copy(cTop);
    } else if (h > 3.2) {
      tmpC.copy(cCliff).lerp(cSnow, 0.22);
    } else {
      tmpC.copy(cCliff).lerp(cDeep, dropFactor);
    }
    colors[i * 3] = tmpC.r;
    colors[i * 3 + 1] = tmpC.g;
    colors[i * 3 + 2] = tmpC.b;
  }
  mesaGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  mesaGeo.computeVertexNormals();

  const mesaMesh = new THREE.Mesh(
    mesaGeo,
    new THREE.MeshStandardMaterial({
      vertexColors: true,
      roughness: 0.9,
      metalness: 0.06,
    })
  );
  group.add(mesaMesh);

  const deckSlab = new THREE.Mesh(
    new THREE.BoxGeometry(22.4, 0.18, 34.0),
    mats.concreteMat
  );
  deckSlab.position.set(1.2, plateauY - 0.105, -251.0);
  group.add(deckSlab);

  const spRunway = new THREE.Mesh(
    new THREE.PlaneGeometry(4.4, 24.5),
    new THREE.MeshStandardMaterial({
      map: mats.textures.runwayMap,
      roughness: 0.84,
      metalness: 0.06,
    })
  );
  spRunway.rotation.x = -Math.PI / 2;
  spRunway.position.set(
    HUB_ANCHORS.spaceportRunwayCenter[0],
    plateauY + 0.015,
    HUB_ANCHORS.spaceportRunwayCenter[2]
  );
  group.add(spRunway);

  const padBeaconMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    emissive: 0x0ea5e9,
    emissiveIntensity: 1.9,
  });

  const spLights = new THREE.InstancedMesh(
    new THREE.SphereGeometry(0.06, 8, 8),
    padBeaconMat,
    16
  );
  const dObj = new THREE.Object3D();
  let slIdx = 0;
  for (let i = 0; i < 8; i++) {
    const lz = -233.0 - i * 3.1;
    [-5.1, -0.5].forEach((lx) => {
      dObj.position.set(lx, plateauY + 0.08, lz);
      dObj.rotation.set(0, 0, 0);
      dObj.scale.set(1, 1, 1);
      dObj.updateMatrix();
      spLights.setMatrixAt(slIdx++, dObj.matrix);
    });
  }
  spLights.instanceMatrix.needsUpdate = true;
  group.add(spLights);

  const missionCtrl = new THREE.Group();
  missionCtrl.position.set(-7.1, plateauY, -251.5);
  missionCtrl.rotation.y = 0.22;
  const ctrlBody = new THREE.Mesh(new THREE.BoxGeometry(2.8, 1.35, 4.4), mats.darkStructuralMat);
  ctrlBody.position.y = 0.68;
  const ctrlGlass = new THREE.Mesh(new THREE.BoxGeometry(2.55, 0.68, 3.8), mats.glassArchMat);
  ctrlGlass.position.set(0.2, 1.28, 0);
  const ctrlGlow = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.42, 3.2), mats.cyanGlowMat);
  ctrlGlow.position.set(0.05, 1.24, 0);
  const ctrlRoof = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.12, 4.8), mats.whiteHullMat);
  ctrlRoof.position.y = 1.68;
  mats.registerPickable(ctrlRoof, 'proj-tiss', 8);
  missionCtrl.add(ctrlBody, ctrlGlass, ctrlGlow, ctrlRoof);
  group.add(missionCtrl);

  const [lx, , lz] = HUB_ANCHORS.launchpadCenter;
  const padGroup = new THREE.Group();
  padGroup.position.set(lx, plateauY, lz);

  const wallL = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.84, 5.2), mats.concreteMat);
  wallL.position.set(-1.65, 0.42, 0);
  const wallR = wallL.clone();
  wallR.position.set(1.65, 0.42, 0);

  const trenchFloor = new THREE.Mesh(
    new THREE.BoxGeometry(1.85, 0.14, 5.6),
    mats.darkStructuralMat
  );
  trenchFloor.position.set(0, 0.05, 0);

  const flameDeflector = new THREE.Mesh(
    new THREE.BoxGeometry(1.5, 0.12, 1.9),
    mats.brushedAluminumMat
  );
  flameDeflector.position.set(0, 0.36, 0.2);
  flameDeflector.rotation.x = 0.42;

  const launchDeckRing = new THREE.Mesh(
    new THREE.TorusGeometry(0.95, 0.16, 10, 28),
    mats.darkStructuralMat
  );
  launchDeckRing.rotation.x = Math.PI / 2;
  launchDeckRing.position.set(0, 0.84, 0);
  mats.registerPickable(launchDeckRing, 'proj-tiss', 8);

  const deckBridgeFront = new THREE.Mesh(new THREE.BoxGeometry(4.9, 0.24, 1.5), mats.concreteMat);
  deckBridgeFront.position.set(0, 0.72, 1.85);
  const deckBridgeBack = deckBridgeFront.clone();
  deckBridgeBack.position.set(0, 0.72, -1.85);

  [0, Math.PI * 0.5, Math.PI, Math.PI * 1.5].forEach((ang) => {
    const clamp = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.34, 0.24), mats.goldKaptonMat);
    clamp.position.set(Math.cos(ang) * 0.62, 0.98, Math.sin(ang) * 0.62);
    clamp.rotation.y = -ang;
    padGroup.add(clamp);
  });

  padGroup.add(
    wallL,
    wallR,
    trenchFloor,
    flameDeflector,
    launchDeckRing,
    deckBridgeFront,
    deckBridgeBack
  );

  const towerBaseX = 1.85;
  const towerH = 5.8;
  const colPositions: [number, number][] = [
    [-0.45, -0.45],
    [0.45, -0.45],
    [-0.45, 0.45],
    [0.45, 0.45],
  ];
  colPositions.forEach(([cx, cz]) => {
    const col = new THREE.Mesh(
      new THREE.BoxGeometry(0.11, towerH, 0.11),
      mats.darkStructuralMat
    );
    col.position.set(towerBaseX + cx, towerH * 0.5, cz);
    padGroup.add(col);
  });

  const bayLevels = 7;
  const horizBeams = new THREE.InstancedMesh(
    new THREE.BoxGeometry(0.96, 0.065, 0.065),
    mats.brushedAluminumMat,
    bayLevels * 4
  );
  let hIdx = 0;
  for (let b = 0; b < bayLevels; b++) {
    const by = 0.8 + b * 0.8;
    [
      [0, -0.45, 0],
      [0, 0.45, 0],
      [-0.45, 0, Math.PI / 2],
      [0.45, 0, Math.PI / 2],
    ].forEach(([ox, oz, ry]) => {
      dObj.position.set(towerBaseX + ox, by, oz);
      dObj.rotation.set(0, ry, 0);
      dObj.scale.set(1, 1, 1);
      dObj.updateMatrix();
      horizBeams.setMatrixAt(hIdx++, dObj.matrix);
    });
  }
  horizBeams.instanceMatrix.needsUpdate = true;
  padGroup.add(horizBeams);

  const towerCrown = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.18, 1.15), mats.whiteHullMat);
  towerCrown.position.set(towerBaseX, towerH + 0.08, 0);
  const towerSpire = new THREE.Mesh(
    new THREE.CylinderGeometry(0.025, 0.05, 1.35, 8),
    mats.brushedAluminumMat
  );
  towerSpire.position.set(towerBaseX, towerH + 0.82, 0);
  const towerBeacon = new THREE.Mesh(new THREE.SphereGeometry(0.08, 10, 10), mats.redBeaconMat);
  towerBeacon.position.set(towerBaseX, towerH + 1.5, 0);
  padGroup.add(towerCrown, towerSpire, towerBeacon);

  const swingArms: THREE.Group[] = [];
  const armSpecs = [
    { y: 2.52, len: 1.52, w: 0.26, h: 0.22, mat: mats.whiteHullMat },
    { y: 1.95, len: 1.48, w: 0.14, h: 0.1, mat: mats.brushedAluminumMat },
    { y: 1.38, len: 1.46, w: 0.14, h: 0.1, mat: mats.goldKaptonMat },
  ];
  armSpecs.forEach((spec) => {
    const armPivot = new THREE.Group();
    armPivot.position.set(towerBaseX - 0.42, spec.y, 0);
    const armMesh = new THREE.Mesh(
      new THREE.BoxGeometry(spec.len, spec.h, spec.w),
      spec.mat
    );
    armMesh.position.set(-spec.len * 0.5, 0, 0);
    armPivot.add(armMesh);
    swingArms.push(armPivot);
    padGroup.add(armPivot);
  });

  const mastCorners: [number, number][] = [
    [-2.9, -2.7],
    [3.1, -2.7],
    [-2.9, 2.7],
    [3.1, 2.7],
  ];
  const lightningMasts = new THREE.InstancedMesh(
    new THREE.CylinderGeometry(0.03, 0.08, 6.4, 8),
    mats.brushedAluminumMat,
    4
  );
  mastCorners.forEach(([mx, mz], idx) => {
    dObj.position.set(mx, 3.2, mz);
    dObj.rotation.set(0, 0, 0);
    dObj.scale.set(1, 1, 1);
    dObj.updateMatrix();
    lightningMasts.setMatrixAt(idx, dObj.matrix);
  });
  lightningMasts.instanceMatrix.needsUpdate = true;
  padGroup.add(lightningMasts);

  const tankGroup = new THREE.Group();
  tankGroup.position.set(4.8, 0, 2.6);
  [-1.05, 1.05].forEach((tz) => {
    const sphere = new THREE.Mesh(new THREE.SphereGeometry(0.82, 20, 16), mats.whiteHullMat);
    sphere.position.set(0, 1.05, tz);
    const band = new THREE.Mesh(
      new THREE.TorusGeometry(0.83, 0.035, 8, 24),
      mats.cyanGlowMat
    );
    band.rotation.x = Math.PI / 2;
    band.position.set(0, 1.05, tz);
    const leg = new THREE.Mesh(
      new THREE.CylinderGeometry(0.28, 0.42, 0.45, 10),
      mats.darkStructuralMat
    );
    leg.position.set(0, 0.22, tz);
    tankGroup.add(sphere, band, leg);
  });
  const feedPipe = new THREE.Mesh(
    new THREE.CylinderGeometry(0.075, 0.075, 4.2, 10),
    mats.brushedAluminumMat
  );
  feedPipe.rotation.z = Math.PI / 2;
  feedPipe.position.set(-2.1, 0.45, 0);
  tankGroup.add(feedPipe);
  padGroup.add(tankGroup);

  const cryoPlumes: THREE.Mesh[] = [];
  const cryoMat = new THREE.MeshBasicMaterial({
    color: 0xdbeafe,
    transparent: true,
    opacity: 0.26,
    depthWrite: false,
  });
  for (let i = 0; i < 4; i++) {
    const puff = new THREE.Mesh(new THREE.SphereGeometry(0.32 + i * 0.1, 10, 8), cryoMat);
    puff.position.set(0.95 + i * 0.28, 0.72 + i * 0.22, 0.4 - i * 0.18);
    cryoPlumes.push(puff);
    padGroup.add(puff);
  }

  group.add(padGroup);

  const dynamicSet = new Set<THREE.Object3D>([group, ...swingArms, ...cryoPlumes]);
  swingArms.forEach((a) => a.children.forEach((c) => dynamicSet.add(c)));
  group.traverse((obj) => {
    if (dynamicSet.has(obj)) return;
    obj.updateMatrix();
    obj.matrixAutoUpdate = false;
  });

  return { group, swingArms, cryoPlumes, padBeaconMat };
}

export function buildDeepSpaceObservatory(mats: HubMaterialPalette): ObservatoryHubResult {
  const group = new THREE.Group();
  const [ox, oy, oz] = HUB_ANCHORS.observatoryAnchor;
  const [ex, ey, ez] = HUB_ANCHORS.exoplanetAnchor;
  const deliveredStopIndex = STOPS.length - 1;

  const exoPivot = new THREE.Group();
  exoPivot.position.set(ex, ey, ez);
  exoPivot.rotation.z = THREE.MathUtils.degToRad(27.5);

  const EXO_RADIUS = 3.25;
  const exoplanetMesh = new THREE.Mesh(
    new THREE.SphereGeometry(EXO_RADIUS, 56, 40),
    new THREE.MeshStandardMaterial({
      map: mats.textures.neptune,
      color: 0xdbeafe,
      roughness: 0.68,
      metalness: 0.06,
    })
  );
  mats.registerPickable(exoplanetMesh, 'delivered', deliveredStopIndex);

  const exoAtmo = mats.createPlanetAtmosphereMesh(EXO_RADIUS * 1.055, 0x7dd3fc, 0.66);

  const exoRingGeo = mats.createPlanetaryRingGeometry(EXO_RADIUS * 1.28, EXO_RADIUS * 1.72, 80);
  const exoplanetRing = new THREE.Mesh(
    exoRingGeo,
    new THREE.MeshStandardMaterial({
      color: 0xbae6fd,
      transparent: true,
      opacity: 0.24,
      roughness: 0.6,
      metalness: 0.12,
      side: THREE.DoubleSide,
      depthWrite: false,
    })
  );
  exoplanetRing.rotation.x = 0.28;

  exoPivot.add(exoplanetMesh, exoAtmo, exoplanetRing);
  group.add(exoPivot);

  const stationGroup = new THREE.Group();
  stationGroup.position.set(ox, oy, oz);
  stationGroup.rotation.y = -0.35;

  const coreSpine = new THREE.Mesh(
    new THREE.CylinderGeometry(0.38, 0.42, 4.2, 20),
    mats.whiteHullMat
  );
  coreSpine.rotation.x = Math.PI / 2;
  mats.registerPickable(coreSpine, 'delivered', deliveredStopIndex);

  const cupola = new THREE.Mesh(
    new THREE.SphereGeometry(0.46, 18, 14),
    mats.glassArchMat
  );
  cupola.position.set(0, 0.42, -0.55);
  const cupolaGlow = new THREE.Mesh(
    new THREE.SphereGeometry(0.34, 14, 10),
    mats.warmGlowMat
  );
  cupolaGlow.position.set(0, 0.42, -0.55);

  const centrifugePivot = new THREE.Group();
  const habRing = new THREE.Mesh(
    new THREE.TorusGeometry(1.88, 0.22, 16, 48),
    mats.whiteHullMat
  );
  const habWindowStrip = new THREE.Mesh(
    new THREE.TorusGeometry(1.88, 0.232, 8, 48),
    mats.warmGlowMat
  );
  habWindowStrip.scale.set(1, 1, 0.24);
  centrifugePivot.add(habRing, habWindowStrip);

  for (let s = 0; s < 4; s++) {
    const spoke = new THREE.Mesh(
      new THREE.CylinderGeometry(0.085, 0.085, 3.65, 10),
      mats.brushedAluminumMat
    );
    spoke.rotation.z = (s * Math.PI) / 4;
    centrifugePivot.add(spoke);
  }

  [-1, 1].forEach((side) => {
    const truss = new THREE.Mesh(
      new THREE.CylinderGeometry(0.045, 0.045, 3.4, 8),
      mats.brushedAluminumMat
    );
    truss.rotation.z = Math.PI / 2;
    truss.position.set(side * 2.4, 0, -1.45);

    const panelA = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.03, 0.85), mats.solarPanelMat);
    panelA.position.set(side * 2.2, 0, -1.45);
    const panelB = panelA.clone();
    panelB.position.set(side * 3.85, 0, -1.45);

    const radiator = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.03, 0.45), mats.goldKaptonMat);
    radiator.position.set(side * 1.15, 0.22, -1.45);
    stationGroup.add(truss, panelA, panelB, radiator);
  });

  const dockingRingGroup = new THREE.Group();
  dockingRingGroup.position.set(0, 0, 2.25);
  const outerRing = new THREE.Mesh(
    new THREE.TorusGeometry(0.92, 0.068, 14, 48),
    mats.brushedAluminumMat
  );
  const innerRing = new THREE.Mesh(
    new THREE.TorusGeometry(0.64, 0.036, 10, 36),
    mats.goldKaptonMat
  );
  innerRing.position.z = 0.08;
  for (let b = 0; b < 4; b++) {
    const ang = (b * Math.PI) / 2;
    const beacon = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 8), mats.cyanGlowMat);
    beacon.position.set(Math.cos(ang) * 0.92, Math.sin(ang) * 0.92, 0.06);
    dockingRingGroup.add(beacon);
  }
  dockingRingGroup.add(outerRing, innerRing);

  stationGroup.add(coreSpine, cupola, cupolaGlow, centrifugePivot, dockingRingGroup);
  group.add(stationGroup);

  return { group, exoplanetMesh, exoplanetRing, centrifugePivot, dockingRingGroup };
}
