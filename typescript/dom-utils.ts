export function getById(id: string): HTMLElement;
export function getById<T extends HTMLElement>(id: string, type: new() => T): T;
export function getById(id: string, type = HTMLElement): HTMLElement {
  const element = document.getElementById(id);
  if (element == null) {
    throw new TypeError(`no element with id=${id}!`);
  }
  if (element instanceof type) {
    return element;
  }
  throw new TypeError(`element is not of type ${type.name}!`);
}
