import { CoreError, CustomError } from "@utils/error";

type AnyError = Error | CustomError | CoreError;

type Success<T> = [T, undefined];
type Failure<E> = [undefined, E];
type Result<T, E = AnyError> = Success<T> | Failure<E>;
type MaybePromise<T> = T | Promise<T>;

export function tryCatch<T, E = AnyError>(
  arg: () => Promise<T>,
): Promise<Result<T, E>>;
export function tryCatch<T, E = AnyError>(arg: () => T): Result<T, E>;
export function tryCatch<T, E = AnyError>(
  arg: Promise<T>,
): Promise<Result<T, E>>;
export function tryCatch<T, E = AnyError>(
  arg: (() => MaybePromise<T>) | Promise<T>,
): Result<T, E> | Promise<Result<T, E>> {
  if (typeof arg === "function") {
    try {
      const result = (arg as () => MaybePromise<T>)();
      if (result instanceof Promise) {
        return result
          .then((data) => [data, undefined] as Success<T>)
          .catch((error) => [undefined, error] as Failure<E>);
      } else {
        return [result, undefined];
      }
    } catch (error) {
      return [undefined, error] as Failure<E>;
    }
  } else {
    return arg
      .then((data) => [data, undefined] as Success<T>)
      .catch((error) => [undefined, error] as Failure<E>);
  }
}
