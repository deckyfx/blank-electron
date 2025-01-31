import { useState } from 'react';

export default function AddDemo() {
  const [demo, setDemo] = useState('');


  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    setDemo(event.target.value);
  }

  function addDemo() {
    if (!window.electronAPI) {
      console.error('window.electronAPI is not defined');
      return;
    }
    window.electronAPI.rxdb.addDemo(demo);
    setDemo('');
  }

  return (
    <div>
      <input type="text" name="name" value={demo} placeholder="Demo Table" onChange={handleChange}/>
      <button onClick={addDemo}> Add Todo</button>
    </div>
  );
}