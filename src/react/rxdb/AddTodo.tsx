import { useState } from "react";

export default function AddTodo() {
  const [todo, setTodo] = useState("");

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    setTodo(event.target.value);
  }

  function addTodo() {
    if (!window.electronAPI) {
      console.error("window.electronAPI is not defined");
      return;
    }
    window.electronAPI.rxdb.addTodo(todo);
    setTodo("");
  }

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
      <h2 style={{ margin: 0, padding: 0 }}>Add Todo</h2>
      <input
        type="text"
        name="name"
        value={todo}
        placeholder="Todo task"
        onChange={handleChange}
      />
      <button onClick={addTodo}>ADD Todo</button>
    </div>
  );
}
