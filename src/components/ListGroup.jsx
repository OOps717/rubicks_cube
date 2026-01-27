import { useRef, useEffect, useState } from "react";
import SaveButton from "./Buttons/SaveButton";
import LoadLatestButton from "./Buttons/LoadLatestButton";
import Savings from "./TableOfSavings";

function ListGroup(props) {
  const { paramsRef, cubeState, setLoadedData } = props;
  const [savings, setSavings] = useState([]);
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(false);

  const start = () => {
    setRunning(true);
    paramsRef.current.running = true;
    paramsRef.current.started = true;
  };

  const stop = () => {
    setSeconds(0);
    setRunning(false);
    paramsRef.current.running = false;
    paramsRef.current.stopped = true;
  };

  const restart = () => {
    setSeconds(0);
    setRunning(true);
    paramsRef.current.running = true;
    paramsRef.current.restarted = true;
  };

  const Timer = () => {
    useEffect(() => {
      if (!running) return;

      const id = setInterval(() => {
        setSeconds(s => s + 1);
      }, 1000);

      return () => clearInterval(id);
    }, [running]);

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    return (
      <div className="timer" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gridGap: 20 }}>
        <div>hours: {hours}</div>
        <div>minutes: {minutes}</div>
        <div>seconds: {seconds % 60}</div>
      </div>
    );
  };

  const loadAllSavings = async () => {
    try {
      const response = await fetch("http://localhost:3000/api/saving/");
      const data = await response.json();
      setSavings(data.rows);
    } catch (err) {
      console.error("Failed to load savings", err);
    }
  };

  useEffect(() => {
    loadAllSavings();
  }, []);

  return (
    <div
      style={{
        position: "absolute",
        top: "16px",
        right: "16px",
        zIndex: 10,
        background: "rgba(0,0,0,0.6)",
        padding: "12px",
        borderRadius: "8px",
        color: "white",
      }}
    >
      <ul className="list-group">
        <li 
          key="timer" 
          className="list-group-item"
        ><Timer></Timer></li>
        {/* <li 
          key="size" 
          className={selected === "size" ? "list-group-item active" : "list-group-item"}
          onClick={() => setSelected("size")}
        >
          <input
            type="text"
            value={inputSize}
            onChange={(e) => setInputSize(e.target.value)}
          />
          <button type="button" className="btn btn-primaryс" onClick={applySize}>Apply size</button>
        </li> */}
        <li 
          key="main-buttons" 
          className="list-group-item d-flex justify-content-between align-items-center"
        >
          <button type="button" className="btn btn-primary" onClick={start} disabled={running}>Start</button>
          <button type="button" className="btn btn-primary" onClick={restart} disabled={!running}>Restart</button>
          <button type="button" className="btn btn-primary" onClick={stop} disabled={!running}>Stop</button>
        </li>
        <li
          key="savings-table"
          className="list-group-item"
        >
          <Savings 
            savings={savings}
            setLoadedData={setLoadedData} 
            setSeconds={setSeconds}
            setRunning={setRunning}
            paramsRef={paramsRef}
          >  
          </Savings>
        </li>
        <li 
          key="save-button" 
          className="list-group-item d-flex justify-content-between align-items-center"
        >
          <SaveButton 
            duration={seconds} 
            running={running} 
            cubeState={cubeState}
            loadAllSavings={loadAllSavings}
          ></SaveButton>
          <LoadLatestButton 
            setLoadedData={setLoadedData} 
            setSeconds={setSeconds}
            setRunning={setRunning}
            paramsRef={paramsRef}
          >  
          </LoadLatestButton>
        </li>
      </ul>

    </div>
  );
}

export default ListGroup;