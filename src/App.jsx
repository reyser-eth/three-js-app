// src/App.tsx (or src/App.jsx)
import React, { Suspense, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, useGLTF } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';
import { useControls } from 'leva'; // <--- Keep this import for TokyoScene
import './App.css';

// New Component to load and display the Tokyo model
function TokyoScene() {
  const { scene } = useGLTF('/tokyo.glb');
  const modelRef = useRef();

  // <--- NEW: Leva controls for model position and scale ---
  const { positionX, positionY, positionZ, modelScale, rotationSpeed } = useControls('Tokyo Model', {
    positionX: { value: 0, min: -30, max: 30, step: 0.1 },
    positionY: { value: 0, min: -30, max: 30, step: 0.1 },
    positionZ: { value: 0, min: -30, max: 30, step: 0.1 },
    modelScale: { value: 0.1, min: 0.01, max: 1, step: 0.01 }, // Adjust range as needed
    rotationSpeed: { value: 0.0002, min: 0, max: 0.01, step: 0.00001 }
  });
  // --- END NEW ---

  React.useEffect(() => {
    // Traverse the scene to enable shadows for all meshes
    scene.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });

    // --- REVISED: Initial centering and scaling logic ---
    // Calculate Bounding Box once to get initial size/center
    const box = new THREE.Box3().setFromObject(scene);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());

    // You can use these initial calculations to set smart defaults for your leva controls
    // For example, if you want it initially centered:
    // This part is mainly for understanding the model's initial state if you wanted
    // to programmatically center it *before* user input.
    // For manual control, we'll let leva handle the position.

    // If you always want it to initially sit on the ground, regardless of leva:
    // If the model's natural pivot is at its base, this might not be needed.
    // Otherwise, uncomment and adjust if model floats initially.
    // scene.position.y = -size.y / 2 * modelScale; // This might be tricky with manual scale.
    // For now, let leva's positionY handle the vertical offset.


  }, [scene]);

  useFrame(() => {
    if (modelRef.current) {
      // Apply position and scale from leva controls
      modelRef.current.position.set(positionX, positionY, positionZ);
      modelRef.current.scale.set(modelScale, modelScale, modelScale);

      // Apply rotation from leva controls
      modelRef.current.rotation.y += rotationSpeed;
    }
  });

  return <primitive object={scene} ref={modelRef} />;
}

// Main 3D Scene Component
function Scene() {
  const { camera } = useThree();

  return (
    <>
      {/* Lights */}
      <ambientLight intensity={0.5} />
      <directionalLight
        position={[10, 10, 5]}
        intensity={1.5}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-near={0.5}
        shadow-camera-far={50}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
      />
      <pointLight position={[-10, 0, -20]} intensity={0.5} decay={0.5} color="blue" />
      <spotLight position={[0, 15, 0]} angle={0.3} penumbra={1} intensity={2} castShadow color="yellow" />

      <Environment preset="city" />

      {/* Ground plane with shadows - position slightly below the origin where the model's base will be */}
      <ContactShadows
        position={[0, -0.5, 0]} // Position slightly below where model's base should sit
        opacity={0.75}
        scale={60}
        blur={2}
        far={30}
        resolution={1024}
        color="#000000"
      />

      {/* Tokyo Model - The main attraction */}
      <Suspense fallback={null}>
        <TokyoScene />
      </Suspense>

      {/* Orbit Controls for user interaction */}
      {/* Target the scene's origin (0,0,0) as the model will be moved relative to this */}
      <OrbitControls camera={camera} target={[0, 0, 0]} />

      {/* Post-processing effects */}
      <EffectComposer>
        <Bloom luminanceThreshold={0} luminanceSmoothing={0.9} height={300} />
      </EffectComposer>
    </>
  );
}

// App Component
function App() {
  // <--- REVERTED: Fixed camera position and FOV ---
  // We are no longer controlling the camera directly with Leva from App.
  // The camera will stay here, and we'll move the Tokyo model.
  const initialCameraPosition = [0, 8, 25]; // Good starting point for viewing a scene at origin
  const initialCameraFov = 45;

  return (
    <div className="App-container">
      <Canvas
        shadows
        camera={{ position: initialCameraPosition, fov: initialCameraFov }}
        style={{ background: '#000000' }}
      >
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      </Canvas>
      <div className="App-overlay">
        <h1>Explore Tokyo in 3D!</h1>
        <p>Drag to orbit, scroll to zoom. Use the Leva GUI to adjust the Tokyo model's position.</p>
      </div>
    </div>
  );
}

export default App;