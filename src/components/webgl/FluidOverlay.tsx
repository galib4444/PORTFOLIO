"use client";

import { useRef, useMemo, useState, useEffect, Suspense } from "react";
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
  uniform float uHover;
  uniform vec2 uResolution;

  varying vec2 vUv;

  // Simplex noise
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

  float snoise(vec2 v) {
    const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                        -0.577350269189626, 0.024390243902439);
    vec2 i  = floor(v + dot(v, C.yy));
    vec2 x0 = v - i + dot(i, C.xx);
    vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod289(i);
    vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
    vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
    m = m*m; m = m*m;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
    vec3 g;
    g.x = a0.x * x0.x + h.x * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }

  void main() {
    vec2 uv = vUv;

    // Distance from mouse
    float dist = distance(uv, uMouse);
    float falloff = smoothstep(0.6, 0.0, dist);

    // Effect strength
    float strength = uVelo * uHover * falloff;

    // Horizontal streak noise - creates the glitch/smear lines
    float streakNoise1 = snoise(vec2(uv.y * 50.0, uTime * 2.0));
    float streakNoise2 = snoise(vec2(uv.y * 80.0 + 100.0, uTime * 3.0));
    float streakNoise3 = snoise(vec2(uv.y * 30.0 + 200.0, uTime * 1.5));

    // Create horizontal streaks at random y positions
    float streakMask1 = smoothstep(0.7, 1.0, abs(streakNoise1)) * strength;
    float streakMask2 = smoothstep(0.6, 1.0, abs(streakNoise2)) * strength;
    float streakMask3 = smoothstep(0.75, 1.0, abs(streakNoise3)) * strength;

    // Combine streaks
    float streakIntensity = streakMask1 + streakMask2 * 0.7 + streakMask3 * 0.5;
    streakIntensity = min(streakIntensity, 1.0);

    // Horizontal stretch amount varies per streak
    float stretchAmount = streakIntensity * 0.3;

    // Direction of stretch (mostly horizontal with slight variation)
    float angle = snoise(vec2(uv.y * 20.0, uTime)) * 0.3;

    // RGB channel offsets for chromatic aberration
    vec2 stretchDir = vec2(cos(angle), sin(angle) * 0.2);

    float rOffset = stretchAmount * (1.0 + streakNoise1 * 0.5);
    float gOffset = stretchAmount * 0.5;
    float bOffset = stretchAmount * (1.0 + streakNoise2 * 0.5);

    // Create the RGB separated streaks
    float r = 0.0, g = 0.0, b = 0.0;

    // Red channel - stretched one direction
    if (streakIntensity > 0.01) {
      float rStreak = smoothstep(0.0, 0.1, streakIntensity);
      r = rStreak * 0.8 * (0.5 + 0.5 * sin(uv.x * 100.0 + uTime * 5.0 + rOffset * 50.0));
    }

    // Green channel - less stretched
    if (streakIntensity > 0.02) {
      float gStreak = smoothstep(0.1, 0.2, streakIntensity);
      g = gStreak * 0.4 * (0.5 + 0.5 * sin(uv.x * 80.0 + uTime * 4.0));
    }

    // Blue channel - stretched opposite direction
    if (streakIntensity > 0.01) {
      float bStreak = smoothstep(0.0, 0.15, streakIntensity);
      b = bStreak * 0.9 * (0.5 + 0.5 * sin(uv.x * 120.0 + uTime * 6.0 - bOffset * 50.0));
    }

    // Add iridescent/rainbow effect to streaks
    float rainbow = sin(uv.x * 30.0 + uTime * 2.0 + streakNoise1 * 5.0);
    r += streakIntensity * 0.3 * (0.5 + 0.5 * sin(rainbow));
    g += streakIntensity * 0.2 * (0.5 + 0.5 * sin(rainbow + 2.094));
    b += streakIntensity * 0.4 * (0.5 + 0.5 * sin(rainbow + 4.188));

    // Add white/bright highlights in streaks
    float highlight = pow(streakIntensity, 2.0) * 0.5;
    r += highlight;
    g += highlight;
    b += highlight;

    // Alpha based on streak visibility
    float alpha = streakIntensity * 0.9;

    // Add subtle glow around mouse
    float glow = falloff * uVelo * uHover * 0.1;
    alpha += glow;

    gl_FragColor = vec4(r, g, b, alpha);
  }
