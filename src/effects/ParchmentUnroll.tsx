import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';

const vertexShader = `
  uniform float progress;
  uniform float angle;
  varying vec2 vUv;
  varying float vFrontShadow;

  mat4 rotationMatrix(vec3 axis, float angle) {
    axis = normalize(axis);
    float s = sin(angle);
    float c = cos(angle);
    float oc = 1.0 - c;
    return mat4(
      oc * axis.x * axis.x + c,           oc * axis.x * axis.y - axis.z * s, oc * axis.z * axis.x + axis.y * s, 0.0,
      oc * axis.x * axis.y + axis.z * s,  oc * axis.y * axis.y + c,          oc * axis.y * axis.z - axis.x * s, 0.0,
      oc * axis.z * axis.x - axis.y * s,  oc * axis.y * axis.z + axis.x * s, oc * axis.z * axis.z + c,          0.0,
      0.0,                                 0.0,                                0.0,                                1.0
    );
  }

  vec3 rotate(vec3 v, vec3 axis, float angle) {
    mat4 m = rotationMatrix(axis, angle);
    return (m * vec4(v, 1.0)).xyz;
  }

  void main() {
    vUv = uv;
    float pi = 3.14159265359;
    vec3 newposition = position;
    float rad = 0.1;
    float rolls = 6.0;

    float offs = (newposition.x + 0.5) / (sin(angle) + cos(angle));
    float tProgress = clamp((progress - offs * 0.99) / 0.01, 0.0, 1.0);
    vFrontShadow = clamp((progress - offs * 0.95) / 0.05, 0.7, 1.0);

    newposition.z = rad + rad * (1.0 - offs / 2.0) * sin(-offs * rolls * pi - 0.5 * pi);
    newposition.x = -0.5 + rad * (1.0 - offs / 2.0) * cos(-offs * rolls * pi + 0.5 * pi);

    newposition -= vec3(-0.5, 0.5, rad);
    newposition = rotate(newposition, vec3(sin(angle), cos(angle), 0.0), -pi * progress * rolls);
    newposition += vec3(
      -0.5 + progress * cos(angle) * (sin(angle) + cos(angle)),
      0.5 - progress * sin(angle) * (sin(angle) + cos(angle)),
      rad * (1.0 - progress / 2.0)
    );

    vec3 finalposition = mix(newposition, position, tProgress);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(finalposition, 1.0);
  }
`;

const fragmentShader = `
  uniform sampler2D uTexture;
  varying vec2 vUv;
  varying float vFrontShadow;

  void main() {
    vec4 color = texture2D(uTexture, vUv);
    color.rgb *= vFrontShadow;
    gl_FragColor = color;
  }
`;

interface MeshData {
  mesh: THREE.Mesh;
  material: THREE.ShaderMaterial;
  placeholder: HTMLElement;
  progress: { value: number };
  tween: gsap.core.Tween | null;
}

