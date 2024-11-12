export type MaybePromise<T> = T | PromiseLike<T>;

export function as<T>(value: T): T {
  return value;
}

export type ValueListener<T> = (value: T) => void;

export function value<T>(initial: T): MutableValue<T> {
  return new MutableValue(initial);
}

export interface Value<T> {
  readonly value: T;
  listen(listener: ValueListener<T>): void;
}

export class MutableValue<T> implements Value<T> {
  #value: T;
  #listeners = [] as ValueListener<T>[];

  get value() {
    return this.#value;
  }

  set value(newValue) {
    if (this.value !== newValue) {
      this.#value = newValue;
      this.#notifyListeners(this.#value);
    }
  }

  constructor(initial: T) {
    this.#value = initial;
  }

  listen(listener: ValueListener<T>): void {
    if (!this.#listeners.includes(listener)) {
      this.#listeners.push(listener);
    }
  }

  map<U>(map: (value: T) => U): Value<U> {
    return new DependentValue(this, map);
  }

  #notifyListeners(value: T): void {
    this.#listeners.forEach(listener => listener(value));
  }
}

export class DependentValue<T, U> implements Value<T> {
  #listeners = [] as ValueListener<T>[];
  #cached: T;

  constructor(dependency: Value<U>, map: (value: U) => T) {
    this.#cached = map(dependency.value);
    dependency.listen(value => {
      this.#cached = map(value);
      this.#notifyListeners(this.#cached);
    });
  }

  get value() {
    return this.#cached;
  }

  listen(listener: ValueListener<T>): void {
    if (!this.#listeners.includes(listener)) {
      this.#listeners.push(listener);
    }
  }

  #notifyListeners(value: T): void {
    this.#listeners.forEach(listener => listener(value));
  }
}
