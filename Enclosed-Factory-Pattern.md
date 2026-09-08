
```ts
interface IUser {
  id(): number;
  name(): string;
  name(name: string): void;
  name(name?: string): string | void;
}

interface UserDTO {
  id: number;
  name: string;
}

// ================== Module Functions ========

function of(name: string): IUser {
  return create({ name });
}

function from(val: unknown): IUser {
  if (!is(val)) throw new Error('val was not a valid User state');
  // Reconstituting existing, already-valid state (e.g. from storage) —
  // this is not "creation," so the existing id is preserved as-is.
  return encloseState(val);
}

function create(other: Partial<UserDTO> = {}): IUser {
  const full: UserDTO = {
    ...getDefaultState(),
    ...other,
    id: getRandomNumber(), // must be random-number for every new object
  };
  return encloseState(full);
}

function is(val: unknown): val is UserDTO {
  if (val === null || typeof val !== 'object') return false;
  const obj = val as Record<string, unknown>;
  if (!('id' in obj) || typeof obj.id !== 'number' || !Number.isInteger(obj.id) || obj.id < 0) {
    return false;
  }
  if (!('name' in obj) || typeof obj.name !== 'string' || obj.name.length === 0) {
    return false;
  }
  return true;
}

function getDefaultState(): UserDTO {
  return {
    id: getRandomNumber(),
    name: '--',
  };
}

function encloseState(val: UserDTO): IUser {
  const state = { ...val };
  return {
    id: () => state.id,
    name: (name?: string) => _name(state, name),
  };
}

// ====================== Instance Functions 

function _name(state: UserDTO, name?: string): string | void {
  if (name === undefined) return state.name;
  if (typeof name !== 'string' || name.length === 0) {
    throw new Error('name must be a non-empty string');
  }
  state.name = name;
  return;
}

// ====================== Export

export default {
  of,
  from,
  create,
  is,
} as const;
```
