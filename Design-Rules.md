## Design Rules: Class vs Factory vs Module


### ✅ Use a **class** when **all (or most)** of these are true

- The object represents a **specific instance** (a “thing”)
- That instance has **internal state that evolves over time**
- Methods **act on and mutate** that state
- Recreating the object would **lose meaningful information**
- The object has a **lifecycle** (setup → use → change → teardown)
- You would naturally say **“this instance”** in conversation

**Example**
```ts
class Cache<K, V> {
  private store = new Map<K, V>();

  put(key: K, value: V) {
    this.store.set(key, value);
  }

  get(key: K): V | undefined {
    return this.store.get(key);
  }
}
```

**Typical use cases**
- Data structures (tree index, cache, graph)
- Connections (DB, socket, session)
- Stateful services


---

### ✅ Use a factory function when all (or most) of these are true

- Behavior is fully determined at creation time
- Configuration is captured via closures
- The returned object is immediately valid
- There is no meaningful lifecycle
- Recreating it produces an equivalent result
- There is no real need for `this`, *inheritance*, or `instanceof`

**Example**
```ts
function createLogger(level: "info" | "debug") {
  return {
    log(message: string) {
      if (level === "debug") {
        console.debug(message);
      } else {
        console.log(message);
      }
    },
  };
}
```

**Typical use cases**
- Loggers
- Configured clients
- Validators / formatters
- Feature-flag evaluators

---

### ✅ Use a modular-object script (plain functions + types) when
- The code is primarily IO or data transformation
- Operations are stateless or procedural
- There is no instance identity at all
- Classes would act as namespaces
- Data is described with interfaces/types, not behavior

**Example**
```ts
export interface IUser {
  id: string;
  name: string;
}

export function parseUser(json: string): IUser {
  return JSON.parse(json) as IUser;
}
```

**Typical use cases**
- File utilities
- HTTP helpers
- Parsing / serialization
- Environment variable loading
