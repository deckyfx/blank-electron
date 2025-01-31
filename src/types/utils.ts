export type CustomError = new (message?: string) => Error;

export class CommonError extends Error {
  constructor(message: string) {
    super(message);
  }
}

export function catchError<T, E extends CustomError>(
  promise: Promise<T>,
  errors?: E[],
): Promise<[undefined, T] | [InstanceType<E>]> {
  return promise
    .then(data => {
      return [undefined, data] as [undefined, T];
    })
    .catch(error => {
      if (errors === undefined) {
        return [error];
      }
      if (errors.some(e => error instanceof e)) {
        return [error];
      }
      throw error;
    });
}

export function isCustomError(error: unknown): error is CustomError {
  return error instanceof ((message?: string) => Error);
}