export default function ParchmentUnroll() {
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const meshDataRef = useRef<MeshData[]>([]);
  const rafRef = useRef<number>(0);
  const observersRef = useRef<IntersectionObserver[]>([]);

  useEffect(() => {
    const container = canvasContainerRef.current;
    if (!container) return;

    // Wait for images to load
    const init = () => {
      const placeholders = document.querySelectorAll<HTMLElement>('.tier-image-placeholder');
      if (placeholders.length === 0) return;

      // Setup Three.js
      const cameraDistance = 400;
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(
        2 * Math.atan((window.innerHeight) / (2 * cameraDistance)) * (180 / Math.PI),
        window.innerWidth / window.innerHeight,
        1,
        2000
      );
      camera.position.z = cameraDistance;

      const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.domElement.style.width = '100%';
      renderer.domElement.style.height = '100%';
      renderer.domElement.style.display = 'block';
      container.appendChild(renderer.domElement);

      rendererRef.current = renderer;
      sceneRef.current = scene;
      cameraRef.current = camera;

      // Create meshes for each placeholder
      placeholders.forEach((placeholder) => {
        const imgEl = placeholder.querySelector('img') as HTMLImageElement;
        if (!imgEl) return;

        const texture = new THREE.TextureLoader().load(imgEl.src);
        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;

        const progressObj = { value: 0.0 };

        const material = new THREE.ShaderMaterial({
          uniforms: {
            progress: { value: 0.0 },
            angle: { value: 0.0 },
            uTexture: { value: texture },
          },
          vertexShader,
          fragmentShader,
          side: THREE.DoubleSide,
          transparent: true,
        });

        const geometry = new THREE.PlaneGeometry(1, 1, 80, 80);
        const mesh = new THREE.Mesh(geometry, material);
        scene.add(mesh);

        const data: MeshData = {
          mesh,
          material,
          placeholder,
          progress: progressObj,
          tween: null,
        };

        meshDataRef.current.push(data);

        // IntersectionObserver for animation trigger
        const observer = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (data.tween) data.tween.kill();

              if (entry.isIntersecting) {
                data.tween = gsap.to(data.progress, {
                  value: 1.0,
                  duration: 1.8,
                  ease: 'power2.out',
                  onUpdate: () => {
                    material.uniforms.progress.value = data.progress.value;
                  },
                });
              } else {
                data.tween = gsap.to(data.progress, {
                  value: 0.0,
                  duration: 1.0,
                  ease: 'power2.in',
                  onUpdate: () => {
                    material.uniforms.progress.value = data.progress.value;
                  },
                });
              }
            });
          },
          { threshold: 0.3 }
        );
        observer.observe(placeholder);
        observersRef.current.push(observer);
      });

      // Update mesh positions based on DOM
      function updateMeshPositions() {
        meshDataRef.current.forEach((data) => {
          const rect = data.placeholder.getBoundingClientRect();
          const w = rect.width;
          const h = rect.height;

          data.mesh.scale.set(w, h, 1);

          // Convert DOM coords to Three.js coords
          const x = rect.left + w / 2 - window.innerWidth / 2;
          const y = -(rect.top + h / 2 - window.innerHeight / 2);
          data.mesh.position.set(x, y, 0);
        });
      }

      // Render loop
      function animate() {
        updateMeshPositions();
        renderer.render(scene, camera);
        rafRef.current = requestAnimationFrame(animate);
      }
      rafRef.current = requestAnimationFrame(animate);

      // Handle resize
      const handleResize = () => {
        const w = window.innerWidth;
        const h = window.innerHeight;
        camera.aspect = w / h;
        camera.fov = 2 * Math.atan(h / (2 * cameraDistance)) * (180 / Math.PI);
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      };
      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('resize', handleResize);
      };
    };

    // Wait for window load to ensure images are ready
    if (document.readyState === 'complete') {
      const cleanup = init();
      return () => {
        cleanup?.();
        cancelAnimationFrame(rafRef.current);
        observersRef.current.forEach((o) => o.disconnect());
        meshDataRef.current.forEach((d) => {
          if (d.tween) d.tween.kill();
          d.mesh.geometry.dispose();
          d.material.dispose();
        });
        meshDataRef.current = [];
        if (rendererRef.current) {
          rendererRef.current.dispose();
          if (container.contains(rendererRef.current.domElement)) {
            container.removeChild(rendererRef.current.domElement);
          }
        }
      };
    } else {
      let resizeCleanup: (() => void) | undefined;
      const onLoad = () => {
        resizeCleanup = init();
      };
      window.addEventListener('load', onLoad);
      return () => {
        window.removeEventListener('load', onLoad);
        resizeCleanup?.();
        cancelAnimationFrame(rafRef.current);
        observersRef.current.forEach((o) => o.disconnect());
        meshDataRef.current.forEach((d) => {
          if (d.tween) d.tween.kill();
          d.mesh.geometry.dispose();
          d.material.dispose();
        });
        meshDataRef.current = [];
        if (rendererRef.current) {
          rendererRef.current.dispose();
          if (container.contains(rendererRef.current.domElement)) {
            container.removeChild(rendererRef.current.domElement);
          }
        }
      };
    }
  }, []);

  return (
    <div
      ref={canvasContainerRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 10,
        pointerEvents: 'none',
      }}
    />
  );
}
