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

// * RxDB and RxDB Premium must be imported as require, not import

const { createRxDatabase, addRxPlugin } = require("rxdb");
const {
  getRxStorageSQLite,
  getSQLiteBasicsNode,
} = require("rxdb-premium/plugins/storage-sqlite");

import sqlite3 from "sqlite3";

const {
  wrappedKeyEncryptionCryptoJsStorage,
} = require("rxdb/plugins/encryption-crypto-js");
const {
  wrappedValidateAjvStorage,
} = require("rxdb/plugins/validate-ajv");
const {
  RxDBMigrationSchemaPlugin,
} = require("rxdb/plugins/migration-schema");
const { RxDBDevModePlugin } = require("rxdb/plugins/dev-mode");

addRxPlugin(RxDBDevModePlugin);
addRxPlugin(RxDBMigrationSchemaPlugin);

let RXDB: any | null = null;

// * Storage must be declared as global var, and should be made sure only created ONCE during running application
const STORAGE = getRxStorageSQLite({
  sqliteBasics: getSQLiteBasicsNode(sqlite3),
  queryModifier: (queryWithParams: any) => {
    return queryWithParams;
  },
  // log: console.log.bind(console),
});

const VALIDATED_STORAGE = wrappedValidateAjvStorage({
  storage: STORAGE,
});

const ENCRYPTED_STORAGE = wrappedKeyEncryptionCryptoJsStorage({
  storage: VALIDATED_STORAGE,
});

const todoSchema = {
  version: 1,
  primaryKey: "id",
  type: "object",
  properties: {
    id: {
      type: "string",
      maxLength: 100, // <- the primary key must have maxLength
    },
    name: {
      type: "string",
    },
    done: {
      type: "boolean",
    },
    nested: {
      type: "object",
      properties: {
        foo: {
          type: "string",
        },
        bar: {
          type: "string",
        },
        nested: {
          type: "object",
          properties: {
            foo: {
              type: "string",
            },
            bar: {
              type: "string",
            },
          },
        },
      },
    },
    timestamp: {
      type: "string",
    },
  },
  required: ["id", "name", "done", "timestamp"],
};

let collections: {
  todos: any;
} | null = null;

async function initRxDB() {
  try {
    if (RXDB) {
      console.log("Do not re init rxdb");
      return;
    }
    console.log("init rxdb");

    RXDB = await createRxDatabase({
      name: "grandedb",
      multiInstance: false, // <- Set multiInstance to false when using RxDB in React Native
      storage: ENCRYPTED_STORAGE,
      ignoreDuplicate: true,
    });
    console.log("rxdb created");
  } catch (e: any) {
    console.log("initRxDB error", e);
  }
  await initCollections();
}

async function initCollections() {
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
          schema: todoSchema,
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
    console.log("No migration needed");
    if (!needed) return;

    // start the migration
    collections.todos.startMigration(10); // 10 is the batch-size, how many docs will run at parallel
    const migrationState = collections.todos.getMigrationState();
    // 'start' the observable
    migrationState.$.subscribe(
      (state: any) => console.dir(state),
      (error: any) => console.error(error),
      () => console.log("done")
    );
    console.log("collections migrated");
  } catch (e: any) {
    console.log("initCollections error", e);
  }
}

export async function write() {
  try {
    if (!collections?.todos) {
      throw new Error("todos collection not found");
    }
    const myDocument = await collections?.todos.insert({
      id: String(new Date().getTime()),
      name: "Learn RxDB",
      done: false,
      timestamp: new Date().toISOString(),
      nested: {
        foo: "bar",
        bar: "foo",
        nested: {
          foo: "bar",
          bar: "foo",
        },
      },
    });

    console.log("Inserted", myDocument);
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
    const results = await query?.exec();
    console.log("foundDocuments", JSON.stringify(results));
    return results;
  } catch (e: any) {
    console.log("read error", e);
  }
}

export default initRxDB;
