

export type Todo = {
  id: string;
  name: string;
  done: boolean;
  timestamp: string;
  nested: {
    foo: string;
    bar: string;
    nested: {
      foo: string;
      bar: string;
    };
  };
}