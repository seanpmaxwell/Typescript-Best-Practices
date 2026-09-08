
### Method 1 - Using closer-functions. Fine for the vast majority of real-world scenarios
```ts
interface IUser {
  id(): number;
  name(): string;
  name(name: string): void;
  name(name?: string): string | void;
}

interface UserState {
  id: number;
  name: string;
}

// ================== Module Functions ========

function of(name: string): IUser {
  return create({ name });
}

function from(val: unknown): IUser {
  if (!is(val)) throw new Error('val was not a valid User state');
  const state = { ...val, id: getRandomNumber() };
  return create(val);
}

function create(other: Partial<Omit<UserState, 'id>> = {}): IUser {
  const state: UserDTO = {
    id: getRandomNumber(),
    name: other.name ?? '--',
  };
  return {
    id: () => state.id,
    name: (val?: string) => name(state, val),
  }
}

function copy(other: UserState): IUser {
  const _new = create(other);
  return _new.id = other.id;
}

// 
function is(val: unknown): val is UserState {
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

// ====================== Instance Functions ============ 

function name(state: UserState, val?: string): string | void {
  if (val === undefined) return state.name;
  if (typeof val !== 'string' || val.length === 0) {
    throw new Error('name must be a non-empty string');
  }
  state.name = val;
  return;
}

// ====================== Export ================

export default {
  of,
  from,
  create,
  copy,
  is,
} as const;
```


### Method 2 - Using state-map. If performance is an issue with recreating closer-functions
> Unless you call `.bind` this approach will break when destructuring. 
```ts
interface IUser {
  id(): number;
  name(): string;
  name(name: string): void;
  name(name?: string): string | void;
}

interface UserState {
  id: number;
  name: string;
}

// ================== Init

const _stateMap = new WeakMap<IUser, UserState>();

// ================== Module Functions ========

function of(name: string): IUser {
  return create({ name });
}

function from(val: unknown): IUser {
  if (!is(val)) throw new Error('val was not a valid User state');
  const state = { ...val, id: getRandomNumber() };
  return create(val);
}

function create(other: Partial<Omit<UserState, 'id'>> = {}): IUser {
  const state: UserDTO = {
    id: getRandomNumber(),
    name: other.name ?? '--',
  };
  const proto: IUser = {
    id,
    name,
  };
  _stateMap.set(proto, state);
  proto.id = proto.id.bind(proto);
  proto.name = proto.name.bind(proto);
  return proto;
}

// 
function is(val: unknown): val is UserState {
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

// ====================== Instance Functions ============ 

function id(this: IUser): number {
  return _stateMap.get(this).id;
}

function name(this: IUser, val?: string): string | void {
  const state = _stateMap.get(this);
  if (val === undefined) return state.name;
  if (typeof val !== 'string' || val.length === 0) {
    throw new Error('name must be a non-empty string');
  }
  state.name = val;
  return;
}

// ====================== Export ================

export default {
  of,
  from,
  create,
  is,
} as const;
```
