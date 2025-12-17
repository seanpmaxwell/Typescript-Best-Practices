# TypeScript Best Practices 📋

[![GitHub stars](https://img.shields.io/github/stars/seanpmaxwell/Typescript-Best-Practices?style=flat-square)](https://github.com/seanpmaxwell/Typescript-Best-Practices/stargazers)
[![License](https://img.shields.io/github/license/seanpmaxwell/Typescript-Best-Practices?style=flat-square)](LICENSE)
[![CI](https://img.shields.io/github/actions/workflow/status/seanpmaxwell/Typescript-Best-Practices/ci.yml?style=flat-square)](https://github.com/seanpmaxwell/Typescript-Best-Practices/actions)

Patterns and best practices for **procedural TypeScript / JavaScript development**, following the **Rule of 4** principle.

> Opinionated, practical guidance focused on clarity, maintainability, and long-term scalability.

---

## Table of Contents

- [4 Fundamental Features](#4-fundamental-features)
- [4 Types of Scripts](#4-types-of-scripts)
- [Script (File) Organization](#script-file-organization)
- [4 Fundamental Features in Detail](#4-fundamental-features-in-detail)
  - [Primitives](#primitives)
  - [Functions](#functions)
  - [Objects](#objects)
    - [Object Literals](#object-literals)
    - [Classes](#classes)
    - [Enums](#enums)
  - [Types](#types)
- [Naming](#naming)
  - [Files & Folders](#files--folders)
  - [General Notes](#general-notes)
  - [Functions](#functions-1)
  - [Objects](#objects-1)
  - [Types](#types-1)
- [Comments](#comments)
- [Imports](#imports)
- [Example Scripts](#example-scripts)
- [Miscellaneous Style](#miscellaneous-style)
- [Testing](#testing)
  - [General Notes](#general-notes-1)
  - [Structuring BDD-Style Tests](#structuring-bdd-style-tests)

---

## 4 Fundamental Features

The language is built around four fundamental features:

- **Primitives**
- **Functions**
- **Objects**
- **Types**

### Overview

- **Primitives**  
  `null`, `undefined`, `boolean`, `number`, `string`, plus `symbol` and `bigint`.

- **Functions**  
  Created via:
  - Function declarations
  - Arrow functions
  - Object-literal methods
  - Class methods

- **Objects**  
  Created via:
  - Object literals
  - Enums
  - Classes
  - Legacy constructor functions (`new Fn()`)

- **Types**  
  Defined using:
  - **Type aliases** (`type`)
  - **Interfaces** (`interface`)

> Although functions are technically objects, they are treated as a separate category for practical clarity.

---

## 4 Types of Scripts

Scripts (files) typically fall into one of these categories:

- **Declaration**  
  Exports a single declared value (e.g., `HttpStatusCodes.ts`).

- **Modular Object**  
  Exports a default object literal grouping related logic  
  (e.g., `UserRepo.ts`).

- **Inventory**  
  Exports many independent declarations  
  (e.g., shared `types.ts`).

- **Linear**  
  Executes a sequence of commands  
  (e.g., `setup-db.ts`).

---

## Script (File) Organization

Due to JavaScript hoisting behavior, files should generally be organized into the following regions (not all files need all regions):

1. Constants  
2. Types  
3. Run / Setup  
4. Components (`.jsx` / `.tsx`)  
5. Functions  
6. Export  

### Notes

- Only constants or readonly values belong in **Constants**.
- Linear scripts may group code by task, but function declarations should still appear below **Run / Setup**.
- Always place `export default` at the **very bottom** of the file.

### Organizational Hierarchy

- Project  
- Directory  
- File (module)  
- Region  
- Section  

---

## 4 Fundamental Features in Detail

### Primitives

Understand **type coercion**: JavaScript temporarily wraps primitives in their object counterparts (`String`, `Number`, `Boolean`) when invoking methods.

`symbol` is particularly useful for defining unique object keys in libraries.

---

### Functions

- Prefer **function declarations** at the file level (hoisting).
- Use **arrow functions** for callbacks and inner functions.
- Avoid parentheses around single arrow parameters.

```ts
function parentFn(param) {
  const childFn = value => doSomething(value);
  const childFn2 = (a, b) => doSomethingElse(a, b);
}

Object-literal methods preserve this, arrow functions do not:

const greeter = {
  prefix: "Hello ",
  sayHello(name: string) {
    console.log(this.prefix + name);
  },
  sayHelloAlt: (name: string) => {
    console.log(name);
  },
} as const;


⸻

Objects

Objects are collections of key/value pairs created via:
	•	Object literals
	•	Enums
	•	Classes

Constructor functions (new Fn()) are discouraged in favor of classes.

⸻

Object Literals
Object literals are ideal for organizing related logic and are often preferred over classes.

export default {
  foo,
  bar,
} as const;


⸻

Classes
Use classes only when they satisfy the M.I.N.T. principle:
	•	Multiple instances
	•	Not serialized
	•	Tightly coupled data and behavior

Avoid classes used solely as namespaces.

⸻

Enums
Enums emit runtime JavaScript and are discouraged with --erasableSyntaxOnly. Prefer bi-directional objects instead:

const USER_ROLES = {
  Basic: 0,
  Admin: 1,
  Owner: 2,
  0: "Basic",
  1: "Administrator",
  2: "Owner",
} as const;


⸻

Types
	•	Prefer interface for object shapes.
	•	Use type for unions, primitives, and utility types.
	•	Place type aliases above interfaces.

type TRole = "basic" | "admin";

interface IUser {
  id: number;
  name: string;
  role: TRole;
}


⸻

Naming

Files & Folders
	•	Folders: kebab-case
	•	Declaration scripts: filename matches export
	•	Modular-object scripts: PascalCase
	•	Inventory / Linear scripts: kebab-case
	•	Non-committed folders: __double_underscores__

⸻

General Notes
	•	Constants: UPPER_SNAKE_CASE
	•	Local variables: camelCase
	•	Booleans: isX, hasY
	•	Group related constants when appropriate

⸻

Functions
	•	Use verbs: getUser, fetchUser
	•	Prefix file-local helpers with _
	•	Escape reserved keywords using __name__

⸻

Objects
	•	Immutable top-level objects: PascalCase or UPPER_SNAKE_CASE
	•	Instance objects: camelCase
	•	Classes and enums: PascalCase

⸻

Types
	•	Interfaces prefixed with I
	•	Type aliases in PascalCase
	•	Optional T prefix for standard aliases

⸻

Comments
	•	Use JSDoc for all function declarations
	•	Use // for inline logic
	•	Capitalize and punctuate comments
	•	Clearly separate regions and sections

⸻

Imports
	•	Group by origin (libraries → app → local)
	•	Use spacing generously
	•	Split long imports across multiple lines

⸻

Example Scripts

Modular Object

export default {
  sendMail,
  sendSupportStaffEmail,
} as const;

Inventory

export function CloseBtn() {
  return <button>Close</button>;
}

Declaration

export default {
  port: process.env.PORT,
} as const;

Linear

const app = express();
app.listen(3000);

export default app;


⸻

Miscellaneous Style
	•	Prefer optional chaining and nullish coalescing
	•	Put variables on the left side of comparisons
	•	Format long boolean expressions vertically
	•	Keep object literals compact when passed as arguments

⸻

Testing

General Notes
	•	Test all user-driven behavior
	•	Developers write their own unit tests
	•	Integration tests should be limited early on
	•	Tests improve readability as well as correctness

⸻

Structuring BDD-Style Tests
	•	Declare variables in beforeEach / beforeAll
	•	Keep constants outside describe
	•	Separate helpers from test logic

⸻

Philosophy

This guide favors:
	•	Explicitness over cleverness
	•	Simplicity over abstraction
	•	Consistency over novelty

It is intentionally opinionated and designed to scale with real-world TypeScript applications.

⸻

License

MIT © Sean Maxwell

---

### Notes / Optional Enhancements
If you want, I can also:
- Add **GitHub Pages–friendly TOC**
- Generate a **CONTRIBUTING.md**
- Add **code-style badges**
- Split this into `/docs` with navigation
- Add a **“Why Procedural TS?”** section

Just tell me what you want next.
