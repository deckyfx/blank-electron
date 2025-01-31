import { LOGIN_TOKEN } from "../types/constants";

import {
  Nullable,
  PullTodoResponse,
  PushTodoResponse,
  RxChangeRow,
  RxCheckpoint,
  RxPullArgument,
  RxPushArgument,
} from "../types/models";

import { map } from "rxjs/operators";

import { gqlRequest } from "./gql-request";

import { Amplify } from "aws-amplify";

import { generateClient } from "aws-amplify/api";

const { replicateRxCollection } = require("rxdb/plugins/replication");

export async function createReplicator<T>(
  collection: any,
  name: string = "replication"
) {
  const authToken = `Bearer ${LOGIN_TOKEN}`;
  Amplify.configure({
    API: {
      GraphQL: {
        region: "us-east-1",
        endpoint:
          "https://atfm3z2ntbhuxc5b6gmlprbskq.appsync-api.us-east-1.amazonaws.com/graphql",
        defaultAuthMode: "lambda",
      },
    },
  });

  const normalClient = generateClient({
    authMode: "lambda",
    authToken,
  });

  const subscription = normalClient.graphql({
    query: `
      subscription StreamTodo {
        streamTodo {
          documents {
            id
            name
            done
            timestamp
            deleted
          }
          checkpoint {
            id
            updatedAt
          }
        }
      }
    `,
  }) as any;

  const replicationState = await replicateRxCollection({
    collection: collection,
    replicationIdentifier: name,
    pull: {
      async handler(
        checkpoint: Nullable<RxCheckpoint>,
        batchSize: number = 10
      ) {
        const updatedAt = checkpoint ? checkpoint.updatedAt : 0;
        const id = checkpoint ? checkpoint.id : "";

        const operationName = "PullTodo";
        const query = `
            query ${operationName}($checkpoint: Checkpoint, $limit: Int!) {
              pullTodo(checkpoint:$checkpoint, limit: $limit) {
                checkpoint {
                  id
                  updatedAt
                }
                documents {
                  deleted
                  id
                  name
                  timestamp
                  done
                }
              }
            }`;

        const [error, response] = await gqlRequest<
          PullTodoResponse,
          RxPullArgument
        >(query, operationName, {
          checkpoint: {
            id: id,
            updatedAt: updatedAt,
          },
          limit: batchSize,
        });

        if (error) {
          console.log(error);
          throw error;
        }

        return response.data.pullTodo;
      },
      stream$: subscription.pipe(
        map((data: any) => {
          return data.data.streamTodo;
        })
      ),
    },
    push: {
      async handler(changeRows: RxChangeRow<T>[]) {
        const operationName = "PushTodo";
        const query = `mutation ${operationName}($rows: [TodoInputPushRow!]!) {
                pushTodo(rows: $rows) {
                  checkpoint {
                    id
                    updatedAt
                  }
                  documents {
                    deleted
                    id
                    name
                    timestamp
                    done
                  }
                  conflicts {
                    deleted
                    id
                    name
                    timestamp
                    done
                  }
                }
              }`;
        const payload: RxPushArgument<T> = {
          rows: changeRows.map((row: RxChangeRow<T>) => {
            return {
              assumedMasterState: row.assumedMasterState,
              newDocumentState: row.newDocumentState,
            };
          }),
        };
        const [error, response] = await gqlRequest<
          PushTodoResponse,
          RxPushArgument<T>
        >(query, operationName, payload);
        if (error) {
          console.log(error);
          throw error;
        }
        return response.data.pushTodo.conflicts;
      },
    },

    live: true,
    retryTime: 5 * 1000,
    // waitForLeadership: true,
    autoStart: true,
    deletedField: "deleted",
  });

  replicationState.active$.subscribe((v: any) => {
    console.log("Replication active");
  });
  replicationState.canceled$.subscribe((v: any) => {
    console.log("Replication canceled");
  });
  replicationState.error$.subscribe(async (error: any) => {
    console.log("Replication error", error);
  });

  return replicationState;
}
