import { useState } from "react";

function DeleteButton(props) {
  const { saving, loadAllSavings } = props;
  const [deleting, setDeleting] = useState(false);

  const handleClick = async (e) => {
    e.stopPropagation();
    setDeleting(true);
    await fetch("http://localhost:3000/api/saving", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cubeid: saving.cubeid }),
    });
    await loadAllSavings();
    setDeleting(false);
  };

  return (
    <button
      className="btn btn-primary"
      onClick={(e) => handleClick(e)}
      disabled={deleting}
    >
      {deleting ? "Deleting..." : "Delete"}
    </button>
  );
}
export default DeleteButton;
