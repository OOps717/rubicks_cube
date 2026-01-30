import { useState } from "react";
import DeleteButton from "./Buttons/DeleteButton";
import "./TableOfSavings.css";

function SavingRow(props) {
  const {
    setLoadedData,
    setSeconds,
    setRunning,
    loadAllSavings,
    paramsRef,
    saving,
  } = props;
  const { cubeid, duration, created_at } = saving;
  const [loading, setLoading] = useState(false);

  const onLoadCube = async (e) => {
    e.stopPropagation();
    setLoading(true);
    const response = await fetch(`http://localhost:3000/api/saving/${cubeid}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    if (response) {
      const loadedSaving = await response.json();
      setSeconds(loadedSaving.duration);
      setLoadedData(loadedSaving);
      setRunning(true);
      paramsRef.current.loaded = true;
    }
    setLoading(false);
  };

  return (
    <tr
      onClick={loading ? () => {} : (e) => onLoadCube(e)}
      style={{ cursor: "pointer" }}
    >
      <td>{cubeid}</td>
      <td>{duration}</td>
      <td>{created_at}</td>
      <td>
        <DeleteButton saving={saving} loadAllSavings={loadAllSavings} />
      </td>
    </tr>
  );
}

export default function Savings(props) {
  const {
    savings,
    setLoadedData,
    setSeconds,
    setRunning,
    loadAllSavings,
    paramsRef,
  } = props;
  return (
    <table
      className="table table table-hover cursor-pointer table-scroll"
      style={{
        "--bs-table-bg": "#ffffff",
        "--bs-table-hover-bg": "#91c8f5",
        "--bs-border-width": "3px",
      }}
    >
      <thead>
        <tr>
          <th scope="col">ID</th>
          <th scope="col">Duration</th>
          <th scope="col">Saving time</th>
          <th scope="col"></th>
        </tr>
      </thead>
      <tbody>
        {savings.map((s) => (
          <SavingRow
            key={s.cubeid}
            saving={s}
            setLoadedData={setLoadedData}
            setSeconds={setSeconds}
            setRunning={setRunning}
            loadAllSavings={loadAllSavings}
            paramsRef={paramsRef}
          ></SavingRow>
        ))}
      </tbody>
    </table>
  );
}
