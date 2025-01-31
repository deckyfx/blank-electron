import { useState, useEffect } from "react";

export default function AddTodo() {
  const [path, setPath] = useState("");
  const [ready, setReady] = useState("");

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    setPath(event.target.value);
  }

  function setup() {
    if (!window.electronAPI) {
      console.error("window.electronAPI is not defined");
      return;
    }
    window.electronAPI.rxdb.setupRxDB(path);
  }

  useEffect(() => {
    window.electronAPI.rxdb.onRxDBReadyChanged(
      "rxdb-ready",
      (data?: string) => {
        setReady(data);
      }
    );
  }, []);

  return (
    <div
      style={{
        marginBottom: "10px",
        padding: "10px",
        border: "1px solid #ccc",
        borderRadius: "5px",
        display: "flex",
        flexDirection: "column",
        gap: "10px",
      }}
    >
      <input
        type="text"
        name="path"
        value={path}
        placeholder="Sqlite path, eg: /home/decky/Documents/rxdb.sqlite"
        onChange={handleChange}
        style={{ width: "100%" }}
      />
      {ready ? null : <button onClick={setup}>SETUP</button>}
      <span>RxDB Is {ready ? "Ready" : "Not Ready"}</span>
    </div>
  );
}
