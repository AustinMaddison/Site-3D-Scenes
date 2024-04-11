import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { EXRLoader } from 'three/addons/loaders/EXRLoader.js';

let SCREEN_WIDTH = window.innerWidth;
let SCREEN_HEIGHT = window.innerHeight;
let aspect = SCREEN_WIDTH / SCREEN_HEIGHT;
let container;
let camera, scene, renderer;
let mesh;
let wireframeMesh;

const myFov = 30;
const targetAspectRatio = 16/10;


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
    scene.add(camera);

    let mesh_pos = { x: 0, y: -20, z: 0 }
    let mesh_scale = { x: 0.5, y: 0.5, z: 0.5 }


    // manager
    const manager = new THREE.LoadingManager( render );

    // matcap
    const loaderEXR = new EXRLoader( manager );
    const matcap = loaderEXR.load( '../../public/matcaps/4.exr' );

    // normalmap
    const loader = new THREE.TextureLoader( manager );

    const surfaceMaterial = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        metalness: 0.2,
        roughness: 0.6,

    });

    const matcapMaterial = new THREE.MeshMatcapMaterial({
        color: new THREE.Color().setHex( API.color ).convertSRGBToLinear(),
        matcap: matcap,
    });


    const wireframeMaterial = new THREE.MeshStandardMaterial({
        color: 0x9999999,
        metalness: 0.1,
        roughness: 0.15,
        opacity: .2,
        transparent: true,
        wireframe: true,

    });


    new GLTFLoader().load('../../public/models/teapot.gltf', (gltf) => {
        console.log('loading model');
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


    }, (xhr) => {
        console.log(`loading ${xhr.loaded / xhr.total * 100}%`);
    }, (error) => {
        console.error(error);
    });


    new GLTFLoader().load('../../public/models/teapot.gltf', (gltf) => {
        console.log('loading model');
        wireframeMesh = gltf.scene;

        wireframeMesh.traverse((child) => {
            if (child.isMesh) {

                child.material = wireframeMaterial;
                child.doubleSided = false;
                child.castShadow = false;
                child.receiveShadow = false;
            }
        });

        scene.add(wireframeMesh);
        let position = {x: 0, y: -20, z: 0}
        let scale = {x: 0.5, y: 0.5, z: 0.5}
        wireframeMesh.position.set(position.x, position.y, position.z);
        wireframeMesh.scale.set(scale.x, scale.y, scale.z);


    }, (xhr) => {
        console.log(`loading ${xhr.loaded / xhr.total * 100}%`);
    }, (error) => {
        console.error(error);
    });  


    let light_1 = new THREE.DirectionalLight(0xffffff, 1);
    let light_2 = new THREE.DirectionalLight(0xffffff, 1);
    let light_3 = new THREE.DirectionalLight(0xffffff, 1);
    let backlight = new THREE.DirectionalLight(0xffffff, 10);

    light_1.position.set(11, 11, 10);
    light_2.position.set(-20, 15, -2);
    light_3.position.set(30, 10, -5);
    backlight.position.set(0, 5, -10);
    scene.add(backlight);
    scene.add(light_1);
    // scene.add(light_2);
    // scene.add(light_3);


    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = API.exposure;

    container.appendChild(renderer.domElement);

    window.addEventListener('resize', onWindowResize);
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
    const speed = 0.003;
    mesh.rotation.y += speed;
    wireframeMesh.rotation.y += speed; 

    camera.visible = true;
    renderer.setClearColor( 0x000000, 0 ); // the default
    renderer.render(scene, camera);
}