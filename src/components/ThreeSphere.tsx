import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

interface ThreeSphereProps {
  size?: number;
  position?: [number, number, number];
  className?: string;
  colors?: string[];
}

const ThreeSphere: React.FC<ThreeSphereProps> = ({ 
  size = 5, 
  position = [0, 0, -10],
  className = "",
  colors = ["#00c2a8", "#7b68ee", "#ff7e5f", "#feb47b"]
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sphereRef = useRef<THREE.Mesh | null>(null);
  const frameIdRef = useRef<number>(0);

  useEffect(() => {
    if (!containerRef.current) return;

    // Initialize scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Add stars to the background
    const starGeometry = new THREE.BufferGeometry();
    const starMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.1,
      transparent: true,
      opacity: 0.5
    });

    const starVertices = [];
    for (let i = 0; i < 300; i++) {
      const x = (Math.random() - 0.5) * 100;
      const y = (Math.random() - 0.5) * 100;
      const z = (Math.random() - 0.5) * 100;
      starVertices.push(x, y, z);
    }

    starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
    const stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars);

    // Initialize camera
    const camera = new THREE.PerspectiveCamera(
      75, 
      containerRef.current.clientWidth / containerRef.current.clientHeight, 
      0.1, 
      1000
    );
    camera.position.set(0, 0, 12);
    cameraRef.current = camera;

    // Initialize renderer with high precision
    const renderer = new THREE.WebGLRenderer({ 
      alpha: true,
      antialias: true,
      precision: 'highp'
    });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Limit pixel ratio for performance
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Create color uniforms for the shader
    const colorUniforms = {};
    colors.forEach((color, index) => {
      colorUniforms[`color${index}`] = { value: new THREE.Color(color) };
    });

    // Create sphere with advanced shader material
    const geometry = new THREE.SphereGeometry(size, 128, 128); // Higher resolution for smoother surface
    const material = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0.0 },
        resolution: { value: new THREE.Vector2(
          containerRef.current.clientWidth * renderer.getPixelRatio(),
          containerRef.current.clientHeight * renderer.getPixelRatio()
        )},
        colorCount: { value: colors.length },
        ...colorUniforms
      },
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vPosition;
        varying vec2 vUv;
        varying vec3 vViewPosition;
        
        void main() {
          vNormal = normalize(normalMatrix * normal);
          vPosition = position;
          vUv = uv;
          
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          vViewPosition = -mvPosition.xyz;
          
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        uniform float time;
        uniform vec2 resolution;
        uniform int colorCount;
        
        // Define color uniforms dynamically
        uniform vec3 color0;
        uniform vec3 color1;
        uniform vec3 color2;
        uniform vec3 color3;
        
        varying vec3 vNormal;
        varying vec3 vPosition;
        varying vec2 vUv;
        varying vec3 vViewPosition;
        
        // Simplex noise functions
        vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
        vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
        vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }
        
        float snoise(vec2 v) {
          const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                             -0.577350269189626, 0.024390243902439);
          vec2 i  = floor(v + dot(v, C.yy));
          vec2 x0 = v -   i + dot(i, C.xx);
          vec2 i1;
          i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
          vec4 x12 = x0.xyxy + C.xxzz;
          x12.xy -= i1;
          i = mod289(i);
          vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0))
                + i.x + vec3(0.0, i1.x, 1.0));
          vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy),
                                dot(x12.zw, x12.zw)), 0.0);
          m = m*m;
          m = m*m;
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
        
        // FBM (Fractal Brownian Motion) for more organic patterns
        float fbm(vec2 p, int octaves) {
          float value = 0.0;
          float amplitude = 0.5;
          float frequency = 1.0;
          
          for (int i = 0; i < 8; i++) {
            if (i >= octaves) break;
            value += amplitude * snoise(p * frequency);
            amplitude *= 0.5;
            frequency *= 2.0;
          }
          
          return value;
        }
        
        // Smooth interpolation function
        float smootherstep(float edge0, float edge1, float x) {
          x = clamp((x - edge0) / (edge1 - edge0), 0.0, 1.0);
          return x * x * x * (x * (x * 6.0 - 15.0) + 10.0);
        }
        
        // Helper function to get color by index
        vec3 getColorByIndex(int index) {
          if (index == 0) return color0;
          if (index == 1) return color1;
          if (index == 2) return color2;
          return color3;
        }
        
        void main() {
          // Create dynamic flow using noise and time
          float flowSpeed = 0.15;
          vec2 flowUv = vUv + vec2(time * flowSpeed * 0.1, time * flowSpeed * 0.08);
          
          // Create complex noise pattern for organic movement
          float noise1 = fbm(flowUv * 2.0, 4) * 0.5 + 0.5;
          float noise2 = fbm(flowUv * 4.0 + vec2(time * 0.05, 0.0), 3) * 0.5 + 0.5;
          float noise3 = fbm(flowUv * 1.0 - vec2(0.0, time * 0.03), 2) * 0.5 + 0.5;
          
          // Combine noise patterns for more organic flow
          float combinedNoise = mix(noise1, noise2, noise3);
          
          // Use view-dependent factor for edge softening
          float viewFactor = dot(normalize(vViewPosition), vNormal);
          float edgeSoftness = smootherstep(0.0, 0.4, abs(viewFactor));
          
          // Create soft edges that blend with background
          float edgeFade = smootherstep(0.0, 0.7, length(vUv - vec2(0.5)) * 1.8);
          float alpha = mix(0.95, 0.0, edgeFade);
          
          // Add fresnel effect for edge glow
          float fresnel = pow(1.0 - abs(viewFactor), 4.0);
          
          // Dynamic color selection based on noise
          float colorPosition = combinedNoise * float(colorCount - 1);
          int colorIndex1 = int(floor(colorPosition));
          int colorIndex2 = int(min(float(colorIndex1 + 1), float(colorCount - 1)));
          
          // Smooth interpolation between colors
          float colorMix = fract(colorPosition);
          colorMix = smootherstep(0.0, 1.0, colorMix); // Smoother transition
          
          // Create base color from palette
          vec3 baseColor = mix(getColorByIndex(colorIndex1), getColorByIndex(colorIndex2), colorMix);
          
          // Add subtle variations and depth
          float pulseSpeed = 0.2;
          float pulseStrength = 0.15;
          float pulse = sin(time * pulseSpeed) * 0.5 + 0.5;
          
          // Add depth with darker core and brighter edges
          float depthFactor = smootherstep(0.2, 0.8, length(vUv - vec2(0.5)));
          baseColor = mix(baseColor * 0.7, baseColor * 1.3, depthFactor);
          
          // Add pulsing glow at edges
          vec3 glowColor = mix(color0, color3, sin(time * 0.1) * 0.5 + 0.5);
          baseColor = mix(baseColor, glowColor, fresnel * pulse * pulseStrength);
          
          // Apply soft blur at edges
          float blurFactor = smootherstep(0.5, 1.0, edgeFade);
          baseColor = mix(baseColor, mix(baseColor, vec3(0.0), 0.7), blurFactor);
          
          // Final color with soft transparency for edges
          gl_FragColor = vec4(baseColor, alpha * (1.0 - blurFactor * 0.8));
        }
      `,
      transparent: true,
      depthWrite: false, // Important for proper transparency
      blending: THREE.AdditiveBlending, // Creates a glowing effect
    });

    const sphere = new THREE.Mesh(geometry, material);
    sphere.position.set(position[0], position[1], position[2]);
    scene.add(sphere);
    sphereRef.current = sphere;

    // Add ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
    scene.add(ambientLight);

    // Add point lights for highlights
    const pointLight1 = new THREE.PointLight(0x00c2a8, 1.5, 100);
    pointLight1.position.set(10, 5, 10);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0xff7e5f, 1, 100);
    pointLight2.position.set(-10, -5, 5);
    scene.add(pointLight2);

    // Create a larger, blurred sphere for the glow effect
    const glowGeometry = new THREE.SphereGeometry(size * 1.2, 32, 32);
    const glowMaterial = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0.0 },
        color1: { value: new THREE.Color(colors[0]) },
        color2: { value: new THREE.Color(colors[2]) }
      },
      vertexShader: `
        varying vec3 vNormal;
        varying vec2 vUv;
        
        void main() {
          vNormal = normalize(normalMatrix * normal);
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float time;
        uniform vec3 color1;
        uniform vec3 color2;
        varying vec3 vNormal;
        varying vec2 vUv;
        
        void main() {
          // Create a soft, pulsing glow
          float pulse = sin(time * 0.2) * 0.5 + 0.5;
          
          // Radial gradient for soft edges
          float dist = length(vUv - vec2(0.5));
          float alpha = smoothstep(0.5, 0.0, dist);
          
          // Mix colors based on time
          vec3 glowColor = mix(color1, color2, sin(time * 0.1) * 0.5 + 0.5);
          
          // Apply pulsing effect
          alpha *= 0.3 + pulse * 0.1;
          
          gl_FragColor = vec4(glowColor, alpha * 0.4);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.BackSide // Render on inside for better glow
    });

    const glowSphere = new THREE.Mesh(glowGeometry, glowMaterial);
    glowSphere.position.copy(sphere.position);
    scene.add(glowSphere);

    // Animation function
    const animate = () => {
      if (!sphereRef.current || !rendererRef.current || !sceneRef.current || !cameraRef.current) return;
      
      frameIdRef.current = requestAnimationFrame(animate);
      
      // Update rotation with smooth, organic movement
      const time = performance.now() * 0.001; // seconds
      sphere.rotation.y = Math.sin(time * 0.1) * 0.2 + time * 0.05;
      sphere.rotation.x = Math.sin(time * 0.08) * 0.1 + time * 0.03;
      
      // Update shader time uniforms
      (sphere.material as THREE.ShaderMaterial).uniforms.time.value = time;
      (glowSphere.material as THREE.ShaderMaterial).uniforms.time.value = time;
      
      // Animate point lights for dynamic highlights
      pointLight1.position.x = Math.sin(time * 0.3) * 10;
      pointLight1.position.y = Math.cos(time * 0.2) * 5;
      
      pointLight2.position.x = Math.sin(time * 0.2 + Math.PI) * 10;
      pointLight2.position.y = Math.cos(time * 0.3 + Math.PI) * 5;
      
      // Animate stars with very slow rotation
      stars.rotation.y = time * 0.01;
      stars.rotation.x = time * 0.005;
      
      // Render
      rendererRef.current.render(sceneRef.current, cameraRef.current);
    };

    // Start animation
    animate();

    // Handle resize
    const handleResize = () => {
      if (!containerRef.current || !cameraRef.current || !rendererRef.current) return;
      
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;
      
      cameraRef.current.aspect = width / height;
      cameraRef.current.updateProjectionMatrix();
      
      rendererRef.current.setSize(width, height);
      
      // Update resolution uniform
      if (sphereRef.current) {
        const material = sphereRef.current.material as THREE.ShaderMaterial;
        material.uniforms.resolution.value.set(
          width * rendererRef.current.getPixelRatio(),
          height * rendererRef.current.getPixelRatio()
        );
      }
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(frameIdRef.current);
      
      if (rendererRef.current && containerRef.current) {
        containerRef.current.removeChild(rendererRef.current.domElement);
      }
      
      if (sphereRef.current) {
        (sphereRef.current.geometry as THREE.BufferGeometry).dispose();
        (sphereRef.current.material as THREE.Material).dispose();
      }
      
      glowGeometry.dispose();
      glowMaterial.dispose();
      starGeometry.dispose();
      starMaterial.dispose();
    };
  }, [size, position, colors]);

  return <div ref={containerRef} className={`absolute inset-0 pointer-events-none ${className}`} />;
};

export default ThreeSphere;