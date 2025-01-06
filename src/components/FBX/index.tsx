import React, { useEffect, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';

import { AnimationMixer } from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const AstralBike = () => {
    const [model, setModel] = useState(null);
    const mixerRef = useRef(null); // Animation mixer ref

    useEffect(() => {
        const loader = new GLTFLoader();
        loader.load('/astral bike.glb', (gltf) => {
            const loadedModel = gltf.scene;
            setModel(loadedModel);
            console.log(loadedModel)
            // Initialize animation mixer when the model is loaded
            if (gltf.animations && gltf.animations.length) {
                mixerRef.current = new AnimationMixer(loadedModel);
                gltf.animations.forEach((clip) => {
                    mixerRef.current.clipAction(clip).play(); // Play the animations
                });
            }
        });
    }, []);

    // Update animation mixer on each frame
    useFrame((state, a) => {
        if (mixerRef.current) {
            mixerRef.current.update(a); // Update animation mixer
        }
    });

    // Only render model when it's loaded
    if (!model) return null;

    return <primitive object={model} position={[0, 0, -500]} />;
};

const App = () => {
    return (
        <Canvas>
            <ambientLight intensity={2} />
            <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
            <pointLight position={[-10, -10, -10]} intensity={2} />
            <AstralBike />
            <OrbitControls
                enableZoom={true}
                minDistance={200}    // Minimum zoom distance
                maxDistance={1000}   // Maximum zoom distance
                target={[0, 0, 0]}   // Camera target position
            />
        </Canvas>
    );
};

export default App;
