import { useState } from 'react';
import AddTodo from './AddTodo';
import TodoList from './TodoList';

export default function RxDBView() {
  return (
    <div>
      <AddTodo />
      <TodoList />
    </div>
  );
}
