import React, { useEffect } from 'react';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import * as THREE from 'three';

export const loadGLTF = async (uri) => {
    const loader = new GLTFLoader();
    return new Promise((resolve, reject) => {
        loader.load(
            uri,
            (gltf) => resolve(gltf.scene),
            undefined,
            (err) => reject(err)
        );
    });
};
