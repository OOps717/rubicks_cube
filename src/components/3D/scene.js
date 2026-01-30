import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import RubicksCube from "./rubicksCube";

export function createScene() {
  const size = 3;
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x404040);

  const camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    100,
  );
  camera.position.set(3, 3, 3);
  camera.lookAt(0, 0, 0);

  scene.add(new THREE.AmbientLight(0xffffff, 0.6));

  const light = new THREE.DirectionalLight(0xffffff, 1);
  light.position.set(20, 20, 20);
  light.castShadow = true;
  light.shadow.mapSize.width = 1024;
  light.shadow.mapSize.height = 1024;

  light.shadow.camera.near = 0.5;
  light.shadow.camera.far = 50;
  scene.add(light);

  const rubicksCube = new RubicksCube({
    scene: scene,
    size: 3,
    cubeSize: 0.995,
  });

  return { scene, camera, rubicksCube };
}
