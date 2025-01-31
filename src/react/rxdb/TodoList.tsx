import { useState, useEffect } from "react";

import { RxTodo } from "../../types/models";

export default function TodoList() {
  const [todos, setTodos] = useState<RxTodo[]>([]);
  const [listening, setListening] = useState<boolean>(false);

  async function loadTodos() {
    if (!window.electronAPI) {
      console.error("window.electronAPI is not defined");
      return;
    }
    const result = await window.electronAPI.rxdb.loadTodos();
    setTodos(JSON.parse(result) as RxTodo[]);
  }

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

  useEffect(() => {
    listenTodo();
  }, []);

  return (
    <div>
      {/* <button onClick={loadTodos}>Load Todos</button> */}
      {listening ? (
        <button onClick={stopListenTodo}>Stop Listen Todo</button>
      ) : (
        <button onClick={listenTodo}>Listen Todo</button>
      )}
      <ul>{mappedTodos()}</ul>
    </div>
  );
}
