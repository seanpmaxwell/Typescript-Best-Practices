# TypeScript Best Practices

[![GitHub stars](https://img.shields.io/github/stars/seanpmaxwell/Typescript-Best-Practices?style=flat-square)](https://github.com/seanpmaxwell/Typescript-Best-Practices/stargazers)

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
- [Organizing Shared Code](#organizing-shared-code)
- [Philosophy](#philosophy)

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

Separate regions with:

```ts
/******************************************************************************
                        RegionName (i.e. Constants)
******************************************************************************/
```

Regions can be divided further into sections:

```ts
// **** Configured Functions **** //

const someConfiguredFn = createAsyncThunk(...do stuff);

// **** Function Declarations **** //

function getUserName(userId: number) { isValidUser(id) ...do stuff }
function getUserEmail(userId: number) { isValidUser(id) ...do stuff }
```

Comments in functions:
- Generally you should not put spaces in functions and separate chunks of logic with a single inline comment.
- If you have a really large function that can't can't be broken up (i.e. React Component or a linear script with a bunch of async/await line) the you can further separate functions with a space and `// ** "Info" ** //`

```ts
/**
 * Normal everyday javascript function.
 */
function normalFunction() {
  // Do stuff
  foo();
  bar();
  // Do more stuff
  blah();
  whatever();
}

// Self executing startup script that needs to be wrapped
// in and async function so we use away
(async () => {
  try {
    // ** Do stuff ** //
    foo();
    bar();
    ...several more lines of code

    // ** Do more stuff **//
    blah();
    whatever();
    ...several more lines of code

  } catch (err) {
    handleErrorObject(err);
  }
})()
```

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

People coming from strict OOP environments (like Java) tend to overuse classes, but they do make sense in some situtations. Here are some basic guidelines:

- **Use a class** when you need an **identity (instance)** that persists over time and you need to do **mutations** on that data.  
  Avoid classes used solely as **namespaces**.
- **Use a factory function** when you’re **assembling and returning an object whose behavior is fully determined at creation time**, often via **closures**, with no meaningful **lifecycle** or need for `this`.
- **NOTE:**  
 - I also would recommend avoiding **classes for handling IO data** (even when OOP makes sense), because this often leads to:
  - Many unnecessary **constructor calls** to support dynamic behavior, or
  - A large number of identical `public static` functions

A simpler approach is to handle IO data using **modular object scripts** and describing them with **interfaces**.


#### Enums

Enums emit runtime JavaScript and are discouraged in modern TypeScript configurations. Prefer static objects instead:

```ts
const USER_ROLES = {
  Basic: 0,
  Admin: 1,
  Owner: 2,
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
- **Files**:
  - **Inventory / Linear scripts**: `kebab-case`
  - **Modular object / Declaration scripts**: name after the item being exported
- **Constants**: `UPPER_SNAKE_CASE`
- **Variables**: `camelCase`
- **Classes / Types**: `PascalCase`
  - You can prepend an interface with an `I` for scenarios where you might have a type/value naming conflict: ie. `class Dog implements IDog`.
- **Booleans**: prefix with `is` or `has`

---

## Comments

- Place `/** */` above all function declarations.
- Use `//` for inline explanations.
- Capitalize and punctuate comments.
- Separate logical regions clearly.

---

## Imports

- Group imports by origin: libraries → application → local.
- Split long import lists across multiple lines.

---

## Examples

### Modular Object

```ts
const mailer = someThirdPartyMailerLib("your settings");

function sendMail(options: MailerOptions): Promise<void> {
   await mailer.send(options);
}

function sendSupportStaffEmail(options: MailerOptions): Promise<void> {
   await mailer.send({ ...options, to: process.env.SUPPORT_STAFF_EMAIL });
}

export default {
  sendMail,
  sendSupportStaffEmail,
} as const;
```

### Inventory

```tsx
export function SubmitButton() {
  return <button>Submit</button>;
}

export function CancelButton() {
  return <button color="red">Submit</button>;
}

export function CloseButton() {
  return <button color="grey">Close</button>;
}
```

### Linear Script

```ts
import express from 'express';

const app = express(); 

app.use(middleware1);
app.use(middleware2);

doSomething();
doSomethingElse();

export default app;
```


### Declaration

```typescript
// ENV_VARS.ts

export default {
    port: process.env.PORT,
    host: process.env.Host,
    databaseUsername: process.env.DB_USERNAME,
    ...etc,
} as const;
```

---

## Testing

- Unit-test all user-driven behavior.
- Developers should write their own tests.
- Integration tests should be focused and minimal early on.
- Tests improve readability as well as correctness.

---

## Organizing shared code
- In a directory with shared content create a subfolder named `common/`.
- Start off by adding the following files as needed
  - `utils.ts`: logic that needs to be executed (standalone functions or modular-objects)
  - `constants.ts`: static items
  - `types.ts`: types only no values
  - Depending on the nature of your project you could have more. A react app for example could also include:
    - `components/`
    - `hooks/`
- If any of these files becomes too large, create a folder of the same name, rename the file to `index.ts` and place it there along with its adjacent content:
  - `common/`
    - `constants.ts`
    - `utils/` <-- `utils.ts` grew too large so we separated it into `index.ts` and `StringUtils.ts`
      - `index.ts`
      - `StringUtils.ts`
    - `types.ts`
- If you have something that isn't shared but you don't want it to go in the file that it is used in for whatever reason create another subfolder called `aux/`and place it there.
  - `routes/`
    - `aux/`
      - `postToPdf.ts` <-- Only used in the `PostRoutes.ts` file but large enough to separate out.
    - `support/`
    - `PostRoutes.ts`
    - `UserRoutes.ts`
- Try to avoid giving folders names like `misc/`, `helpers/`, `shared/` etc. as these can quickly become dumping grounds.
  
---

## Philosophy

This guide favors:

- Explicitness over cleverness  
- Simplicity over abstraction  
- Consistency over novelty  

It is designed to scale with real-world TypeScript applications.

---
