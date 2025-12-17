# TypeScript Best Practices

[![GitHub stars](https://img.shields.io/github/stars/seanpmaxwell/Typescript-Best-Practices?style=flat-square)](https://github.com/seanpmaxwell/Typescript-Best-Practices/stargazers)
[![License](https://img.shields.io/github/license/seanpmaxwell/Typescript-Best-Practices?style=flat-square)](LICENSE)

Patterns and best practices for **procedural TypeScript / JavaScript development**, guided by the **Rule of 4** principle.

> This guide is intentionally opinionated. It prioritizes clarity, consistency, and long-term maintainability over abstraction or novelty.

---

## Table of Contents

- [Fundamental Concepts](#fundamental-concepts)
- [Script Types](#script-types)
- [File Organization](#file-organization)
- [Core Language Features](#core-language-features)
  - [Primitives](#primitives)
  - [Functions](#functions)
  - [Objects](#objects)
    - [Object Literals](#object-literals)
    - [Classes](#classes)
    - [Enums](#enums)
  - [Types](#types)
- [Naming Conventions](#naming-conventions)
- [Comments](#comments)
- [Imports](#imports)
- [Examples](#examples)
- [Style Guidelines](#style-guidelines)
- [Testing](#testing)
- [Philosophy](#philosophy)
- [License](#license)

---

## Fundamental Concepts

This guide revolves around four fundamental language features:

- **Primitives**
- **Functions**
- **Objects**
- **Types**

These concepts form the foundation of all JavaScript and TypeScript programs. Mastering them—and using them consistently—results in code that is easier to read, reason about, and maintain.

---

## Script Types

Every file should have a clear purpose. Most scripts fall into one of the following categories:

- **Declaration**  
  Exports a single declared item (e.g., a constant, enum, or configuration object).

- **Modular Object**  
  Exports a default object literal that groups closely related logic.

- **Inventory**  
  Exports multiple independent declarations, such as shared types or utilities.

- **Linear**  
  Executes a series of commands, often for setup or initialization.

---

## File Organization

Files should generally be organized into clearly defined regions:

1. Constants  
2. Types  
3. Setup / Execution  
4. Components (`.jsx` / `.tsx`)  
5. Functions  
6. Exports  

Place `export default` at the **very bottom** of the file to make the public API immediately obvious.

---

## Core Language Features

### Primitives

JavaScript primitives include:

`null`, `undefined`, `boolean`, `number`, `string`, `symbol`, and `bigint`.

Understand **type coercion**: when calling methods on primitives, JavaScript temporarily wraps them in their object counterparts (`String`, `Number`, `Boolean`).

`symbol` is particularly useful for defining unique object keys in shared or library code.

---

### Functions

- Prefer **function declarations** at the file level to take advantage of hoisting.
- Use **arrow functions** for callbacks and inline logic.
- Avoid parentheses around single arrow-function parameters.

```ts
function parentFn(param: string) {
  const childFn = value => doSomething(value);
  const childFn2 = (a, b) => doSomethingElse(a, b);
}
```

Use object-literal methods when `this` should refer to the object itself.

---

### Objects

Objects are collections of key/value pairs created via:

- Object literals
- Classes
- Enums

Avoid legacy constructor functions (`new Fn()`) in favor of modern class syntax.

#### Object Literals

Object literals are ideal for organizing related logic and are often preferable to classes.

```ts
export default {
  foo,
  bar,
} as const;
```

#### Classes

Use classes only when they satisfy the **M.I.N.T. principle**:

- **Multiple instances**
- **Not serialized**
- **Tightly coupled data and behavior**

Avoid classes used solely as namespaces.

#### Enums

Enums emit runtime JavaScript and are discouraged in modern TypeScript configurations. Prefer bi-directional objects instead:

```ts
const USER_ROLES = {
  Basic: 0,
  Admin: 1,
  Owner: 2,
  0: "Basic",
  1: "Administrator",
  2: "Owner",
} as const;
```

---

### Types

- Prefer `interface` for object shapes.
- Use `type` for unions, primitives, and utility types.
- Place type aliases above interfaces.

```ts
type TRole = "basic" | "admin";

interface IUser {
  id: number;
  name: string;
  role: TRole;
}
```

---

## Naming Conventions

- **Folders**: `kebab-case`
- **Files**: match the primary export
- **Constants**: `UPPER_SNAKE_CASE`
- **Variables**: `camelCase`
- **Classes / Types**: `PascalCase`
  - **Interfaces**: prefix with an `I`
  - **Type Aliases (that are not utility types)**: prefix with a `T`
- **Booleans**: prefix with `is` or `has`

---

## Comments

- Use JSDoc for all function declarations.
- Use `//` for inline explanations.
- Capitalize and punctuate comments.
- Separate logical regions clearly.

---

## Imports

- Group imports by origin: libraries → application → local.
- Use spacing generously.
- Split long import lists across multiple lines.

---

## Examples

### Modular Object

```ts
export default {
  sendMail,
  sendSupportStaffEmail,
} as const;
```

### Inventory

```tsx
export function CloseButton() {
  return <button>Close</button>;
}
```

### Linear Script

```ts
const app = express();
app.listen(3000);

export default app;
```

---

## Style Guidelines

- Prefer optional chaining (`?.`) and nullish coalescing (`??`).
- Place variables on the left side of comparisons.
- Format complex boolean expressions vertically.
- Keep object literals compact when passed as arguments.

---

## Testing

- Unit-test all user-driven behavior.
- Developers should write their own tests.
- Integration tests should be focused and minimal early on.
- Tests improve readability as well as correctness.

---

## Philosophy

This guide favors:

- Explicitness over cleverness  
- Simplicity over abstraction  
- Consistency over novelty  

It is designed to scale with real-world TypeScript applications.

---

## License

MIT © Sean Maxwell
