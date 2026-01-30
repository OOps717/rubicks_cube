import { useEffect, useState, useRef, useCallback } from "react";
import { initThree } from "./components/3D/main";
import ListGroup from "./components/ListGroup";

function App() {
  const paramsRef = useRef({
    started: false,
    restarted: false,
    stopped: false,
    running: false,
  });
  const threeContainerRef = useRef(null);
  const [cubeState, setCubeState] = useState(null);

  const loadedRef = useRef({ data: null });
  const [loadedData, setLoadedData] = useState(null);

  useEffect(() => {
    loadedRef.current.data = loadedData;
  }, [loadedData]);

  useEffect(() => {
    if (!threeContainerRef.current) return;
    const cleanup = initThree(
      threeContainerRef.current,
      paramsRef,
      setCubeState,
      loadedRef,
    );
    return cleanup;
  }, []);

  return (
    <div style={{ width: "100vw", height: "100vh", position: "relative" }}>
      <ListGroup
        paramsRef={paramsRef}
        cubeState={cubeState}
        setLoadedData={setLoadedData}
      />
      <div
        ref={threeContainerRef}
        style={{
          width: "100%",
          height: "100%",
        }}
      />
    </div>
  );
}

export default App;
