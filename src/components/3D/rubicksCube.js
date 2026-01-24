import * as THREE from "three";
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

export class RubicksCube {
  constructor(parameters) {
    const { scene, size, cubeSize } = parameters; 
    this.size = size; this.cubeSize = cubeSize;
    this.scene = scene;
    this.cubes = this.#createRubick(parameters);

    this.accumulatedAngle = 0;
    this.snapState = null;
    this.faceGroup = null;
    this.rotationAxis = null;

    this.scene.add(this.cubes);
  }

  #createRubick (params) {

    const geometry = new RoundedBoxGeometry(
      this.cubeSize,
      this.cubeSize,
      this.cubeSize,
      6,
      0.12
    );

    const materials = [
      new THREE.MeshStandardMaterial({ color: 0xff0000, roughness: 0.4, metalness: 0.1}), // right
      new THREE.MeshStandardMaterial({ color: 0xffa500, roughness: 0.4, metalness: 0.1 }), // left
      new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.4, metalness: 0.1 }), // top
      new THREE.MeshStandardMaterial({ color: 0xffff00, roughness: 0.4, metalness: 0.1 }), // bottom
      new THREE.MeshStandardMaterial({ color: 0x00ff00, roughness: 0.4, metalness: 0.1 }), // front
      new THREE.MeshStandardMaterial({ color: 0x0000ff, roughness: 0.4, metalness: 0.1 }), // back
    ];

    const cubeOriginal = new THREE.Mesh(geometry, materials);

    const rubicksCube = new THREE.Group()
    const shift = -(this.size - this.cubeSize)/2
    for (let x = 0; x < this.size; x++) {
      for (let y = 0; y < this.size; y++) {
        for (let z = 0; z < this.size; z++) {
          let cube = cubeOriginal.clone();
          cube.castShadow = true;
          cube.receiveShadow = true;
          cube.name = "cube_"+x+y+z;
          cube.position.set(x+shift, y+shift, z+shift);
          rubicksCube.add(cube);
        } 
      }
    }
    return rubicksCube
  };

  #snapAxis(axis) {
    const abs = axis.clone().set(
      Math.abs(axis.x),
      Math.abs(axis.y),
      Math.abs(axis.z)
    );
  
    if (abs.x > abs.y && abs.x > abs.z)
      return new THREE.Vector3(Math.sign(axis.x), 0, 0);
  
    if (abs.y > abs.x && abs.y > abs.z)
      return new THREE.Vector3(0, Math.sign(axis.y), 0);
  
    return new THREE.Vector3(0, 0, Math.sign(axis.z));
  };

  reinitialize () {
    const shift = -(this.size - this.cubeSize)/2
    for (let x = 0; x < this.size; x++) {
      for (let y = 0; y < this.size; y++) {
        for (let z = 0; z < this.size; z++) {
          let cube = this.cubes.children[x*9 + y*3 + z];
          cube.name = "cube_"+x+y+z;
          cube.position.set(x+shift, y+shift, z+shift);
          cube.rotation.set(0, 0, 0);
        } 
      }
    }
  };

  loadData (data) {
    this.cubes.children.forEach((cube,i) => {
      cube.position.set(data.cubes[i].x, data.cubes[i].y, data.cubes[i].z);
      cube.rotation.set(data.cubes[i].rotX, data.cubes[i].rotY, data.cubes[i].rotZ);
    });
  };

  randomizeMove() {
    const AXES = [
      new THREE.Vector3(1, 0, 0),
      new THREE.Vector3(-1, 0, 0),
      new THREE.Vector3(0, 1, 0),
      new THREE.Vector3(0, -1, 0),
      new THREE.Vector3(0, 0, 1),
      new THREE.Vector3(0, 0, -1),
    ];
    
    const axis = AXES[Math.floor(Math.random() * AXES.length)];
    const randomCube = this.cubes.children[Math.floor(Math.random() * this.cubes.children.length)];
    const faceGroup = this.selectFaceByAxis(axis, randomCube);

    faceGroup.rotateOnWorldAxis(axis, Math.PI/2); 
    this.finalizeRotation(faceGroup);
  };

  determineRotationAxis(delta, hitNormal, camera) {
    const dragDir = new THREE.Vector3(delta.x, -delta.y, 0).normalize();
    dragDir.applyQuaternion(camera.quaternion);
  
    const axis = new THREE.Vector3()
      .crossVectors(hitNormal, dragDir)
      .normalize();
  
    return this.#snapAxis(axis);
  };

  selectFaceByAxis(axis, selectedCubie) {
    const face = []
    const faceGroup = new THREE.Group();
    this.scene.add(faceGroup);

    const normal = axis.clone().normalize();

    const planePoint = new THREE.Vector3();
    selectedCubie.getWorldPosition(planePoint);

    const plane = new THREE.Plane().setFromNormalAndCoplanarPoint(normal, planePoint);

    const cubeCenter = new THREE.Vector3();
    const HALF = 0.995/2;

    this.cubes.children.forEach(cube => {
      cube.getWorldPosition(cubeCenter);

      const dist = Math.abs(plane.distanceToPoint(cubeCenter));
      if (dist < HALF) {
        face.push(cube)
      }
    });

    faceGroup.add(...face);
    return faceGroup;
  };

  rotateFace(camera, faceGroup, rotationAxis, hitNormal, delta) {
    const dragDir = new THREE.Vector3(delta.x, -delta.y, 0).normalize();
    dragDir.applyQuaternion(camera.quaternion);

    const sign = Math.sign(dragDir.dot(new THREE.Vector3().crossVectors(rotationAxis, hitNormal)));
    const angle = sign * delta.length() * 0.005;

    faceGroup.rotateOnWorldAxis(rotationAxis, angle);
    this.accumulatedAngle += angle;
    return angle;
  }

  finalizeRotation(faceGroup) {
    faceGroup.updateMatrixWorld();
    
    while (faceGroup.children.length) {
      const cube = faceGroup.children[0];
      cube.applyMatrix4(faceGroup.matrix);
      this.cubes.add(cube);
    }

    this.scene.remove(faceGroup);
  };
}

export default RubicksCube;
