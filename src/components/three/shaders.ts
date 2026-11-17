export const CLOUD_PUFF_VERTEX = `
  uniform float uTime;
  uniform vec3 uSunDir;
  attribute vec3 aCloudMeta;
  varying vec2 vAtlasUv;
  varying vec3 vViewPos;
  varying vec3 vSunViewDir;
  varying float vShade;
  varying float vFogDepth;

  void main() {
    float cell = aCloudMeta.x;
    float rot = aCloudMeta.y + sin(uTime * 0.08 + aCloudMeta.y) * 0.06;
    vShade = aCloudMeta.z;

    mat4 instModel = modelMatrix * instanceMatrix;
    vec4 worldCenter = instModel * vec4(0.0, 0.0, 0.0, 1.0);
    worldCenter.x += sin(uTime * 0.12 + aCloudMeta.y * 2.5) * 0.35;
    vec4 mvCenter = viewMatrix * worldCenter;

    float sx = length(instModel[0].xyz);
    float sy = length(instModel[1].xyz);

    float c = cos(rot);
    float s = sin(rot);
    vec2 rotated = vec2(
      position.x * c - position.y * s,
      position.x * s + position.y * c
    ) * vec2(sx, sy);

    vec4 mvPos = mvCenter + vec4(rotated, 0.0, 0.0);
    vViewPos = mvPos.xyz;
    vFogDepth = -mvPos.z;
    vSunViewDir = normalize((viewMatrix * vec4(uSunDir, 0.0)).xyz);

    vec2 tileOffset = vec2(mod(cell, 2.0), 1.0 - floor(cell * 0.5)) * 0.5;
    vAtlasUv = uv * 0.48 + 0.01 + tileOffset;

    gl_Position = projectionMatrix * mvPos;
  }
`;

export const CLOUD_PUFF_FRAGMENT = `
  uniform sampler2D uAtlasMap;
  uniform vec3 uSunColor;
  uniform vec3 uShadowColor;
  uniform vec3 uFogColor;
  uniform float uGlobalOpacity;
  varying vec2 vAtlasUv;
  varying vec3 vViewPos;
  varying vec3 vSunViewDir;
  varying float vShade;
  varying float vFogDepth;

  void main() {
    if (uGlobalOpacity <= 0.01) discard;
    vec4 texel = texture2D(uAtlasMap, vAtlasUv);
    float density = texel.a;
    if (density < 0.015) discard;

    vec2 microN = texel.rg * 2.0 - 1.0;
    float ao = texel.b;

    vec3 n = normalize(vec3(microN.x * 0.85, microN.y * 0.92 + (vShade - 0.5) * 0.65, 0.58));
    vec3 sunDir = normalize(vSunViewDir);
    vec3 viewDir = normalize(-vViewPos);

    float sunWrap = clamp((dot(n, sunDir) + 0.6) / 1.6, 0.0, 1.0);
    float heightLight = clamp(vShade * 0.72 + ao * 0.35, 0.0, 1.0);
    float lightMix = clamp(sunWrap * 0.62 + heightLight * 0.48, 0.0, 1.0);

    float cosTheta = dot(-viewDir, sunDir);
    float g = 0.52;
    float hg = (1.0 - g * g) / (4.0 * 3.14159 * pow(1.0 + g * g - 2.0 * g * cosTheta, 1.5));
    float silverLining = clamp(hg * (1.0 - density * 0.58) * 0.55, 0.0, 0.45);

    vec3 col = mix(uShadowColor, uSunColor, lightMix);
    col += uSunColor * silverLining;

    float fogFactor = smoothstep(34.0, 138.0, vFogDepth);
    col = mix(col, uFogColor, fogFactor * 0.78);

    float nearFade = smoothstep(1.2, 4.6, vFogDepth);
    float farFade = 1.0 - smoothstep(130.0, 175.0, vFogDepth);
    float finalAlpha = clamp(density * 0.82 * nearFade * farFade * uGlobalOpacity, 0.0, 0.92);

    gl_FragColor = vec4(col, finalAlpha);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

export const SKY_DOME_VERTEX = `
  varying vec3 vWorldDir;

  void main() {
    vec4 wp = modelMatrix * vec4(position, 1.0);
    vWorldDir = normalize(position);
    gl_Position = projectionMatrix * viewMatrix * wp;
  }
