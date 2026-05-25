import * as THREE from 'three';

export function createHologramMaterial(baseTexture: THREE.Texture): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uTexture: { value: baseTexture },
    },
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      varying vec3 vNormal;
      void main() {
        vUv = uv;
        vNormal = normalize(normalMatrix * normal);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform float uTime;
      uniform sampler2D uTexture;
      varying vec2 vUv;
      varying vec3 vNormal;

      vec3 hsl2rgb(vec3 c) {
        vec3 rgb = clamp(abs(mod(c.x * 6.0 + vec3(0.0, 4.0, 2.0), 6.0) - 3.0) - 1.0, 0.0, 1.0);
        return c.z + c.y * (rgb - 0.5) * (1.0 - abs(2.0 * c.z - 1.0));
      }

      void main() {
        vec2 uv = vUv;
        float rainbow = sin(uv.x * 10.0 + uTime * 1.5) * 0.5 + 0.5;
        vec3 holoColor = hsl2rgb(vec3(rainbow, 0.8, 0.6));
        float fresnel = pow(1.0 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
        vec4 baseColor = texture2D(uTexture, uv);
        gl_FragColor = vec4(mix(baseColor.rgb, holoColor, fresnel * 0.4), baseColor.a);
      }
    `,
    transparent: true,
  });
}
