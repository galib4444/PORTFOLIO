"use client";

import { useRef, useMemo, useState, useEffect, Suspense } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
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
  uniform sampler2D uTexture;
  uniform vec2 uResolution;
  uniform float uImageAspect;
  uniform float uContainerAspect;

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

  // Contain UV - shows full image without cropping
  vec2 containUV(vec2 uv, float imageAspect, float containerAspect) {
    vec2 ratio = vec2(
      max(containerAspect / imageAspect, 1.0),
      max(imageAspect / containerAspect, 1.0)
    );
    vec2 newUv = vec2(
      uv.x * ratio.x + (1.0 - ratio.x) * 0.5,
      uv.y * ratio.y + (1.0 - ratio.y) * 0.5
    );
    return newUv;
  }

  void main() {
    vec2 uv = vUv;

    // Distance from mouse
    float dist = distance(uv, uMouse);

    // Ripple effect - multiple waves emanating from mouse
    float rippleStrength = uVelo * uHover;
    float ripple1 = sin(dist * 30.0 - uTime * 4.0) * 0.5 + 0.5;
    float ripple2 = sin(dist * 20.0 - uTime * 3.0) * 0.5 + 0.5;
    float ripple3 = sin(dist * 40.0 - uTime * 5.0) * 0.5 + 0.5;

    // Falloff from mouse position
    float falloff = smoothstep(0.6, 0.0, dist);

    // Combine ripples with noise for organic feel
    float noise1 = snoise(uv * 8.0 + uTime * 0.5);
    float noise2 = snoise(uv * 16.0 - uTime * 0.3);

    // Direction from mouse for distortion
    vec2 dir = normalize(uv - uMouse + 0.0001);

    // Calculate distortion amount
    float distortAmount = (ripple1 * 0.4 + ripple2 * 0.35 + ripple3 * 0.25) * falloff * rippleStrength;
    distortAmount += noise1 * 0.3 * falloff * rippleStrength;
    distortAmount += noise2 * 0.15 * falloff * rippleStrength;

    // Base distortion
    vec2 distortion = dir * distortAmount * 0.08;

    // Add wavy distortion perpendicular to direction
    vec2 perpDir = vec2(-dir.y, dir.x);
    float wave = sin(dist * 25.0 - uTime * 3.5 + noise1 * 2.0);
    distortion += perpDir * wave * falloff * rippleStrength * 0.03;

    // Chromatic aberration - RGB channel splitting
    float aberration = rippleStrength * falloff * 0.025;

    // Calculate UV for each color channel (using contain to show full image)
    vec2 uvBase = containUV(uv, uImageAspect, uContainerAspect);
    vec2 uvR = containUV(uv + distortion + dir * aberration, uImageAspect, uContainerAspect);
    vec2 uvG = containUV(uv + distortion, uImageAspect, uContainerAspect);
    vec2 uvB = containUV(uv + distortion - dir * aberration, uImageAspect, uContainerAspect);

    // Check if UV is outside image bounds
    bool outsideBounds = uvBase.x < 0.0 || uvBase.x > 1.0 || uvBase.y < 0.0 || uvBase.y > 1.0;

    // Sample texture for each channel
    vec4 texR = texture2D(uTexture, clamp(uvR, 0.0, 1.0));
    vec4 texG = texture2D(uTexture, clamp(uvG, 0.0, 1.0));
    vec4 texB = texture2D(uTexture, clamp(uvB, 0.0, 1.0));
    vec4 texBase = texture2D(uTexture, clamp(uvBase, 0.0, 1.0));

    // Background color (matching container)
    vec3 bgColor = vec3(0.91, 0.91, 0.91);

    // Detect ONLY pure black pixels (very strict threshold)
    float maxChannel = max(max(texBase.r, texBase.g), texBase.b);

    // Only pixels where ALL channels are nearly zero (pure black background)
    float isBlackBg = 1.0 - smoothstep(0.01, 0.02, maxChannel);

    // Keep original colors with chromatic aberration on distortion
    vec3 originalColor = texBase.rgb;
    vec3 distortedColor = vec3(texR.r, texG.g, texB.b);

    // Mix between original and distorted based on hover
    vec3 imageColor = mix(originalColor, distortedColor, uHover);

    // Only replace truly black background pixels
    vec3 color = mix(imageColor, bgColor, isBlackBg);

    // If outside bounds, show background
    if (outsideBounds) {
      color = bgColor;
    }

    gl_FragColor = vec4(color, 1.0);
  }
