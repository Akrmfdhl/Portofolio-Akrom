declare module 'three' {
  export const SRGBColorSpace: string;
  export const NoColorSpace: string;
  export const LinearSRGBColorSpace: string;
  export const ACESFilmicToneMapping: number;
  export const PCFShadowMap: number;
  export const AdditiveBlending: number;
  export const NormalBlending: number;
  export const DoubleSide: number;
  export const FrontSide: number;
  export const BackSide: number;
  export const RepeatWrapping: number;
  export const ClampToEdgeWrapping: number;
  export const LinearFilter: number;
  export const LinearMipmapLinearFilter: number;
  export const NearestFilter: number;
  export const HalfFloatType: number;
  export const RGBAFormat: number;
  export const UnsignedByteType: number;
  export const EquirectangularReflectionMapping: number;
  export const LoopRepeat: number;
  export const InterpolateSmooth: number;

  export const MathUtils: {
    clamp(value: number, min: number, max: number): number;
    lerp(x: number, y: number, t: number): number;
    damp(x: number, y: number, lambda: number, dt: number): number;
    degToRad(degrees: number): number;
    smoothstep(x: number, min: number, max: number): number;
  };

  export class Vector2 {
    x: number;
    y: number;
    constructor(x?: number, y?: number);
    set(x: number, y: number): this;
    copy(v: Vector2): this;
    clone(): Vector2;
  }

  export class Vector3 {
    x: number;
    y: number;
    z: number;
    constructor(x?: number, y?: number, z?: number);
    set(x: number, y: number, z: number): this;
    setScalar(scalar: number): this;
    copy(v: Vector3): this;
    clone(): Vector3;
    add(v: Vector3): this;
    sub(v: Vector3): this;
    subVectors(a: Vector3, b: Vector3): this;
    addScaledVector(v: Vector3, s: number): this;
    multiplyScalar(s: number): this;
    divideScalar(s: number): this;
    lerp(v: Vector3, alpha: number): this;
    lerpVectors(v1: Vector3, v2: Vector3, alpha: number): this;
    normalize(): this;
    distanceTo(v: Vector3): number;
    length(): number;
    dot(v: Vector3): number;
    cross(v: Vector3): this;
    toArray(): [number, number, number];
    fromBufferAttribute(attribute: BufferAttribute, index: number): this;
    project(camera: Camera): this;
    unproject(camera: Camera): this;
  }

  export class Euler {
    x: number;
    y: number;
    z: number;
    constructor(x?: number, y?: number, z?: number, order?: string);
    set(x: number, y: number, z: number, order?: string): this;
  }

  export class Quaternion {
    x: number;
    y: number;
    z: number;
    w: number;
    constructor(x?: number, y?: number, z?: number, w?: number);
    setFromAxisAngle(axis: Vector3, angle: number): this;
    setFromEuler(euler: Euler): this;
    setFromRotationMatrix(m: Matrix4): this;
    multiply(q: Quaternion): this;
    slerp(qb: Quaternion, t: number): this;
    copy(q: Quaternion): this;
  }

  export class Matrix4 {
    elements: number[];
    constructor();
    identity(): this;
    setPosition(x: number | Vector3, y?: number, z?: number): this;
    makeTranslation(x: number, y: number, z: number): this;
    makeRotationY(theta: number): this;
    makeRotationZ(theta: number): this;
    makeScale(x: number, y: number, z: number): this;
    lookAt(eye: Vector3, target: Vector3, up: Vector3): this;
    compose(position: Vector3, quaternion: Quaternion, scale: Vector3): this;
    copy(m: Matrix4): this;
  }

  export class Color {
    r: number;
    g: number;
    b: number;
    constructor(color?: number | string | Color);
    set(color: number | string | Color): this;
    setHex(hex: number): this;
    setHSL(h: number, s: number, l: number): this;
    copy(color: Color): this;
    clone(): Color;
    lerp(color: Color, alpha: number): this;
    multiplyScalar(s: number): this;
  }

  export class Layers {
    mask: number;
    constructor();
    set(channel: number): void;
    enable(channel: number): void;
    disable(channel: number): void;
    test(layers: Layers): boolean;
  }

  export class Sphere {
    center: Vector3;
    radius: number;
    constructor(center?: Vector3, radius?: number);
  }

  export class Box3 {
    min: Vector3;
    max: Vector3;
    constructor(min?: Vector3, max?: Vector3);
    setFromObject(object: Object3D): this;
    getCenter(target: Vector3): Vector3;
    getSize(target: Vector3): Vector3;
  }

  export class Object3D {
    id: number;
    name: string;
    type: string;
    parent: Object3D | null;
    children: Object3D[];
    position: Vector3;
    rotation: Euler;
    quaternion: Quaternion;
    scale: Vector3;
    matrix: Matrix4;
    matrixWorld: Matrix4;
    matrixAutoUpdate: boolean;
    visible: boolean;
    castShadow: boolean;
    receiveShadow: boolean;
    frustumCulled: boolean;
    renderOrder: number;
    layers: Layers;
    userData: Record<string, unknown>;
    isMesh?: boolean;
    geometry?: BufferGeometry;
    material?: Material | Material[];
    constructor();
    add(...object: Object3D[]): this;
    remove(...object: Object3D[]): this;
    lookAt(vector: Vector3 | number, y?: number, z?: number): void;
    updateMatrix(): void;
    updateMatrixWorld(force?: boolean): void;
    worldToLocal(vector: Vector3): Vector3;
    localToWorld(vector: Vector3): Vector3;
    getWorldPosition(target: Vector3): Vector3;
    getObjectByName(name: string): Object3D | undefined;
    traverse(callback: (object: Object3D) => void): void;
    clone(recursive?: boolean): this;
    dispose(): void;
  }

  export class Group extends Object3D {
    constructor();
  }

  export class Fog {
    color: Color;
    near: number;
    far: number;
    constructor(color: number | string | Color, near?: number, far?: number);
  }

  export class FogExp2 {
    color: Color;
    density: number;
    constructor(color: number | string | Color, density?: number);
  }

  export class Scene extends Object3D {
    background: Color | Texture | null;
    environment: Texture | null;
    environmentIntensity: number;
    fog: Fog | FogExp2 | null;
    constructor();
  }

  export class Camera extends Object3D {
    matrixWorldInverse: Matrix4;
    projectionMatrix: Matrix4;
    constructor();
  }

  export class PerspectiveCamera extends Camera {
    fov: number;
    aspect: number;
    near: number;
    far: number;
    constructor(fov?: number, aspect?: number, near?: number, far?: number);
    updateProjectionMatrix(): void;
    setViewOffset(
      fullWidth: number,
      fullHeight: number,
      x: number,
      y: number,
      width: number,
      height: number
    ): void;
    clearViewOffset(): void;
  }

  export class BufferAttribute {
    array: TypedArray;
    itemSize: number;
    count: number;
    needsUpdate: boolean;
    name: string;
    constructor(array: TypedArray, itemSize: number, normalized?: boolean);
    setXYZ(index: number, x: number, y: number, z: number): this;
    getX(index: number): number;
    getY(index: number): number;
    getZ(index: number): number;
  }

  export class Float32BufferAttribute extends BufferAttribute {
    constructor(array: Iterable<number> | ArrayBufferView, itemSize: number, normalized?: boolean);
  }

  export class InstancedBufferAttribute extends BufferAttribute {
    constructor(array: TypedArray, itemSize: number, normalized?: boolean, meshPerAttribute?: number);
  }

  type TypedArray = Float32Array | Uint16Array | Uint32Array | Uint8Array;

  export class BufferGeometry {
    attributes: Record<string, BufferAttribute>;
    morphAttributes: Record<string, BufferAttribute[]>;
    boundingBox: Box3 | null;
    boundingSphere: Sphere | null;
    constructor();
    setAttribute(name: string, attribute: BufferAttribute): this;
    getAttribute(name: string): BufferAttribute;
    hasAttribute(name: string): boolean;
    setIndex(index: BufferAttribute | number[] | null): this;
    setFromPoints(points: Vector3[]): this;
    setDrawRange(start: number, count: number): void;
    computeVertexNormals(): void;
    computeBoundingBox(): void;
    computeBoundingSphere(): void;
    center(): this;
    scale(x: number, y: number, z: number): this;
    rotateX(angle: number): this;
    rotateY(angle: number): this;
    rotateZ(angle: number): this;
    translate(x: number, y: number, z: number): this;
    applyMatrix4(matrix: Matrix4): this;
    toNonIndexed(): BufferGeometry;
    clone(): BufferGeometry;
    copy(source: BufferGeometry): this;
    dispose(): void;
  }

  export class BoxGeometry extends BufferGeometry {
    constructor(
      width?: number,
      height?: number,
      depth?: number,
      widthSegments?: number,
      heightSegments?: number,
      depthSegments?: number
    );
  }

  export class SphereGeometry extends BufferGeometry {
    constructor(
      radius?: number,
      widthSegments?: number,
      heightSegments?: number,
      phiStart?: number,
      phiLength?: number,
      thetaStart?: number,
      thetaLength?: number
    );
  }

  export class PlaneGeometry extends BufferGeometry {
    constructor(width?: number, height?: number, widthSegments?: number, heightSegments?: number);
  }

  export class CylinderGeometry extends BufferGeometry {
    constructor(
      radiusTop?: number,
      radiusBottom?: number,
      height?: number,
      radialSegments?: number,
      heightSegments?: number,
      openEnded?: boolean,
      thetaStart?: number,
      thetaLength?: number
    );
  }

  export class ConeGeometry extends BufferGeometry {
    constructor(
      radius?: number,
      height?: number,
      radialSegments?: number,
      heightSegments?: number,
      openEnded?: boolean,
      thetaStart?: number,
      thetaLength?: number
    );
  }

  export class TorusGeometry extends BufferGeometry {
    constructor(radius?: number, tube?: number, radialSegments?: number, tubularSegments?: number, arc?: number);
  }

  export class RingGeometry extends BufferGeometry {
    constructor(innerRadius?: number, outerRadius?: number, thetaSegments?: number, phiSegments?: number);
  }

  export class OctahedronGeometry extends BufferGeometry {
    constructor(radius?: number, detail?: number);
  }

  export class IcosahedronGeometry extends BufferGeometry {
    constructor(radius?: number, detail?: number);
  }

  export class DodecahedronGeometry extends BufferGeometry {
    constructor(radius?: number, detail?: number);
  }

  export class LatheGeometry extends BufferGeometry {
    constructor(points?: Vector2[], segments?: number, phiStart?: number, phiLength?: number);
  }

  export class Shape {
    constructor();
    moveTo(x: number, y: number): this;
    lineTo(x: number, y: number): this;
    closePath(): this;
  }

  export class ExtrudeGeometry extends BufferGeometry {
    constructor(
      shapes?: Shape | Shape[],
      options?: {
        steps?: number;
        depth?: number;
        bevelEnabled?: boolean;
        bevelThickness?: number;
        bevelSize?: number;
        bevelSegments?: number;
      }
    );
  }

  export class EdgesGeometry extends BufferGeometry {
    constructor(geometry: BufferGeometry, thresholdAngle?: number);
  }

  export class Curve<T extends Vector2 | Vector3> {
    getPoint(t: number, optionalTarget?: T): T;
    getPoints(divisions?: number): T[];
  }

  export class LineCurve3 extends Curve<Vector3> {
    constructor(v1: Vector3, v2: Vector3);
  }

  export class QuadraticBezierCurve3 extends Curve<Vector3> {
    constructor(v0: Vector3, v1: Vector3, v2: Vector3);
  }

  export class CatmullRomCurve3 extends Curve<Vector3> {
    constructor(points?: Vector3[], closed?: boolean, curveType?: string, tension?: number);
  }

  export class CurvePath<T extends Vector2 | Vector3> extends Curve<T> {
    constructor();
    add(curve: Curve<T>): void;
  }

  export class TubeGeometry extends BufferGeometry {
    constructor(
      path?: Curve<Vector3>,
      tubularSegments?: number,
      radius?: number,
      radialSegments?: number,
      closed?: boolean
    );
  }

  export class Texture {
    image: unknown;
    mapping: number;
    wrapS: number;
    wrapT: number;
    magFilter: number;
    minFilter: number;
    anisotropy: number;
    colorSpace: string;
    generateMipmaps: boolean;
    flipY: boolean;
    needsUpdate: boolean;
    repeat: Vector2;
    offset: Vector2;
    rotation: number;
    center: Vector2;
    isTexture: boolean;
    constructor(image?: unknown);
    clone(): this;
    dispose(): void;
  }

  export class DataTexture extends Texture {
    constructor(
      data?: BufferSource | null,
      width?: number,
      height?: number,
      format?: number,
      type?: number
    );
  }

  export class CanvasTexture extends Texture {
    constructor(canvas?: HTMLCanvasElement);
  }

  export class Material {
    name: string;
    transparent: boolean;
    opacity: number;
    depthWrite: boolean;
    depthTest: boolean;
    side: number;
    blending: number;
    toneMapped: boolean;
    wireframe: boolean;
    needsUpdate: boolean;
    userData: Record<string, unknown>;
    onBeforeCompile: (
      shader: { vertexShader: string; fragmentShader: string; uniforms: Record<string, IUniform> },
      renderer: WebGLRenderer
    ) => void;
    customProgramCacheKey(): string;
    constructor();
    dispose(): void;
  }

  export class MeshBasicMaterial extends Material {
    color: Color;
    map: Texture | null;
    alphaMap: Texture | null;
    constructor(parameters?: Record<string, unknown>);
  }

  export class MeshPhongMaterial extends Material {
    color: Color;
    map: Texture | null;
    normalMap: Texture | null;
    normalScale: Vector2;
    bumpMap: Texture | null;
    bumpScale: number;
    specularMap: Texture | null;
    specular: Color;
    shininess: number;
    emissive: Color;
    emissiveMap: Texture | null;
    emissiveIntensity: number;
    constructor(parameters?: Record<string, unknown>);
  }

  export class MeshStandardMaterial extends Material {
    color: Color;
    roughness: number;
    metalness: number;
    map: Texture | null;
    normalMap: Texture | null;
    normalScale: Vector2;
    bumpMap: Texture | null;
    bumpScale: number;
    roughnessMap: Texture | null;
    alphaMap: Texture | null;
    emissive: Color;
    emissiveMap: Texture | null;
    emissiveIntensity: number;
    envMapIntensity: number;
    flatShading: boolean;
    constructor(parameters?: Record<string, unknown>);
  }

  export class MeshPhysicalMaterial extends MeshStandardMaterial {
    clearcoat: number;
    clearcoatRoughness: number;
    reflectivity: number;
    ior: number;
    transmission: number;
    thickness: number;
    sheen: number;
    sheenRoughness: number;
    sheenColor: Color;
    constructor(parameters?: Record<string, unknown>);
  }

  export class LineBasicMaterial extends Material {
    color: Color;
    constructor(parameters?: Record<string, unknown>);
  }

  export class PointsMaterial extends Material {
    color: Color;
    size: number;
    sizeAttenuation: boolean;
    map: Texture | null;
    constructor(parameters?: Record<string, unknown>);
  }

  export interface IUniform<T = unknown> {
    value: T;
  }

  export class ShaderMaterial extends Material {
    uniforms: Record<string, IUniform>;
    vertexShader: string;
    fragmentShader: string;
    constructor(parameters?: {
      uniforms?: Record<string, IUniform>;
      vertexShader?: string;
      fragmentShader?: string;
      transparent?: boolean;
      depthWrite?: boolean;
      depthTest?: boolean;
      blending?: number;
      side?: number;
      wireframe?: boolean;
      toneMapped?: boolean;
    });
  }

  export class Mesh extends Object3D {
    geometry: BufferGeometry;
    material: Material | Material[];
    morphTargetInfluences?: number[];
    constructor(geometry?: BufferGeometry, material?: Material | Material[]);
    updateMorphTargets(): void;
  }

  export class InstancedMesh extends Mesh {
    count: number;
    instanceMatrix: InstancedBufferAttribute;
    instanceColor: InstancedBufferAttribute | null;
    constructor(geometry?: BufferGeometry, material?: Material | Material[], count?: number);
    setMatrixAt(index: number, matrix: Matrix4): void;
    getMatrixAt(index: number, matrix: Matrix4): void;
    setColorAt(index: number, color: Color): void;
    computeBoundingSphere(): void;
  }

  export class Line extends Object3D {
    geometry: BufferGeometry;
    material: Material;
    constructor(geometry?: BufferGeometry, material?: Material);
  }

  export class LineSegments extends Line {
    constructor(geometry?: BufferGeometry, material?: Material);
  }

  export class Points extends Object3D {
    geometry: BufferGeometry;
    material: Material;
    constructor(geometry?: BufferGeometry, material?: Material);
  }

  export class Light extends Object3D {
    color: Color;
    intensity: number;
    constructor(color?: number | string | Color, intensity?: number);
  }

  export class AmbientLight extends Light {
    constructor(color?: number | string | Color, intensity?: number);
  }

  export class HemisphereLight extends Light {
    groundColor: Color;
    constructor(skyColor?: number | string | Color, groundColor?: number | string | Color, intensity?: number);
  }

  export class DirectionalLight extends Light {
    target: Object3D;
    castShadow: boolean;
    shadow: {
      mapSize: Vector2;
      camera: {
        left: number;
        right: number;
        top: number;
        bottom: number;
        near: number;
        far: number;
        updateProjectionMatrix(): void;
      };
      bias: number;
      normalBias: number;
    };
    constructor(color?: number | string | Color, intensity?: number);
  }

  export class PointLight extends Light {
    distance: number;
    decay: number;
    constructor(color?: number | string | Color, intensity?: number, distance?: number, decay?: number);
  }

  export class SpotLight extends Light {
    target: Object3D;
    distance: number;
    angle: number;
    penumbra: number;
    decay: number;
    castShadow: boolean;
    constructor(
      color?: number | string | Color,
      intensity?: number,
      distance?: number,
      angle?: number,
      penumbra?: number,
      decay?: number
    );
  }

  export interface Intersection {
    distance: number;
    point: Vector3;
    object: Object3D;
    instanceId?: number;
    faceIndex?: number;
  }

  export class Ray {
    origin: Vector3;
    direction: Vector3;
    intersectSphere(sphere: Sphere, target: Vector3): Vector3 | null;
  }

  export class Raycaster {
    ray: Ray;
    near: number;
    far: number;
    layers: Layers;
    constructor();
    setFromCamera(coords: Vector2, camera: Camera): void;
    intersectObject(object: Object3D, recursive?: boolean): Intersection[];
    intersectObjects(objects: Object3D[], recursive?: boolean): Intersection[];
  }

  export class WebGLRenderTarget {
    texture: Texture;
    constructor(width?: number, height?: number, options?: Record<string, unknown>);
    setSize(width: number, height: number): void;
    dispose(): void;
  }

  export class PMREMGenerator {
    constructor(renderer: WebGLRenderer);
    fromScene(scene: Scene, sigma?: number, near?: number, far?: number): WebGLRenderTarget;
    dispose(): void;
  }

  export class WebGLRenderer {
    domElement: HTMLCanvasElement;
    toneMapping: number;
    toneMappingExposure: number;
    outputColorSpace: string;
    shadowMap: {
      enabled: boolean;
      type: number;
      autoUpdate: boolean;
      needsUpdate: boolean;
    };
    capabilities: {
      getMaxAnisotropy(): number;
    };
    info: {
      render: {
        calls: number;
        triangles: number;
        points: number;
        lines: number;
      };
      memory: {
        geometries: number;
        textures: number;
      };
      autoReset: boolean;
      reset(): void;
    };
    constructor(parameters?: Record<string, unknown>);
    setPixelRatio(value: number): void;
    getPixelRatio(): number;
    setSize(width: number, height: number, updateStyle?: boolean): void;
    setClearColor(color: Color | number | string, alpha?: number): void;
    render(scene: Scene, camera: Camera): void;
    setAnimationLoop(callback: ((time: number) => void) | null): void;
    compileAsync(scene: Scene, camera: Camera): Promise<Scene>;
    dispose(): void;
    forceContextLoss(): void;
  }

  export class Timer {
    constructor();
    connect(document: Document): void;
    disconnect(): void;
    update(timestamp?: number): this;
    getDelta(): number;
    getElapsed(): number;
    dispose(): void;
  }

  export class KeyframeTrack {
    name: string;
    times: Float32Array;
    values: Float32Array;
    constructor(name: string, times: number[], values: number[], interpolation?: number);
    setInterpolation(interpolation: number): this;
  }

  export class NumberKeyframeTrack extends KeyframeTrack {}
  export class VectorKeyframeTrack extends KeyframeTrack {}
  export class QuaternionKeyframeTrack extends KeyframeTrack {}

  export class AnimationClip {
    name: string;
    duration: number;
    tracks: KeyframeTrack[];
    constructor(name?: string, duration?: number, tracks?: KeyframeTrack[]);
  }

  export class AnimationAction {
    timeScale: number;
    paused: boolean;
    play(): this;
    stop(): this;
    reset(): this;
    setLoop(mode: number, repetitions: number): this;
  }

  export class AnimationMixer {
    constructor(root: Object3D);
    clipAction(clip: AnimationClip): AnimationAction;
    update(deltaTime: number): this;
    stopAllAction(): this;
    uncacheRoot(root: Object3D): void;
  }

  export class LoadingManager {
    onStart?: (url: string, loaded: number, total: number) => void;
    onProgress?: (url: string, loaded: number, total: number) => void;
    onLoad?: () => void;
    onError?: (url: string) => void;
    constructor();
  }

  export class TextureLoader {
    constructor(manager?: LoadingManager);
    load(
      url: string,
      onLoad?: (texture: Texture) => void,
      onProgress?: (event: ProgressEvent) => void,
      onError?: (err: unknown) => void
    ): Texture;
    loadAsync(url: string): Promise<Texture>;
  }
}