`;

export const SKY_DOME_FRAGMENT = `
  uniform vec3 uZenithColor;
  uniform vec3 uHorizonColor;
  uniform vec3 uGroundColor;
  uniform vec3 uSunDir;
  uniform float uSunGlow;
  varying vec3 vWorldDir;

  void main() {
    float h = clamp(vWorldDir.y, -1.0, 1.0);
    vec3 sky = mix(uHorizonColor, uZenithColor, pow(max(0.0, h), 0.58));
    sky = mix(uGroundColor, sky, smoothstep(-0.18, 0.04, h));

    float sunDot = max(0.0, dot(normalize(vWorldDir), normalize(uSunDir)));
    vec3 sunHalo = vec3(1.0, 0.88, 0.72) * pow(sunDot, 22.0) * 0.28 * uSunGlow;
    vec3 sunCore = vec3(1.0, 0.96, 0.88) * smoothstep(0.996, 0.9995, sunDot) * 0.65 * uSunGlow;

    gl_FragColor = vec4(sky + sunHalo + sunCore, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

export const PLANET_ATMOSPHERE_VERTEX = `
  varying vec3 vNormal;
  varying vec3 vViewPosition;
  varying vec3 vWorldNormal;

  void main() {
    vNormal = normalize(normalMatrix * normal);
    vWorldNormal = normalize(mat3(modelMatrix) * normal);
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    vViewPosition = -mvPosition.xyz;
    gl_Position = projectionMatrix * mvPosition;
  }
`;

export const PLANET_ATMOSPHERE_FRAGMENT = `
  uniform vec3 uColor;
  uniform vec3 uSunDir;
  uniform float uIntensity;
  varying vec3 vNormal;
  varying vec3 vViewPosition;
  varying vec3 vWorldNormal;

  void main() {
    vec3 viewDir = normalize(vViewPosition);
    float fresnel = pow(1.0 - max(0.0, abs(dot(vNormal, viewDir))), 3.4);
    float sunLight = smoothstep(-0.35, 0.85, dot(vWorldNormal, normalize(uSunDir)));
    float scatter = fresnel * (0.2 + 0.8 * sunLight) * uIntensity;
    gl_FragColor = vec4(uColor * (0.85 + 0.25 * sunLight), clamp(scatter, 0.0, 0.58));
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

export const EARTH_DAY_NIGHT_VERTEX = `
  varying vec2 vUv;
  varying vec3 vWorldNormal;
  varying vec3 vWorldPos;

  void main() {
    vUv = uv;
    vec4 wp = modelMatrix * vec4(position, 1.0);
    vWorldPos = wp.xyz;
    vWorldNormal = normalize(mat3(modelMatrix) * normal);
    gl_Position = projectionMatrix * viewMatrix * wp;
  }
`;

export const EARTH_DAY_NIGHT_FRAGMENT = `
  uniform sampler2D uDayMap;
  uniform sampler2D uNightMap;
  uniform sampler2D uNormalMap;
  uniform sampler2D uSpecularMap;
  uniform vec3 uSunDir;
  varying vec2 vUv;
  varying vec3 vWorldNormal;
  varying vec3 vWorldPos;

  void main() {
    vec3 sunDir = normalize(uSunDir);
    vec3 worldN = normalize(vWorldNormal);
    vec3 viewDir = normalize(cameraPosition - vWorldPos);

    vec3 tangentRef = abs(worldN.y) < 0.99 ? vec3(0.0, 1.0, 0.0) : vec3(1.0, 0.0, 0.0);
    vec3 tangent = normalize(cross(tangentRef, worldN));
    vec3 bitangent = normalize(cross(worldN, tangent));
    vec3 mapN = texture2D(uNormalMap, vUv).xyz * 2.0 - 1.0;
    vec3 perturbedN = normalize(worldN + tangent * (mapN.x * 0.42) + bitangent * (mapN.y * 0.42));

    float rawDot = dot(worldN, sunDir);
    float diffuse = max(0.0, dot(perturbedN, sunDir));
    float dayMask = smoothstep(-0.14, 0.22, rawDot);
    float nightMask = smoothstep(0.06, -0.22, rawDot);

    vec3 dayCol = texture2D(uDayMap, vUv).rgb;
    vec3 nightCol = texture2D(uNightMap, vUv).rgb;
    float specMask = texture2D(uSpecularMap, vUv).r;

    vec3 halfVec = normalize(sunDir + viewDir);
    float oceanGlint = pow(max(0.0, dot(perturbedN, halfVec)), 36.0) * specMask * dayMask * 0.55;

    float fresnel = pow(1.0 - max(0.0, dot(worldN, viewDir)), 3.2);
    vec3 airScatter = vec3(0.24, 0.54, 0.94) * fresnel * (0.14 + 0.78 * smoothstep(-0.22, 0.45, rawDot));
    float terminator = exp(-pow(rawDot * 8.5, 2.0));
    vec3 duskScatter = vec3(0.82, 0.32, 0.14) * terminator * 0.18 * (1.0 - specMask * 0.4);

    vec3 litDay = dayCol * (0.045 + diffuse * 1.16) + vec3(0.95, 0.98, 1.0) * oceanGlint;
    vec3 litNight = nightCol * vec3(1.15, 0.84, 0.52) * 1.65 * nightMask;
    vec3 finalCol = litDay * smoothstep(-0.22, 0.12, rawDot) + litNight + airScatter + duskScatter;

    gl_FragColor = vec4(finalCol, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

export const MILKY_WAY_SKY_VERTEX = `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mv;
  }
`;

export const MILKY_WAY_SKY_FRAGMENT = `
  uniform sampler2D uSkyMap;
  uniform float uOpacity;
  varying vec2 vUv;

  void main() {
    if (uOpacity <= 0.005) discard;
    vec3 starSample = texture2D(uSkyMap, vUv).rgb;
    vec3 enhanced = pow(max(starSample, vec3(0.0)), vec3(0.76)) * 1.72;
    gl_FragColor = vec4(enhanced, clamp(uOpacity, 0.0, 1.0));
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

export const HEADLIGHT_BEAM_VERTEX = `
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vViewDir;

  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vViewDir = normalize(-mv.xyz);
    gl_Position = projectionMatrix * mv;
  }
`;

export const HEADLIGHT_BEAM_FRAGMENT = `
  uniform vec3 uColor;
  uniform float uOpacity;
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vViewDir;

  void main() {
    float axial = clamp(1.0 - vUv.y, 0.0, 1.0);
    float lengthFade = pow(1.0 - axial, 1.85) * smoothstep(0.0, 0.14, axial);
    float fresnel = pow(abs(dot(normalize(vNormal), normalize(vViewDir))), 1.75);
    float alpha = lengthFade * fresnel * uOpacity;
    gl_FragColor = vec4(uColor, clamp(alpha, 0.0, 0.28));
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

export const ROCKET_PLUME_VERTEX = `
  uniform float uTime;
  uniform float uThrottle;
  varying vec2 vUv;
  varying vec3 vNormal;

  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    vec3 pos = position;
    float tailFactor = clamp(1.0 - uv.y, 0.0, 1.0);
    float flutter = sin(uTime * 44.0 + uv.y * 20.0 + position.x * 10.0) * 0.012 * tailFactor * uThrottle;
    pos.x += flutter;
    pos.z += cos(uTime * 38.0 + uv.y * 16.0) * 0.012 * tailFactor * uThrottle;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
  }
`;

export const ROCKET_PLUME_FRAGMENT = `
  uniform float uTime;
  uniform float uThrottle;
  uniform float uBoost;
  uniform vec3 uHotColor;
  uniform vec3 uCoreColor;
  uniform vec3 uCyanColor;
  varying vec2 vUv;
  varying vec3 vNormal;

  void main() {
    float axial = clamp(vUv.y, 0.0, 1.0);
    float diamonds = pow(max(0.0, sin(axial * 26.0 - uTime * 36.0)), 4.0) * (0.45 + 0.55 * uThrottle);
    float core = smoothstep(0.0, 0.86, axial);
    float tipFade = smoothstep(0.0, 0.28, axial) * (1.0 - smoothstep(0.85, 1.0, axial));
    float rim = pow(abs(vNormal.z) * 0.78 + 0.22, 1.3);

    vec3 baseFlame = mix(uHotColor * 0.95, uCoreColor * 1.15, core * 0.72 + diamonds * 0.42);
    vec3 methaloxFlame = mix(baseFlame, uCyanColor * 1.05, clamp(uBoost * 0.55 + (1.0 - axial) * 0.28, 0.0, 1.0));
    float alpha = clamp((core * 0.75 + diamonds * 0.48) * tipFade * rim * (0.58 + uThrottle * 0.34), 0.0, 0.78);

    gl_FragColor = vec4(methaloxFlame, alpha);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

export const STARFIELD_WARP_VERTEX = `
  uniform float uTime;
  uniform float uSize;
  uniform float uBoost;
  attribute float aSeed;
  attribute float aTemp;
  varying float vSeed;
  varying float vTemp;
  varying float vFade;

  void main() {
    vSeed = aSeed;
    vTemp = aTemp;
    vec3 p = position;
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    float dist = -mv.z;
    vFade = (1.0 - smoothstep(42.0, 130.0, dist)) * smoothstep(1.2, 4.5, dist);
    float twinkle = 0.84 + 0.16 * sin(uTime * (1.5 + aSeed * 3.2) + aSeed * 25.0);
    gl_PointSize = uSize * twinkle * (0.55 + aSeed * 0.95 + uBoost * 0.3) * (24.0 / max(1.0, dist));
    gl_Position = projectionMatrix * mv;
  }
`;

export const STARFIELD_WARP_FRAGMENT = `
  uniform float uOpacity;
  uniform vec3 uChalk;
  uniform vec3 uHot;
  uniform vec3 uCyan;
  varying float vSeed;
  varying float vTemp;
  varying float vFade;

  void main() {
    if (uOpacity <= 0.01) discard;
    float d = length(gl_PointCoord - 0.5);
    float alpha = smoothstep(0.5, 0.06, d);
    vec3 starTint = mix(vec3(1.0, 0.92, 0.82), vec3(0.82, 0.92, 1.0), vTemp);
    vec3 col = mix(uChalk * starTint, vTemp > 0.55 ? uCyan : uHot, step(0.88, vSeed) * 0.35);
    gl_FragColor = vec4(col * 0.9, alpha * vFade * uOpacity * 0.78);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

export const UNREAL_POST_SHADER = {
  uniforms: {
    tDiffuse: { value: null },
    uTime: { value: 0 },
    uAberration: { value: 0.00018 },
    uPulse: { value: 0 },
    uVignette: { value: 0.16 },
    uGrain: { value: 0.005 },
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform float uTime;
    uniform float uAberration;
    uniform float uPulse;
    uniform float uVignette;
    uniform float uGrain;
    varying vec2 vUv;

    void main() {
      vec2 centered = vUv - 0.5;
      float radial = length(centered);
      float ring = exp(-pow((radial - (1.0 - uPulse) * 0.65) * 14.0, 2.0)) * uPulse;
      vec2 offset = centered * (uAberration + ring * 0.0025);

      float r = texture2D(tDiffuse, vUv + offset).r;
      float g = texture2D(tDiffuse, vUv).g;
      float b = texture2D(tDiffuse, vUv - offset).b;
      vec3 col = vec3(r, g, b);

      col += vec3(0.95, 0.48, 0.14) * ring * 0.08;

      float vig = smoothstep(0.98, 0.32, radial * (1.0 + uVignette * 0.25));
      col *= mix(1.0 - uVignette * 0.28, 1.0, vig);

      float noise = fract(sin(dot(vUv * 512.0 + vec2(uTime * 37.0, uTime * 19.0), vec2(12.9898, 78.233))) * 43758.5453);
      col += (noise - 0.5) * uGrain;

      gl_FragColor = vec4(max(col, vec3(0.0)), 1.0);
    }
  `,
};
