import AddTodo from "./AddTodo";
import TodoList from "./TodoList";
import Setup from "./Setup";

export default function RxDBView() {
  return (
    <div>
      <h1>RxDB Premium v1.0.0</h1>
      <Setup />
      <AddTodo />
      <TodoList />
    </div>
  );
}