`;

function FluidMesh({ isHovering, mousePos, velocity }: {
  isHovering: boolean;
  mousePos: { x: number; y: number };
  velocity: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const { viewport, size } = useThree();
  const currentMouse = useRef({ x: 0.5, y: 0.5 });
  const currentHover = useRef(0);
  const currentVelo = useRef(0);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(0.5, 0.5) },
      uVelo: { value: 0 },
      uHover: { value: 0 },
      uResolution: { value: new THREE.Vector2(1, 1) },
    }),
    []
  );

  useFrame((state) => {
    if (!meshRef.current) return;

    const material = meshRef.current.material as THREE.ShaderMaterial;
    material.uniforms.uTime.value = state.clock.elapsedTime;
    material.uniforms.uResolution.value.set(size.width, size.height);

    // Smooth mouse interpolation
    currentMouse.current.x += (mousePos.x - currentMouse.current.x) * 0.1;
    currentMouse.current.y += (mousePos.y - currentMouse.current.y) * 0.1;
    material.uniforms.uMouse.value.set(currentMouse.current.x, currentMouse.current.y);

    // Smooth hover transition
    const targetHover = isHovering ? 1 : 0;
    currentHover.current += (targetHover - currentHover.current) * 0.08;
    material.uniforms.uHover.value = currentHover.current;

    // Smooth velocity
    currentVelo.current += (velocity - currentVelo.current) * 0.15;
    material.uniforms.uVelo.value = currentVelo.current;
  });

  return (
    <mesh ref={meshRef} scale={[viewport.width, viewport.height, 1]}>
      <planeGeometry args={[1, 1, 1, 1]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent={true}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}

export function FluidOverlay() {
  const [isClient, setIsClient] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });
  const [velocity, setVelocity] = useState(0);
  const lastMouseRef = useRef({ x: 0.5, y: 0.5 });
  const velocityDecayRef = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = 1 - (e.clientY - rect.top) / rect.height;

      const newPos = {
        x: Math.max(0, Math.min(1, x)),
        y: Math.max(0, Math.min(1, y))
      };

      // Check if mouse is within bounds
      const isInBounds = x >= 0 && x <= 1 && y >= 0 && y <= 1;
      setIsHovering(isInBounds);

      // Calculate velocity
      const dx = newPos.x - lastMouseRef.current.x;
      const dy = newPos.y - lastMouseRef.current.y;
      const newVelocity = Math.min(Math.sqrt(dx * dx + dy * dy) * 25, 1);

      setMousePos(newPos);
      setVelocity(newVelocity);
      lastMouseRef.current = newPos;

      if (velocityDecayRef.current) {
        cancelAnimationFrame(velocityDecayRef.current);
      }
    };

    const handleMouseLeave = () => {
      setIsHovering(false);
      const decay = () => {
        setVelocity(v => {
          const newV = v * 0.9;
          if (newV > 0.001) {
            velocityDecayRef.current = requestAnimationFrame(decay);
          }
          return newV;
        });
      };
      velocityDecayRef.current = requestAnimationFrame(decay);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      if (velocityDecayRef.current) {
        cancelAnimationFrame(velocityDecayRef.current);
      }
    };
  }, []);

  if (!isClient) {
    return null;
  }

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 z-20 pointer-events-none"
    >
      <Canvas
        camera={{ position: [0, 0, 1], fov: 75 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent", pointerEvents: "none" }}
      >
        <FluidMesh
          isHovering={isHovering}
          mousePos={mousePos}
          velocity={velocity}
        />
      </Canvas>
    </div>
  );
}
