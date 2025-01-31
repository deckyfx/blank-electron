import { useState, useEffect } from "react";

import { RxTodo } from "../../types/models";

export default function TodoList() {
  const [todos, setTodos] = useState<RxTodo[]>([]);
  const [listening, setListening] = useState<boolean>(false);

  async function listenTodo() {
    if (!window.electronAPI) {
      console.error("window.electronAPI is not defined");
      return;
    }
    await window.electronAPI.rxdb.listenTodo();
    window.electronAPI.rxdb.onTodoChanged("todos-changed", (data) => {
      setTodos(JSON.parse(data) as RxTodo[]);
    });
    setListening(true);
  }

  async function stopListenTodo() {
    if (!window.electronAPI) {
      console.error("window.electronAPI is not defined");
      return;
    }
    await window.electronAPI.rxdb.stopListenTodo();
    setListening(false);
  }

  async function toggleDone(todo: RxTodo) {
    if (!window.electronAPI) {
      console.error("window.electronAPI is not defined");
      return;
    }
    await window.electronAPI.rxdb.toggleDone(todo);
  }

  async function deleteTodo(todo: RxTodo) {
    if (!window.electronAPI) {
      console.error("window.electronAPI is not defined");
      return;
    }
    await window.electronAPI.rxdb.deleteTodo(todo);
  }

  function mappedTodos() {
    return todos.map((todo, index) => {
      return (
        <li key={index}>
          <div>
            <span>{todo.name}</span>&nbsp;
            <span>[{new Date(todo.timestamp).toLocaleString()}]</span>&nbsp;
            <button onClick={() => toggleDone(todo)}>
              {todo.done ? "Done" : "Not Done"}
            </button>
            &nbsp;
            <button onClick={() => deleteTodo(todo)}>Delete</button>
          </div>
        </li>
      );
    });
  }

  useEffect(() => {}, []);

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
      <h2 style={{ margin: 0, padding: 0 }}>Todo List</h2>
      {/* <button onClick={loadTodos}>Load Todos</button> */}
      {listening ? (
        <button onClick={stopListenTodo}>Stop Listen Todo</button>
      ) : (
        <button onClick={listenTodo}>LISTEN Todo</button>
      )}
      <ul>{mappedTodos()}</ul>
    </div>
  );
}
