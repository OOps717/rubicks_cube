import { useEffect, useRef } from "react";
import { initThree } from "./components/3D/main";
import ListGroup from "./components/ListGroup";

function App() {
  const paramsRef = useRef({ started: false, restarted: false, stopped: false, running: false });
  const threeContainerRef = useRef(null);

  useEffect(() => {
    if (!threeContainerRef.current) return;
    const cleanup = initThree(threeContainerRef.current, paramsRef);
    return cleanup;
  }, []);


  return (
    <div style={{ width: "100vw", height: "100vh", position: "relative" }}>
      <ListGroup paramsRef={paramsRef}/>

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

