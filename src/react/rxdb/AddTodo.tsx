import { useState } from 'react';

export default function AddTodo() {
  const [todo, setTodo] = useState('');


  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    setTodo(event.target.value);
  }

  function addTodo() {
    if (!window.electronAPI) {
      console.error('window.electronAPI is not defined');
      return;
    }
    window.electronAPI.rxdb.addTodo(todo);
    setTodo('');
  }

  return (
    <div>
      <input type="text" name="name" value={todo} placeholder="Todo task" onChange={handleChange}/>
      <button onClick={addTodo}> Add Todo</button>
    </div>
  );
}