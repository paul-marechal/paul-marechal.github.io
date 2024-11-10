export type MaybePromise<T> = T | PromiseLike<T>;

export function as<T>(value: T): T {
  return value;
}
