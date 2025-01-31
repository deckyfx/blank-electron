export type Nullable<T = any> = T | null;

export type WithDeleted<T> = T & {
  deleted: boolean;
};

export type RxCheckpoint = {
  id: string;
  updatedAt: number;
};

export type RxChangeRow<T = any> = {
  assumedMasterState?: WithDeleted<T>;
  newDocumentState: WithDeleted<T>;
};

export type RxPullArgument = {
  checkpoint: RxCheckpoint;
  limit: number;
};

export type RxPullResponse<T = any> = {
  documents: WithDeleted<T>[];
  checkpoint: Nullable<RxCheckpoint>;
};

export type RxPushArgument<T = any> = {
  rows: RxChangeRow<T>[];
};

export type RxPushResponse<T = any> = {
  conflicts: T[];
  conflictMessages: string[];
  documents: T[];
  checkpoint: RxCheckpoint;
};

export type RxTodo = {
  id: string;
  name: string;
  done: boolean;
  timestamp: number;
};

export const RxTodoSchema = {
  version: 1,
  primaryKey: "id",
  type: "object",
  properties: {
    id: {
      type: "string",
      maxLength: 100, // <- the primary key must have set maxLength
    },
    name: {
      type: "string",
    },
    done: {
      type: "boolean",
    },
    timestamp: {
      type: "number",
    },
  },
  required: ["id", "name", "done", "timestamp"],
  encrypted: ["name"],
  // additionalProperties: true, //* Allow additional properties?
} as const;

export type PullTodoResponse = {
  data: {
    pullTodo: RxPushResponse;
  };
};

export type PushTodoResponse = {
  data: {
    pushTodo: RxPushResponse;
  };
};
