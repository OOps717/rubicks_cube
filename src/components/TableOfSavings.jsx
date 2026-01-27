import { useState } from "react";
import "./TableOfSavings.css";

function SavingRow(props) {
  const {
    setLoadedData,
    setSeconds,
    setRunning,
    paramsRef,
    saving
  } = props
  const { cubeid, duration, created_at } = saving
  const [loading, setLoading] = useState(false);

  const onLoadCube = async () => { 
    setLoading(true);
    const response = await fetch(`http://localhost:3000/api/saving/${cubeid}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" }
    });
    if (response) {
      const loadedSaving = await response.json();
      setSeconds(loadedSaving.duration);
      setLoadedData(loadedSaving);
      setRunning(true);
      paramsRef.current.loaded = true;
    }
    setLoading(false);
  }

  return (
    <tr onClick={loading ? () => {} : () => onLoadCube()} style={{ cursor: "pointer" }}>
      <td>{cubeid}</td>
      <td>{duration}</td>
      <td>{created_at}</td>
    </tr>
  );
}

export default function Savings (props) {
  const { savings, setLoadedData, setSeconds, setRunning, paramsRef} = props
  return (
    <table 
      className="table table table-hover cursor-pointer table-scroll"
      style={{
        '--bs-table-bg': '#ffffff',
        '--bs-table-hover-bg': '#91c8f5',
        '--bs-border-width': '3px',
      }}
    >
      <thead>
        <tr>
          <th scope="col">ID</th>
          <th scope="col">Duration</th>
          <th scope="col">Saving time</th>
        </tr>
      </thead>
      <tbody>
        {savings.map(s => 
          <SavingRow 
            key={s.cubeid} 
            saving={s} 
            setLoadedData={setLoadedData}
            setSeconds={setSeconds}
            setRunning={setRunning}
            paramsRef={paramsRef}
          >
          </SavingRow>)}
      </tbody>
    </table>
  );
}