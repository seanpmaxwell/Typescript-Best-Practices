## Design Rules: Class vs Factory vs Module

> While there are multiple approaches to doing OOP in TypeScript, to keep things simple and consistent, use procedural programming by default (and in most situations) and use classes for OOP. The following sections explain scenarios about when to use each with examples.

> **Note:** there is a sub-paradigm of procedural programming called **procedural-modular** programming which means grouping functions together into some kinda of container (i.e. `namespace` keyword in C). Most large procedural applcations will use this as well. 

---

### ✅ Use a **class (OOP)** when **all (or most)** of these are true

- The object represents a **specific instance** (a "thing")
- That instance has **internal state that evolves over time**
- Methods **act on and mutate** that state
- Recreating the object would **lose meaningful information**
- You would naturally say **"this instance"** in conversation

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
<br/>

### ✅ Use a factory function (procedural) when all (or most) of these are true

- Behavior is fully determined at creation time
- Configuration is captured via closures
- The returned object is immediately valid
- There is no meaningful lifecycle
- Recreating it produces an equivalent result
- There is no real need for `this`, *inheritance*, or `instanceof`
- Useful for libraries which have a single initialization step

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
<br/>

### ✅ Use a modular-object script (procedural-modular) when
- The code is primarily IO or data transformation
- Operations are stateless or procedural
- There is no instance identity at all
- Classes would just end up acting as namespaces
- Data is described with interfaces/types, not behavior

**Example**
```ts
// User.ts

export interface IUser {
  id: string;
  name?: string;
}

function printName(user: IUser): void {
  console.log(user.name ?? '--');
}

export {
  printName,
} as const;
```

**Typical use cases**
- Shared utility functions
- Handling IO data
- Forming the layers of a micro-services application.
