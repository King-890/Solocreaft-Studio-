import * as THREE from 'three';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls';

// Simple first‑person controls using PointerLockControls.
// Call this function after camera and renderer are created.
export function initFirstPersonControls(camera, renderer, gl) {
    const controls = new PointerLockControls(camera, gl.domElement);
    // Enable pointer lock on click
    gl.domElement.addEventListener('click', () => {
        controls.lock();
    });
    // Basic WASD movement
    const move = { forward: false, backward: false, left: false, right: false };
    const speed = 5;
    const onKeyDown = (event) => {
        switch (event.code) {
            case 'KeyW':
                move.forward = true;
                break;
            case 'KeyS':
                move.backward = true;
                break;
            case 'KeyA':
                move.left = true;
                break;
            case 'KeyD':
                move.right = true;
                break;
        }
    };
    const onKeyUp = (event) => {
        switch (event.code) {
            case 'KeyW':
                move.forward = false;
                break;
            case 'KeyS':
                move.backward = false;
                break;
            case 'KeyA':
                move.left = false;
                break;
            case 'KeyD':
                move.right = false;
                break;
        }
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    const update = (delta) => {
        const direction = new THREE.Vector3();
        if (move.forward) direction.z -= 1;
        if (move.backward) direction.z += 1;
        if (move.left) direction.x -= 1;
        if (move.right) direction.x += 1;
        direction.normalize();
        if (direction.length() > 0) {
            camera.position.addScaledVector(direction, speed * delta);
        }
    };

    return { controls, update };
}
