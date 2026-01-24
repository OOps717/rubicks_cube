import * as THREE from "three";
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { createScene } from "./scene";
import { createRenderer } from "./renderer";


let accumulatedAngle = 0;
let snapState = null;

function startSnap(group, axis) {
  const step = Math.PI / 2;
  const from = accumulatedAngle;
  const to = Math.round(from / step) * step;

  snapState = {
    group,
    axis,
    from,
    to,
    start: performance.now(),
    last: from,
    duration: 150
  };
  accumulatedAngle = 0;
}

function animateRotation(rubicksCube) {
  function tick(now) {
    const t = Math.min((now - snapState.start) / snapState.duration, 1);
    const current = THREE.MathUtils.lerp(snapState.from, snapState.to, t);
    const delta = current - snapState.last;

    snapState.group.rotateOnWorldAxis(snapState.axis, delta);
    snapState.last = current;

    if (t < 1) {
      requestAnimationFrame(tick);
    } else {
      rubicksCube.finalizeRotation(snapState.group);
      snapState = null;
    }
  }
  requestAnimationFrame(tick);
}

export function initThree(container, paramsRef, setCubeState, loadedRef) {

  const { scene, camera, rubicksCube } = createScene();
  setCubeState(rubicksCube.cubes);
  const renderer = createRenderer(container);

  let running = true;

  const controls = new OrbitControls( camera, renderer.domElement );
  const canvas = renderer.domElement;

  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();
  const prevMouse = new THREE.Vector2();

  let hitNormal = new THREE.Vector3();
  let hitCubie = null;
  let rotationAxis = null;

  let isDragging = false;
  let faceGroup = null;

  renderer.domElement.addEventListener("pointerdown", (event) => {
    if (event.button === 0 && paramsRef.current.running) {
      const rect = canvas.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(scene.children, true);

      if (intersects.length === 0) return;
      hitCubie = intersects[0].object;

      hitNormal.copy(intersects[0].face.normal)
        .transformDirection(hitCubie.matrixWorld)
        .normalize();

      prevMouse.set(event.clientX, event.clientY);
      isDragging = true;
      controls.enableRotate = false;
    }
  });

  renderer.domElement.addEventListener("pointermove", (event) => {
    if (!isDragging) return;

    const curr = new THREE.Vector2(event.clientX, event.clientY);
    const delta = curr.clone().sub(prevMouse);
    prevMouse.copy(curr);

    if (!rotationAxis && delta.length() > 3) {
      rotationAxis = rubicksCube.determineRotationAxis(delta, hitNormal, camera);
      faceGroup = rubicksCube.selectFaceByAxis(rotationAxis, hitCubie);
      return;
    }
    
    if (rotationAxis) {
      accumulatedAngle += rubicksCube.rotateFace(camera, faceGroup, rotationAxis, hitNormal, delta);
    }
  });

  renderer.domElement.addEventListener("pointerup", () => {
    if (!faceGroup || !rotationAxis || !isDragging) return;

    if (!snapState) {
      startSnap(faceGroup, rotationAxis);
      animateRotation(rubicksCube); 
    }

    setCubeState(rubicksCube.cubes);
    
    faceGroup = null;
    rotationAxis = null;
    hitCubie = null;
    isDragging = false;

    controls.enableRotate = true;
  });

  window.addEventListener("resize", () => {
    const w = container.clientWidth;
    const h = container.clientHeight;

    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  });

  function animate(now) {
    if (!running) return;
    if (paramsRef.current.started) {
      for(let i = 0; i < Math.floor(Math.random() * (100 - 50 + 1)) + 50; i++) rubicksCube.randomizeMove();
      paramsRef.current.started = false;
    }
    if (paramsRef.current.restarted) {
      rubicksCube.reinitialize();
      for(let i = 0; i < Math.floor(Math.random() * (100 - 50 + 1)) + 50; i++) rubicksCube.randomizeMove();
      paramsRef.current.restarted = false;
    }
    if (paramsRef.current.stopped) {
      rubicksCube.reinitialize();
      paramsRef.current.stopped = false;
    }
    if (loadedRef.current.data) {
      rubicksCube.loadData(loadedRef.current.data);
      loadedRef.current.data = null
    }
    controls.update();
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }
  requestAnimationFrame(animate);

  return () => {
    running = false;
    renderer.dispose();
    container.removeChild(renderer.domElement);
  };
}