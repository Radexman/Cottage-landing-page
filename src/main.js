import * as THREE from 'three';
import { DRACOLoader, GLTFLoader } from 'three/examples/jsm/Addons.js';
import GUI from 'lil-gui';
import gsap from 'gsap';

// Debug
const gui = new GUI();
gui.hide();

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
		gltf.scene.traverse((child) => {
			if (child.isMesh) {
				child.castShadow = true;
				child.receiveShadow = true;
			}
		});

		scene.add(gltf.scene);
	},
	undefined,
	(error) => console.error('Error loading model:', error)
);

// Floor
const floor = new THREE.Mesh(
	new THREE.PlaneGeometry(75, 75),
	new THREE.MeshStandardMaterial({ color: 0xe7dec2, roughness: 0.7, metalness: 0.1 })
);
floor.rotation.x = -Math.PI * 0.5;
floor.position.x = -20;
floor.receiveShadow = true;
scene.add(floor);

// Octahedron
const octahedron = new THREE.Mesh(
	new THREE.OctahedronGeometry(0.55, 0),
	new THREE.MeshStandardMaterial({ color: 0xff88cc, roughness: 1, metalness: 1 })
);
octahedron.position.set(4.8, 7.8, 1.1);
octahedron.rotation.z = Math.PI * 0.75;
scene.add(octahedron);

// Torus
const torus = new THREE.Mesh(
	new THREE.TorusGeometry(0.7, 0.25, 9, 50),
	new THREE.MeshStandardMaterial({ color: 0xffff00, roughness: 1, metalness: 1 })
);
torus.position.set(-7, 8, -2.7);
torus.rotation.y = Math.PI / 2;
scene.add(torus);

// Partcles
const particlesGeometry = new THREE.SphereGeometry(35, 32, 32);
const particlesMaterial = new THREE.PointsMaterial({
	size: 0.25,
	sizeAttenuation: true,
	transparent: true,
	color: new THREE.Color('#ff88cc'),
});

const particles = new THREE.Points(particlesGeometry, particlesMaterial);
scene.add(particles);

// Lights
const lightFolder = gui.addFolder('Lights');

// Point Light
const pointLight = new THREE.PointLight(0xc1a79f, 2.8);
pointLight.position.x = -2;
pointLight.position.y = 2;
pointLight.position.z = -10;
pointLight.castShadow = true;
pointLight.shadow.camera.near = 0.1;
pointLight.shadow.camera.far = 15;
pointLight.shadow.bias = -0.005;
scene.add(pointLight);

// Point Light Controls
const pointLightConfig = {
	color: pointLight.color.getHex(),
	intensity: pointLight.intensity,
};

lightFolder
	.addColor(pointLightConfig, 'color')
	.name('Point light color')
	.onChange((value) => pointLight.color.set(value));

lightFolder.add(pointLight, 'intensity').min(0).max(20).step(0.1).name('Point light intensity');

// Directional Light
const directionalLight = new THREE.DirectionalLight(0xe1dabc, 3);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.set(1024, 1024);
directionalLight.shadow.camera.far = 15;
directionalLight.shadow.camera.left = -7;
directionalLight.shadow.camera.top = 7;
directionalLight.shadow.camera.right = 7;
directionalLight.shadow.camera.bottom = -7;
directionalLight.position.set(5, 5, 5);
directionalLight.shadow.camera.near = 0.1;
directionalLight.shadow.camera.far = 15;
directionalLight.shadow.bias = -0.005;

scene.add(directionalLight);

// Directional Light Controls
const dirLightConfig = {
	color: directionalLight.color.getHex(),
	intensity: directionalLight.intensity,
};

lightFolder
	.addColor(dirLightConfig, 'color')
	.name('Directional light color')
	.onChange((value) => directionalLight.color.set(value));

lightFolder.add(directionalLight, 'intensity').min(0).max(10).step(0.1).name('Directional light intensity');

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

	if (mixer) {
		mixer.update(deltaTime);
	}

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
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowMap;

// Cursor
const cursor = {
	x: 0,
	y: 0,
};

window.addEventListener('mousemove', (event) => {
	cursor.x = event.clientX / sizes.width - 0.5;
	cursor.y = event.clientY / sizes.height - 0.5;
});

// Text animation
gsap.from('h1', {
	opacity: 0,
	y: -75,
	duration: 1.5,
	ease: 'power2.out',
});

gsap.from('p', {
	opacity: 0,
	x: -75,
	duration: 1.5,
	delay: 0.3,
	ease: 'power2.out',
});

// Aniamate
const clock = new THREE.Clock();
let previousTime = 0;

const animate = () => {
	const elapsedTime = clock.getElapsedTime();
	const deltaTime = elapsedTime - previousTime;
	previousTime = elapsedTime;

	// Animate sphere
	particles.rotation.y = Math.PI * elapsedTime * 0.01;
	particles.rotation.x = Math.PI * elapsedTime * 0.01;

	// Aniamte octahederon
	octahedron.rotation.x = Math.PI * elapsedTime * 0.5;

	// Animate torus
	torus.rotation.y += Math.cos(Math.PI * elapsedTime) * 0.025;
	torus.rotation.x += Math.sin(Math.PI * elapsedTime) * 0.025;

	// Camera parallax animation
	const parallaxX = cursor.x * 0.5;
	const parallaxY = cursor.y * 0.5;
	cameraGroup.position.x += (parallaxX - cameraGroup.position.x) * 10 * deltaTime;
	cameraGroup.position.y += (parallaxY - cameraGroup.position.y) * 10 * deltaTime;

	// Render
	renderer.render(scene, camera);

	// Call animate again on the next frame
	window.requestAnimationFrame(animate);
};

animate();
