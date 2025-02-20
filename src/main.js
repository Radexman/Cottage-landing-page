import * as THREE from 'three';
import { DRACOLoader, GLTFLoader } from 'three/examples/jsm/Addons.js';
import GUI from 'lil-gui';
import gsap from 'gsap';

// Debug
const gui = new GUI();

// Canvas
const canvas = document.getElementById('webgl');

// Scene
const scene = new THREE.Scene();

// Models
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('/draco/');

const gltfLoader = new GLTFLoader();
gltfLoader.setDRACOLoader(dracoLoader);

let mixer = null;

gltfLoader.load(
	'/models/cottage.glb',
	(gltf) => {
		gltf.scene.traverse((child) => {
			child.intensity = 80;
		});
		scene.add(gltf.scene);
	},
	undefined,
	(error) => console.error('Error loading model:', error)
);

// Lights
const ambientLight = new THREE.AmbientLight('#ffffff', 0.3);
// scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1.75);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.set(1024, 1024);
directionalLight.shadow.camera.far = 15;
directionalLight.shadow.camera.left = -7;
directionalLight.shadow.camera.top = 7;
directionalLight.shadow.camera.right = 7;
directionalLight.shadow.camera.bottom = -7;
directionalLight.position.set(5, 5, 5);
scene.add(directionalLight);

// Sizes
const sizes = {
	width: innerWidth,
	height: innerHeight,
};

// Resize
window.addEventListener('reset', () => {
	// Update size
	sizes.width = innerWidth;
	sizes.height = innerHeight;

	// Update camera
	camera.aspect = sizes.width / sizes.height;
	camera.updateProjectionMatrix();

	// Update renderer
	renderer.setSize(sizes.width, sizes.height);
	renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
});

// Camera group
const cameraGroup = new THREE.Group();
scene.add(cameraGroup);

// Camera
const camera = new THREE.PerspectiveCamera(35, sizes.width / sizes.height, 0.1, 100);
camera.position.x = 18.3676;
camera.position.y = 3.618;
camera.position.z = -12.114;
camera.rotation.y = 2.19;
cameraGroup.add(camera);

const cameraFolder = gui.addFolder('Camera');
cameraFolder.add(camera.position, 'x').min(-40).max(40).step(0.0001).name('x axis');
cameraFolder.add(camera.position, 'y').min(-40).max(40).step(0.0001).name('y axis');
cameraFolder.add(camera.position, 'z').min(-40).max(40).step(0.0001).name('z axis');
cameraFolder
	.add(camera.rotation, 'x')
	.min(0)
	.max(Math.PI * 2)
	.step(0.0001)
	.name('x rotation');
cameraFolder
	.add(camera.rotation, 'y')
	.min(0)
	.max(Math.PI * 2)
	.step(0.0001)
	.name('y rotation');
cameraFolder
	.add(camera.rotation, 'z')
	.min(0)
	.max(Math.PI * 2)
	.step(0.0001)
	.name('z rotation');

// Rednerer
const renderer = new THREE.WebGLRenderer({ canvas });
renderer.setSize(sizes.width, sizes.height);
renderer.setClearColor('#1e1a20');
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));

// Cursor
const cursor = {
	x: 0,
	y: 0,
};

window.addEventListener('mousemove', (event) => {
	cursor.x = event.clientX / sizes.width - 0.5;
	cursor.y = event.clientY / sizes.height - 0.5;
});

// Aniamate
const clock = new THREE.Clock();
let previousTime = 0;

const animate = () => {
	const elapsedTime = clock.getElapsedTime();
	const deltaTime = elapsedTime - previousTime;
	previousTime = elapsedTime;

	// Camera parallax animation
	const parallaxX = cursor.x * 0.5;
	const parallaxY = cursor.y * 0.5;
	cameraGroup.position.x += (parallaxX - cameraGroup.position.x) * 4 * deltaTime;
	cameraGroup.position.y += (parallaxY - cameraGroup.position.y) * 4 * deltaTime;

	// Render
	renderer.render(scene, camera);

	// Call animate again on the next frame
	window.requestAnimationFrame(animate);
};

animate();
