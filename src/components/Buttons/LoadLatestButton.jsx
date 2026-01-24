import { useState } from "react";

function LoadLatestButton({setLoadedData, setSeconds, setRunning, paramsRef}) {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    const response = await fetch("http://localhost:3000/api/saving/latest", {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    if (response) {
      const loadedSaving = await response.json();
      setSeconds(loadedSaving.duration);
      setLoadedData(loadedSaving);
      setRunning(true);
      paramsRef.current.running = true;
      // paramsRef.current.restarted = true;
    }
    setLoading(false);
  };

  return (
    <button className="btn btn-primary" onClick={handleClick} disabled={loading}>
      {loading ? "Loading..." : "Load latest"}
    </button>
  );
}
export default LoadLatestButton;