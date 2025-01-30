import { useState, useEffect } from 'react';

import { Todo } from '../../models';

export default function TodoList() {
  const [todos, setTodos] = useState<Todo[]>([]);

  useEffect(() => {
    loadTodos();
  }, []);

  async function loadTodos() {
    if (!window.electronAPI) {
      console.error('window.electronAPI is not defined');
      return;
    }
    const result = await window.electronAPI.rxdb.loadTodos();
    setTodos(JSON.parse(result) as Todo[]);
  }

  function mappedTodos() {
    return todos.map((todo, index) => {
      return <li key={index}>{todo.name}</li>;
    });
  }

  return (
    <div>
      <button onClick={loadTodos}>Load Todos</button>
      <ul>{mappedTodos()}</ul>
    </div>
  );
}