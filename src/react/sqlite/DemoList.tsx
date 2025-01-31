import { useState, useEffect } from "react";

export default function DemoList() {
  const [demos, setDemos] = useState<any[]>([]);

  useEffect(() => {}, []);

  async function loadDemos() {
    if (!window.electronAPI) {
      console.error("window.electronAPI is not defined");
      return;
    }
    const result = await window.electronAPI.rxdb.loadDemos();
    console.log(result);
    setDemos(JSON.parse(result) as any[]);
  }

  function mappedDemos() {
    return demos.map((todo, index) => {
      return <li key={index}>{todo.name}</li>;
    });
  }

  return (
    <div>
      <button onClick={loadDemos}>Load Demo</button>
      <ul>{mappedDemos()}</ul>
    </div>
  );
}
