import React, { useRef, useEffect, useState } from 'react';
import { GLView } from 'expo-gl';
import { Renderer } from 'expo-three';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { loadGLTF } from '../utils/loadModel';
import { attachSpatialAudio } from './SpatialAudio';
import { Platform, View, Text, StyleSheet } from 'react-native';
import { createTextShadow } from '../utils/shadows';

export default function ThreeScene({ instrumentModels }) {
    const glViewRef = useRef();
    const [isWebPlatform] = useState(Platform.OS === 'web');

    useEffect(() => {
        let animationFrameId;
        const init = async () => {
            try {
                if (!glViewRef.current) {
                    console.error('GLView ref is not available');
                    return;
                }

                // Check if createContextAsync is available (native only)
                if (!glViewRef.current.createContextAsync) {
                    console.warn('GLView not supported on web, using fallback');
                    return;
                }

                const gl = await glViewRef.current.createContextAsync();
                const renderer = new Renderer({ gl });
                renderer.setSize(gl.drawingBufferWidth, gl.drawingBufferHeight);

                const scene = new THREE.Scene();
                const camera = new THREE.PerspectiveCamera(
                    75,
                    gl.drawingBufferWidth / gl.drawingBufferHeight,
                    0.1,
                    1000
                );
                camera.position.set(0, 1.6, 5);

                const controls = new OrbitControls(camera, glViewRef.current);
                controls.enableDamping = true;

                const ambient = new THREE.AmbientLight(0xffffff, 0.8);
                scene.add(ambient);

                // Load instrument models if provided
                if (instrumentModels && instrumentModels.length) {
                    for (const modelInfo of instrumentModels) {
                        const model = await loadGLTF(modelInfo.uri);
                        model.position.set(...modelInfo.position);
                        scene.add(model);
                        // Attach spatial audio placeholder
                        attachSpatialAudio(model, modelInfo.soundUri);
                    }
                }

                const render = () => {
                    animationFrameId = requestAnimationFrame(render);
                    controls.update();
                    renderer.render(scene, camera);
                    gl.endFrameEXP();
                };
                render();
            } catch (error) {
                console.error('Error initializing ThreeScene:', error);
            }
        };
        init();
        return () => cancelAnimationFrame(animationFrameId);
    }, []);

    if (isWebPlatform) {
        return (
            <View style={webStyles.container}>
                <Text style={webStyles.title}>🎸 Band Room</Text>
                <Text style={webStyles.message}>
                    3D Band Room is available on mobile devices.
                </Text>
                <Text style={webStyles.subtitle}>
                    Download the app to experience the immersive 3D environment!
                </Text>
            </View>
        );
    }

    return <GLView style={{ flex: 1 }} ref={glViewRef} />;
}

const webStyles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#FF4500',
        marginBottom: 20,
        ...createTextShadow({ color: '#FF4500', radius: 20 }),
    },
    message: {
        fontSize: 18,
        color: '#FFD700',
        textAlign: 'center',
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 14,
        color: '#FF8C00',
        textAlign: 'center',
        opacity: 0.8,
    },
});
