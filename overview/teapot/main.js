import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

let SCREEN_WIDTH = window.innerWidth;
let SCREEN_HEIGHT = window.innerHeight;
let aspect = SCREEN_WIDTH / SCREEN_HEIGHT;
let container;
let camera, scene, renderer;
let mesh;
let wireframeMesh;

const myFov = 70;
const targetAspectRatio = 16/19;

let isModelLoaded = false;


const API = {
    color: 0xffffff, // sRGB
    exposure: 1.0
};

init();
animate();

function init() {
    container = document.createElement('div');
    document.body.appendChild(container);

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(myFov, aspect, 0.1, 1000);
    camera.position.z = 100;
    camera.position.y = -1.5;
    scene.add(camera);

    let mesh_pos = { x: 0, y: -20, z: 0 }
    let mesh_scale = { x: 0.5, y: 0.5, z: 0.5 }

    const manager = new THREE.LoadingManager( render );

    const loader = new THREE.TextureLoader( manager );  
    const matcap = loader.load( '../../public/matcaps/matcap.png' );


    const matcapMaterial = new THREE.MeshMatcapMaterial({
        color: new THREE.Color().setHex( API.color ).convertSRGBToLinear(),
        matcap: matcap,
    });


    const wireframeMaterial = new THREE.MeshStandardMaterial({
        color: 0x000000,
        metalness: 1,
        roughness: 0.1,
        opacity: .05,
        transparent: true,
        wireframe: true,

    });


    new GLTFLoader().load('../../public/models/teapot.gltf', (gltf) => {
        mesh = gltf.scene;

        mesh.traverse((child) => {
            if (child.isMesh) {
                child.material = matcapMaterial;
                child.castShadow = false;
                child.receiveShadow = false;
            }
        });

        scene.add(mesh);

        mesh.position.set(mesh_pos.x, mesh_pos.y, mesh_pos.z);
        mesh.scale.set(mesh_scale.x, mesh_scale.y, mesh_scale.z);
    });


    new GLTFLoader().load('../../public/models/teapot.gltf', (gltf) => {
        wireframeMesh = gltf.scene;

        wireframeMesh.traverse((child) => {
            if (child.isMesh) {

                child.material = wireframeMaterial;
                child.doubleSided = false;
                child.castShadow = false;
                child.receiveShadow = false;
            }
            
            isModelLoaded = true;
        });

        scene.add(wireframeMesh);
        let position = {x: 0, y: -20, z: 0}
        let scale = {x: 0.5, y: 0.5, z: 0.5}
        wireframeMesh.position.set(position.x, position.y, position.z);
        wireframeMesh.scale.set(scale.x, scale.y, scale.z);

    });  


    let light_1 = new THREE.DirectionalLight(0xffffff, 1);
    let light_2 = new THREE.DirectionalLight(0xffffff, 1);
    let light_3 = new THREE.DirectionalLight(0xffffff, 10);
    let backlight = new THREE.DirectionalLight(0xffffff, 10);

    light_1.position.set(11, 11, 10);
    light_2.position.set(-20, 15, -2);
    light_3.position.set(30, 10, -5);
    backlight.position.set(0, 5, -10);
    scene.add(backlight);
    // scene.add(light_1);
    // scene.add(light_2);
    scene.add(light_3);


    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = API.exposure;

    container.appendChild(renderer.domElement);

    window.addEventListener('resize', onWindowResize);

    SCREEN_WIDTH = window.innerWidth;
    SCREEN_HEIGHT = window.innerHeight;
    renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
    aspect = SCREEN_WIDTH / SCREEN_HEIGHT;
    camera.aspect = aspect;


    if(aspect > targetAspectRatio){
        const cameraHeight = Math.tan(THREE.MathUtils.degToRad(myFov / 2));
        const ratio = camera.aspect / targetAspectRatio;
        const newCameraHeight = cameraHeight / ratio;
        camera.fov = THREE.MathUtils.radToDeg(Math.atan(newCameraHeight)) * 2;
    }
     else {
        camera.fov = myFov
     }

    camera.updateProjectionMatrix();
}

function onWindowResize() {
    SCREEN_WIDTH = window.innerWidth;
    SCREEN_HEIGHT = window.innerHeight;
    renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
    aspect = SCREEN_WIDTH / SCREEN_HEIGHT;
    camera.aspect = aspect;


    if(aspect > targetAspectRatio){
        const cameraHeight = Math.tan(THREE.MathUtils.degToRad(myFov / 2));
        const ratio = camera.aspect / targetAspectRatio;
        const newCameraHeight = cameraHeight / ratio;
        camera.fov = THREE.MathUtils.radToDeg(Math.atan(newCameraHeight)) * 2;
    }
     else {
        camera.fov = myFov
     }

    camera.updateProjectionMatrix();
}

function animate() {
    requestAnimationFrame(animate);
    render();
}

function render() {

    if(isModelLoaded) {
        const speed = 0.003;
        mesh.rotation.y += speed;
        wireframeMesh.rotation.y += speed; 
    }


    camera.visible = true;
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setClearColor( 0x000000, 0 ); // the default
    renderer.render(scene, camera);
}