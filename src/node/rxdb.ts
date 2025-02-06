/* Working Dependencies
"dependencies": {
  "react": "18.3.1",
  "react-native": "0.75.4",
  "react-native-quick-sqlite": "8.0.6",
  "rxdb": "15.37.0",
  "rxdb-premium": "15.37.0",
  "rxjs": "7.8.1"
},
must hack:
  node_modules/react-native-quick-sqlite/android/build.gradle

  minSdkVersion 23 
*/

// * Must add no check to ignore typing errors during build, it is false positive warnings
// @ts-nocheck

import sqlite3 from "sqlite3";

import * as rxdb from "rxdb";
import * as rxdb_crypto from "rxdb/plugins/encryption-crypto-js";
import * as rxdb_validate from "rxdb/plugins/validate-ajv";
import * as rxdb_migration from "rxdb/plugins/migration-schema";
import * as rxdb_devmode from "rxdb/plugins/dev-mode";

import * as rxdb_sqlite from "rxdb-premium/plugins/storage-sqlite";

import { RxTodo, RxTodoSchema } from "../types/models";
import { createReplicator } from "./replicator";

rxdb.addRxPlugin(rxdb_devmode.RxDBDevModePlugin);
rxdb.addRxPlugin(rxdb_migration.RxDBMigrationSchemaPlugin);

let RXDB: rxdb.RxDatabase | null = null;

// * Storage must be declared as global var, and should be made sure only created ONCE during running application
const STORAGE = rxdb_sqlite.getRxStorageSQLite({
  sqliteBasics: rxdb_sqlite.getSQLiteBasicsNode(sqlite3),
  queryModifier: (queryWithParams: rxdb_sqlite.SQLiteQueryWithParams) => {
    return queryWithParams;
  },
  // log: console.log.bind(console),
});

const VALIDATED_STORAGE = rxdb_validate.wrappedValidateAjvStorage({
  storage: STORAGE,
});

const ENCRYPTED_STORAGE = rxdb_crypto.wrappedKeyEncryptionCryptoJsStorage({
  storage: VALIDATED_STORAGE,
});

let collections: {
  todos: rxdb.RxCollection;
} | null = null;

async function initRxDB(readyEvent: Electron.IpcMainInvokeEvent, path: string) {
  try {
    if (RXDB) {
      console.log("Do not re init rxdb");
      return;
    }
    console.log("init rxdb");

    RXDB = await rxdb.createRxDatabase({
      name: path,
      multiInstance: false, // <- Set multiInstance to false when using RxDB in React Native
      storage: ENCRYPTED_STORAGE,
      ignoreDuplicate: true,
      password: "12345678",
    });
    console.log("rxdb created");
  } catch (e: any) {
    console.log("initRxDB error", e);
  }
  await initCollections(readyEvent);
}

async function initCollections(readyEvent: Electron.IpcMainInvokeEvent) {
  try {
    if (!RXDB) {
      console.log("RXDB Not Initialized");
      return;
    }
    if (collections?.todos) {
      console.log("Do not re init collections");
      return;
    }
    console.log("init collections");

    collections =
      (await RXDB?.addCollections({
        todos: {
          schema: RxTodoSchema,
          autoMigrate: false, // <- migration will not run at creation
          migrationStrategies: {
            1: function (oldDoc: any) {
              return oldDoc;
            },
          },
        },
      })) || null;

    // check if migration is needed

    console.log("collections created");

    if (!collections?.todos) {
      throw new Error("todos collection not found");
    }

    const needed = await collections.todos.migrationNeeded();

    if (needed) {
      console.log("migrating collection");
      // start the migration
      collections.todos.startMigration(10); // 10 is the batch-size, how many docs will run at parallel
      const migrationState = collections.todos.getMigrationState();
      // 'start' the observable
      migrationState.$.subscribe(
        (state: any) => console.dir(state),
        (error: any) => console.error(error),
        () => console.log("done")
      );
    }

    console.log("creating replication state");
    const replicationState = await createReplicator<RxTodo>(
      collections.todos,
      "todos-replicator"
    );

    readyEvent.sender.send("rxdb-ready", "ready");
    return replicationState;
  } catch (e: any) {
    console.log("initCollections error", e);
  }
}

export async function write() {
  try {
    if (!collections?.todos) {
      throw new Error("todos collection not found");
    }

    const data: RxTodo = {
      id: String(new Date().getTime()),
      name: "Learn RxDB",
      done: false,
      timestamp: new Date().getTime(),
    };

    const myDocument = await collections?.todos.insert(data);
  } catch (e: any) {
    console.log("write error", e);
  }
}

export async function read() {
  try {
    if (!collections?.todos) {
      throw new Error("todos collection not found");
    }
    const query = collections?.todos.find({
      selector: {
        done: {
          $eq: false,
        },
      },
    });
    const results = (await query?.exec()) as RxTodo[];
    return results;
  } catch (e: any) {
    console.log("read error", e);
    return [];
  }
}

export async function addTodo(todo: string): Promise<Error | undefined> {
  try {
    if (!collections?.todos) {
      throw new Error("todos collection not found");
    }

    const data: RxTodo = {
      id: String(new Date().getTime()),
      name: todo,
      done: false,
      timestamp: new Date().getTime(),
    };

    const myDocument = await collections?.todos.insert(data);

    return;
  } catch (e: any) {
    console.log("write error", e);
    return e as Error;
  }
}

let querySub: any = null;
export async function listenTodo(event: Electron.IpcMainEvent) {
  if (!collections?.todos) {
    throw new Error("todos collection not found");
  }
  querySub?.unsubscribe();
  const query = collections.todos.find();
  querySub = query.$.subscribe((results: RxTodo[]) => {
    event.sender.send("todos-changed", JSON.stringify(results));
  });
}

export async function stopListenTodo() {
  querySub?.unsubscribe();
}

export async function toggleDone(todo: RxTodo) {
  if (!collections?.todos) {
    throw new Error("todos collection not found");
  }
  const query = collections.todos.findOne({
    selector: {
      id: {
        $eq: todo.id,
      },
    },
  });
  const found = await query.exec(true);
  await found.patch({
    done: !found.done,
  });
}

export async function deleteTodo(todo: RxTodo) {
  if (!collections?.todos) {
    throw new Error("todos collection not found");
  }
  const query = collections.todos.findOne({
    selector: {
      id: {
        $eq: todo.id,
      },
    },
  });
  const found = await query.exec(true);
  await found.remove();
}

export default initRxDB;
