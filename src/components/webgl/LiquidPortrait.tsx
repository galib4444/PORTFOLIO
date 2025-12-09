"use client";

import { useRef, useMemo, useState, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = `
  uniform float uTime;
  uniform vec2 uMouse;
  uniform float uVelo;
  uniform float uIntensity;
  uniform vec3 uColor1;
  uniform vec3 uColor2;

  varying vec2 vUv;

  // Noise function
  float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
  }

  float noise(vec2 st) {
    vec2 i = floor(st);
    vec2 f = fract(st);
    float a = random(i);
    float b = random(i + vec2(1.0, 0.0));
    float c = random(i + vec2(0.0, 1.0));
    float d = random(i + vec2(1.0, 1.0));
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
  }

  void main() {
    vec2 uv = vUv;

    // Distance from mouse
    float dist = distance(uv, uMouse);
    float decay = smoothstep(0.5, 0.0, dist);

    // Base distortion (sine wave ripple)
    vec2 distortion = vec2(
      sin(uv.y * 20.0 + uTime * 0.5) * 0.02,
      cos(uv.x * 20.0 + uTime * 0.5) * 0.02
    ) * decay * uVelo * uIntensity;

    // Apply distortion to UV
    vec2 distortedUv = uv + distortion;

    // RGB Chromatic Aberration
    float aberration = uVelo * 0.03 * uIntensity;

    // Create gradient pattern
    float pattern = noise(distortedUv * 5.0 + uTime * 0.1);
    pattern += noise(distortedUv * 10.0 - uTime * 0.05) * 0.5;
    pattern = pattern / 1.5;

    // Mix colors based on pattern and interaction
    vec3 color1 = uColor1; // Gray base
    vec3 color2 = uColor2; // Light highlight

    // Add RGB split on interaction
    float r = pattern + aberration * decay;
    float g = pattern;
    float b = pattern - aberration * decay;

    // Base grayscale
    vec3 grayscale = vec3(pattern * 0.8 + 0.1);

    // Colorize based on velocity
    vec3 colorized = vec3(r, g, b) * 0.3 + grayscale * 0.7;

    // Add vignette
    float vignette = 1.0 - smoothstep(0.3, 0.8, length(uv - 0.5));
    colorized *= vignette * 0.3 + 0.7;

    // Mix between grayscale and colorized based on velocity
    vec3 finalColor = mix(grayscale, colorized, uVelo * 2.0);

    // Add silhouette shape
    float silhouette = smoothstep(0.3, 0.7, pattern);
    silhouette *= smoothstep(0.1, 0.4, uv.x) * smoothstep(0.1, 0.4, 1.0 - uv.x);
    silhouette *= smoothstep(0.0, 0.3, uv.y) * smoothstep(0.0, 0.2, 1.0 - uv.y);

    finalColor = mix(vec3(0.95), finalColor, silhouette);

    gl_FragColor = vec4(finalColor, 1.0);
  }
`;

function LiquidMesh() {
  const meshRef = useRef<THREE.Mesh>(null);
  const { viewport } = useThree();
  const [mouseVelocity, setMouseVelocity] = useState(0);
  const lastMouse = useRef({ x: 0.5, y: 0.5 });
  const targetMouse = useRef({ x: 0.5, y: 0.5 });
  const currentMouse = useRef({ x: 0.5, y: 0.5 });

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(0.5, 0.5) },
      uVelo: { value: 0 },
      uIntensity: { value: 1.0 },
      uColor1: { value: new THREE.Color("#4a4a4a") },
      uColor2: { value: new THREE.Color("#e0e0e0") },
    }),
    []
  );

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const rect = document.getElementById("liquid-canvas")?.getBoundingClientRect();
      if (!rect) return;

      const x = (e.clientX - rect.left) / rect.width;
      const y = 1 - (e.clientY - rect.top) / rect.height;

      targetMouse.current = { x: Math.max(0, Math.min(1, x)), y: Math.max(0, Math.min(1, y)) };

      // Calculate velocity
      const dx = targetMouse.current.x - lastMouse.current.x;
      const dy = targetMouse.current.y - lastMouse.current.y;
      const velocity = Math.sqrt(dx * dx + dy * dy) * 10;
      setMouseVelocity(Math.min(velocity, 1));

      lastMouse.current = { ...targetMouse.current };
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const touch = e.touches[0];
        const rect = document.getElementById("liquid-canvas")?.getBoundingClientRect();
        if (!rect) return;

        const x = (touch.clientX - rect.left) / rect.width;
        const y = 1 - (touch.clientY - rect.top) / rect.height;

        targetMouse.current = { x: Math.max(0, Math.min(1, x)), y: Math.max(0, Math.min(1, y)) };
        setMouseVelocity(0.5);
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("touchmove", handleTouchMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("touchmove", handleTouchMove);
    };
  }, []);

  useFrame((state) => {
    if (!meshRef.current) return;

    const material = meshRef.current.material as THREE.ShaderMaterial;
    material.uniforms.uTime.value = state.clock.elapsedTime;

    // Smooth mouse interpolation
    currentMouse.current.x += (targetMouse.current.x - currentMouse.current.x) * 0.1;
    currentMouse.current.y += (targetMouse.current.y - currentMouse.current.y) * 0.1;

    material.uniforms.uMouse.value.set(currentMouse.current.x, currentMouse.current.y);

    // Decay velocity
    const currentVelo = material.uniforms.uVelo.value;
    const targetVelo = mouseVelocity;
    material.uniforms.uVelo.value = currentVelo + (targetVelo - currentVelo) * 0.1;

    // Reset velocity over time
    setMouseVelocity((v) => v * 0.95);
  });

  return (
    <mesh ref={meshRef} scale={[viewport.width * 0.8, viewport.height * 0.9, 1]}>
      <planeGeometry args={[1, 1, 32, 32]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
      />
    </mesh>
  );
}

export function LiquidPortrait() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    // Server-side placeholder
    return (
      <div className="w-full h-full bg-gradient-to-br from-[var(--bg-tertiary)] to-[var(--bg-secondary)] rounded-2xl flex items-center justify-center">
        <div className="w-32 h-32 rounded-full bg-[var(--text-muted)] opacity-30" />
      </div>
    );
  }

  return (
    <div id="liquid-canvas" className="w-full h-full rounded-2xl overflow-hidden cursor-crosshair">
      <Canvas
        camera={{ position: [0, 0, 1], fov: 75 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
      >
        <LiquidMesh />
      </Canvas>
    </div>
  );
}