declare module 'three/addons/environments/RoomEnvironment.js' {
  import { Scene } from 'three';
  export class RoomEnvironment extends Scene {
    constructor();
    dispose(): void;
  }
}

declare module 'three/addons/controls/OrbitControls.js' {
  import { Camera, Vector3 } from 'three';
  export class OrbitControls {
    enabled: boolean;
    enableDamping: boolean;
    dampingFactor: number;
    enableZoom: boolean;
    enablePan: boolean;
    minDistance: number;
    maxDistance: number;
    target: Vector3;
    constructor(object: Camera, domElement?: HTMLElement);
    update(delta?: number): boolean;
    dispose(): void;
  }
}

declare module 'three/addons/postprocessing/EffectComposer.js' {
  import { WebGLRenderer, WebGLRenderTarget } from 'three';
  export class EffectComposer {
    passes: unknown[];
    constructor(renderer: WebGLRenderer, renderTarget?: WebGLRenderTarget);
    addPass(pass: unknown): void;
    setSize(width: number, height: number): void;
    setPixelRatio(pixelRatio: number): void;
    render(deltaTime?: number): void;
    dispose(): void;
  }
}

declare module 'three/addons/postprocessing/RenderPass.js' {
  import { Scene, Camera } from 'three';
  export class RenderPass {
    enabled: boolean;
    constructor(scene: Scene, camera: Camera);
  }
}

