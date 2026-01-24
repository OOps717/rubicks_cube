import { useState } from "react";

function SaveButton({duration, running, cubeState}) {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    const cubeInfo = cubeState?.children.map(cube => {
      return {
        position: cube.position,
        rotation: cube.rotation
      }
    })
    const response = await fetch("http://localhost:3000/api/saving", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ duration, cubeInfo }),
    });
    
    setLoading(false);
  };

  return (
    <button className="btn btn-primary" onClick={handleClick} disabled={loading || !running}>
      {loading ? "Saving..." : "Save"}
    </button>
  );
}
export default SaveButton;