`;

interface FluidMeshProps {
  imageUrl: string;
  isHovering: boolean;
  mousePos: { x: number; y: number };
  velocity: number;
}

function FluidMesh({ imageUrl, isHovering, mousePos, velocity }: FluidMeshProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const { viewport, size } = useThree();
  const texture = useTexture(imageUrl);
  const currentMouse = useRef({ x: 0.5, y: 0.5 });
  const currentHover = useRef(0);
  const currentVelo = useRef(0);

  // Calculate image aspect ratio
  const textureImage = texture.image as HTMLImageElement | undefined;
  const imageAspect = textureImage ? textureImage.width / textureImage.height : 1;
  const containerAspect = size.width / size.height;

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(0.5, 0.5) },
      uVelo: { value: 0 },
      uHover: { value: 0 },
      uTexture: { value: texture },
      uResolution: { value: new THREE.Vector2(1, 1) },
      uImageAspect: { value: imageAspect },
      uContainerAspect: { value: containerAspect },
    }),
    [texture, imageAspect, containerAspect]
  );

  // Update texture when it changes
  useEffect(() => {
    if (meshRef.current) {
      const material = meshRef.current.material as THREE.ShaderMaterial;
      material.uniforms.uTexture.value = texture;
      material.uniforms.uImageAspect.value = imageAspect;
    }
  }, [texture, imageAspect]);

  useFrame((state) => {
    if (!meshRef.current) return;

    const material = meshRef.current.material as THREE.ShaderMaterial;
    material.uniforms.uTime.value = state.clock.elapsedTime;
    material.uniforms.uResolution.value.set(size.width, size.height);
    material.uniforms.uContainerAspect.value = size.width / size.height;

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
      <planeGeometry args={[1, 1, 32, 32]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
      />
    </mesh>
  );
}

interface LiquidPortraitProps {
  imageUrl?: string;
}

export function LiquidPortrait({ imageUrl = "/images/portrait.jpg" }: LiquidPortraitProps) {
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

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = 1 - (e.clientY - rect.top) / rect.height;

    const newPos = {
      x: Math.max(0, Math.min(1, x)),
      y: Math.max(0, Math.min(1, y))
    };

    // Calculate velocity
    const dx = newPos.x - lastMouseRef.current.x;
    const dy = newPos.y - lastMouseRef.current.y;
    const newVelocity = Math.min(Math.sqrt(dx * dx + dy * dy) * 20, 1);

    setMousePos(newPos);
    setVelocity(newVelocity);
    lastMouseRef.current = newPos;

    // Clear any pending decay and start new one
    if (velocityDecayRef.current) {
      cancelAnimationFrame(velocityDecayRef.current);
    }
  };

  const handleMouseEnter = () => {
    setIsHovering(true);
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
    // Decay velocity after mouse leaves
    const decay = () => {
      setVelocity(v => {
        const newV = v * 0.92;
        if (newV > 0.001) {
          velocityDecayRef.current = requestAnimationFrame(decay);
        }
        return newV;
      });
    };
    velocityDecayRef.current = requestAnimationFrame(decay);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!containerRef.current || e.touches.length === 0) return;

    const touch = e.touches[0];
    const rect = containerRef.current.getBoundingClientRect();
    const x = (touch.clientX - rect.left) / rect.width;
    const y = 1 - (touch.clientY - rect.top) / rect.height;

    setMousePos({
      x: Math.max(0, Math.min(1, x)),
      y: Math.max(0, Math.min(1, y))
    });
    setVelocity(0.7);
  };

  useEffect(() => {
    return () => {
      if (velocityDecayRef.current) {
        cancelAnimationFrame(velocityDecayRef.current);
      }
    };
  }, []);

  if (!isClient) {
    return (
      <div className="w-full h-full bg-[#e8e8e8] flex items-center justify-center">
        <div className="w-32 h-32 rounded-full bg-gray-400 opacity-30 animate-pulse" />
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="w-full h-full cursor-crosshair relative"
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onTouchStart={() => setIsHovering(true)}
      onTouchMove={handleTouchMove}
      onTouchEnd={() => setIsHovering(false)}
    >
      <Canvas
        camera={{ position: [0, 0, 1], fov: 75 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
      >
        <Suspense fallback={null}>
          <FluidMesh
            imageUrl={imageUrl}
            isHovering={isHovering}
            mousePos={mousePos}
            velocity={velocity}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