declare module 'three/addons/postprocessing/UnrealBloomPass.js' {
  import { Vector2 } from 'three';
  export class UnrealBloomPass {
    enabled: boolean;
    strength: number;
    radius: number;
    threshold: number;
    constructor(resolution: Vector2, strength: number, radius: number, threshold: number);
    dispose(): void;
  }
}

declare module 'three/addons/postprocessing/ShaderPass.js' {
  import { IUniform } from 'three';
  export class ShaderPass {
    enabled: boolean;
    uniforms: Record<string, IUniform>;
    constructor(shader: Record<string, unknown>, textureID?: string);
    dispose(): void;
  }
}

declare module 'three/addons/postprocessing/OutputPass.js' {
  export class OutputPass {
    enabled: boolean;
    constructor();
    dispose(): void;
  }
}

declare module 'three/addons/loaders/GLTFLoader.js' {
  import { Group, AnimationClip, LoadingManager } from 'three';
  export interface GLTF {
    scene: Group;
    animations: AnimationClip[];
  }
  export class GLTFLoader {
    constructor(manager?: LoadingManager);
    setDRACOLoader(dracoLoader: unknown): this;
    setKTX2Loader(ktx2Loader: unknown): this;
    setMeshoptDecoder(meshoptDecoder: unknown): this;
    loadAsync(url: string): Promise<GLTF>;
  }
}

declare module 'three/addons/loaders/DRACOLoader.js' {
  import { LoadingManager } from 'three';
  export class DRACOLoader {
    constructor(manager?: LoadingManager);
    setDecoderPath(path: string): this;
    dispose(): void;
  }
}

declare module 'three/addons/loaders/KTX2Loader.js' {
  import { WebGLRenderer, LoadingManager } from 'three';
  export class KTX2Loader {
    constructor(manager?: LoadingManager);
    detectSupport(renderer: WebGLRenderer): this;
    dispose(): void;
  }
}
