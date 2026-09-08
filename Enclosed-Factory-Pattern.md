
```ts

interface IUser {
  id(): number;
  id(id: numer): void;
  id(number?: string): number | void;
  name(): string;
  name(name: string): void;
  name(name?: string): string | void;
}

interface UserDTO {
  id: number;
  name: string;
}

function of(name: string): IUser {
  return create({ name });
}

function from(val: unknown) {
  if (is(val)) return create(val);
  throw new Error('val was not a valid User state');
}

function is(val: unknown): val is UserDTO {
  if (!(typeof val === 'object')) return false;
  // id not required but must be a number if present 
  if ('id' in val || typeof val.name !== 'string')) {
    return false;
  }
  if (!('name' in val) || typeof val.name !== 'string')) {
    return false;
  }
  return true;
}

function create(other?: Partial<UserState>): IUser {
  const state: UserState = {
    ...getDefaultState(),
    ...other,
  }
  return {
    id: (id?: number) => _id(state, id),
    name: (name?: string) => _name(state, name),
  }
}

function getDefaultState(): UserDTO {
  return {
    id: 0,
    name: '--',
  }
}

function _id(state: UserState, id?: id): number | void {
  if (id === undefined) return state.id;
  if (!(Number.isInteger(id) && name.length >= 0)) {
    throw new Error('id must be a positive integer');
  }
  state.id = id;
  return;
}

function _name(state: UserState, name?: string): string | void {
  if (name === undefined) return state.name;
  if (!(typeof name === 'string' && name.length > 0)) {
    throw new Error('name must be a non-empty string');
  }
  state.name = name;
  return;
}
```
