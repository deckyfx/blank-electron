import AddTodo from "./AddTodo";
import TodoList from "./TodoList";
import Setup from "./Setup";

import packageJson from "../../../package.json";

export default function RxDBView() {
  return (
    <div>
      <h1>RxDB Premium Test {packageJson.version}</h1>
      <Setup />
      <AddTodo />
      <TodoList />
    </div>
  );
}
