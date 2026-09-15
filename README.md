# 🚀 TypeScript Best Practices

[![GitHub stars](https://img.shields.io/github/stars/seanpmaxwell/Typescript-Best-Practices?style=flat-square)](https://github.com/seanpmaxwell/Typescript-Best-Practices/stargazers)

Practical patterns for **procedural TypeScript and JavaScript**, aimed at code that is easier to read, navigate, and maintain.

This guide mixes language fundamentals with conventions from my own projects. Some are widely adopted; others are personal preferences. Where I diverge from common practice, I note the trade-offs.

## 📚 Table of contents

- [🔠 Terminology](#terminology)
- [💡 Core language features](#core-language-features)
  - [Primitives](#primitives)
  - [Functions](#functions)
  - [Objects](#objects)
    - [Object literals](#object-literals)
    - [Classes](#classes)
    - [Enums](#enums)
  - [Types](#types-link)
- [📄 File types and categories](#file-types)
- [🗂️ File organization](#file-organization)
- [🏷️ Naming conventions](#naming-conventions)
- [💬 Comments](#comments)
- [📥 Imports](#imports)
- [🤝 Organizing shared code](#organizing-shared-code)
- [🧠 Philosophy](#philosophy)
  - [Testing](#testing)
  - [Programming paradigms](#programming-paradigms)
  - [Documenting code](#documenting-code)
  - [Architecture](#architecture)

---

<a id="terminology"></a>

## 🔠 Terminology

Some of these are standard JavaScript terms; others are specific to this guide.

### Projects and packages

| Term | Meaning |
| --- | --- |
| **Package** | A JS/TS project with a `package.json`. |
| **Application** | A package meant to be run. |
| **Library** | A package meant to be used by other packages. |

### Files and folders

| Term | Meaning |
| --- | --- |
| **Root** | The top-level folder of a package. |
| **Branch directory** | A folder below the root with a broad purpose and several nested folders. |
| **Leaf directory** | A folder with no subfolders. |
| **Focused directory** | A folder dedicated to one feature or responsibility. Often, but not always, a leaf. |

```text
package-name/           <- Root
└── src/                <- Branch directory
    └── components/     <- Branch directory
        └── Login/      <- Focused directory
            └── _local/ <- Leaf directory
```

### Application lifecycle

- **Compile time:** Before execution, when code is type-checked and/or transformed into JavaScript.
- **Runtime:** When the JavaScript executes.
  - **Startup time:** Application initialization.
  - **Request time:** Responding to input, such as an API request or user action.

**Type-checking** verifies TypeScript's type rules; **transpilation** converts the code to JavaScript. `tsc` does both, but some tools only strip types—so running TypeScript successfully does not mean it type-checked.

"Transpiled, not compiled" is a distinction without much difference: transpiling is compiling from one source language to another.

<a id="terminology-objects"></a>

### Object terminology

#### Object shape and mutability

| Term | Meaning |
| --- | --- |
| **Fixed-shape** | Keys stay the same; values may change. |
| **Dynamic** | Keys can be added or removed; values may change. |
| **Readonly** | Properties cannot be reassigned through the declaring type. |

These describe usage, not distinct kinds of JavaScript objects. TypeScript's checks do not constrain objects at runtime, and `readonly` is shallow:

```ts
const user: { readonly address: { city: string } } = {
  address: { city: 'Paris' },
};

user.address.city = 'Rome'; // Allowed.
```

`readonly` and `as const` are compile-time only (`as const` also preserves literal types). For runtime protection use `Object.freeze()`, which is also shallow.

#### Classes and object literals

- **Class:** A template for objects with shared behavior and, often, internal state.
- **Object literal:** The `{ ... }` syntax for creating an object directly.

#### Plain objects

A **plain object** has `Object.prototype` as its direct prototype, or no prototype (`Object.create(null)`):

```ts
const first = {};
const second = new Object();
const third = Object.create(null);
```

`{}` inherits methods like `hasOwnProperty`; null-prototype objects do not.

`Record<PropertyKey, unknown>` is a common general-purpose object type, but it does **not** guarantee a plain-object prototype.

#### Dictionaries

A **dictionary** is a plain object used as a collection of string-keyed values:

```ts
type Dict = Record<string, unknown>;
```

Symbol keys are allowed but ignored by `Object.keys()` and similar methods; numeric keys become strings. *Dictionary* and *plain object* are often used interchangeably.

#### Plain data objects

A **plain data object** holds data, not behavior. In this guide it may contain primitives (excluding `bigint` and `symbol`), arrays of supported values, `Date` objects, and nested plain data objects.

A recursive type cannot rule out circular references. See the [PlainDataObject type implementation](./code/types-reference.ts#L4).

#### Namespace objects

A **namespace object** groups related values or functions under one name; its public properties are intended to stay readonly.

- **Constant object:** A namespace object of fixed values.
  - **Lookup table:** A constant object pairing values with labels, often for UI display.
  - **Configured constant object:** A constant object returned by a function, such as an enum-replacement helper.
- **Module object:** A namespace object exported as a file's default export.

A *module* is a file; a *module object* represents that file's public API. See [File types and categories](#file-types).

### Function terminology

| Term | Meaning |
| --- | --- |
| **Top-level function** | Defined directly in a file, not inside another function, object, or class. |
| **Function declaration** | `function name(...) { ... }`. Abbreviated **FD**. |
| **Arrow function** | `() => { ... }`. |
| **Function expression** | A function created where an expression is expected (assignment, callback, return value). Arrow functions are always expressions. |
| **Object method** | A function defined as a method on an object, including object literals. |
| **Factory function** | A function whose main job is to create and return an object or function. Abbreviated **FF**. |
| **Value factory function** | A factory that primarily provides data, often a fresh object per call. Abbreviated **VFF**. |
| **Configured function** | A function returned by a factory after supplying configuration, e.g. `const parseUser = parseObject(UserSchema)`. |
| **Validator function** | Checks an unknown value and narrows it with a type predicate. |

Object-literal method:

```ts
const UserErrors = {
  getError(name: string): string {
    return `The user name is ${name}`;
  },
};
```

Value factory function (new object and date each call):

```ts
const UserDefaults = () => ({
  name: '',
  createdAt: new Date(),
});
```

#### Class methods

- **Static method:** Called on the class.
- **Instance method:** Called on an instance.
- **Factory method:** A static method that creates and returns an instance.

Factory-method names I use:

| Method | Purpose | Example |
| --- | --- | --- |
| `of` | Build from individual values. | `User.of('name', 'email')` |
| `from` | Convert another representation. | `User.from(serializedUser)` |
| `create` | Build from defaults, a partial, or an existing object. | `User.create({ name, email })` or `User.create()` |

### Type terminology

| Term | Meaning |
| --- | --- |
| **Type alias** | `type TypeName = ...`. |
| **Object type literal** | The `{ key: Type }` syntax, named via an alias or used inline. |
| **Interface** | `interface SomeInterface { ... }`. |
| **Utility type** | A type that builds or transforms another type, usually with generics. |

Inline object type literal:

```ts
/**
 * Process an item identified by its ID.
 */
function foo(arg: { id: number }) {
  // ...
}
```

---

<a id="core-language-features"></a>

## 💡 Core language features

Four building blocks: **primitives**, **functions**, **objects**, and **types**.

<a id="primitives"></a>

### Primitives

Seven primitive types: `null`, `undefined`, `boolean`, `number`, `string`, `symbol`, `bigint`.

- **Autoboxing:** Primitives (except `null`/`undefined`) can use methods from their object counterparts, e.g. `String.prototype`.
- **Type coercion:** Conversion between types, e.g. `'5' * 2` evaluates to `10`.

These are different behaviors. Symbols are especially useful for unique object keys in shared code and libraries.

<a id="functions"></a>

### Functions

Prefer **function declarations at the file level**. Hoisting lets you put the main logic first and helpers below. Use **arrow functions for callbacks and short inline logic**.

```ts
/**
 * Trim names and remove empty entries.
 */
function normalizeNames(names: string[]): string[] {
  return names
    .map(name => name.trim())
    .filter(name => name.length > 0);
}
```

Hoisting makes the function available earlier; it does not guarantee the values it uses are initialized.

Stack traces are not a reason to avoid function expressions—JavaScript infers names for functions assigned to variables:

```ts
const normalizeName = (name: string) => name.trim();
```

<a id="objects"></a>

### Objects

Objects commonly appear as object literals, class instances, or the runtime output of regular enums. For custom constructors, prefer `class` syntax over `function` plus `new`.

<a id="object-literals"></a>

#### Object literals

Readonly object literals work well as namespaces. If you only need to group values or stateless functions, you do not need a class.

```ts
const Errors = {
  NameMissing: 'A name is required.',
  InvalidEmail(value: string): string {
    return `"${value}" is not a valid email address.`;
  },
} as const;
```

<a id="classes"></a>

#### Classes

Both classes and factory functions support OO designs: factories keep private state in **closures**; classes use **`#private` fields**. TypeScript's `private` keyword is compile-time only—the property is ordinary at runtime.

An object literal has no instance-private storage. State kept in non-exported module variables belongs to the module and is shared by all importers.

##### When a class fits

- The object has internal state its methods update over time.
- You need to extend a class you do not control, such as `Error`.

##### When to use something simpler

Avoid a class:

- **As a namespace.** Use an object literal.
- **To assemble a configured object with no lifecycle or need for `this`.** Use a factory function.
- **To wrap I/O data** from databases, files, or APIs.

For I/O data, this guide favors **plain data plus functions**: simple data, with module objects grouping the stateless functions that act on it. This avoids wrapping data that mainly needs validation, transformation, or transfer in layers of class instances. Domain-driven design favors richer objects; both work—choose deliberately.

##### Why not factories for everything?

Classes make two things convenient:

- **Shared methods:** Instance methods live on the prototype. A factory defining methods per returned object creates new function objects each call.
- **Inheritance:** `class ... extends ...` is simpler than wiring up a prototype chain.

Factories can share methods via a prototype, but then per-instance private state needs a different design.

##### Class conventions I use

**Prefer factory methods for control over construction.** My usual approach is a `protected` constructor with public `create`, `of`, and `from` methods. Factories provide named creation paths, can return subtypes, and handle setup that does not fit a constructor. A `private` constructor also works but blocks subclassing since subclasses cannot call `super()`. This is a house convention—public constructors and `new` are standard.

**Keep logic that does not need `this` outside the class**, in top-level function declarations below it. See [Keep classes clean](./code/keep-classes-clean.ts).

**Expose a focused interface for larger classes.** If a class has its own file, consider an interface for the members callers need, and return it from factory methods. Callers then depend on the contract, not the implementation, which simplifies mocks and alternatives. This narrows the type only; it does not hide properties at runtime.

I sometimes prefix these interfaces with `I`. Many style guides avoid that; treat it as a preference.

See [OO with classes vs. factory functions](./code/oo-classes-vs-FFs.ts).

<a id="enums"></a>

#### Enums

Prefer a **constant object paired with a same-named type** over a TypeScript enum.

Enums need more than type removal:

- Regular enums emit runtime JavaScript.
- `const enum` values are inlined by the compiler.
- Type-stripping tools such as Node's type-stripping mode support neither.
- `erasableSyntaxOnly` rejects enum syntax.

```ts
const UserRoles = {
  BASIC: 0,
  ADMIN: 1,
  OWNER: 2,
} as const;

type UserRoles = typeof UserRoles[keyof typeof UserRoles]; // 0 | 1 | 2

const basic: UserRoles = UserRoles.BASIC;
```

The object and type share a name because values and types live in separate declaration spaces. This is not declaration merging.

<a id="types-link"></a>

### Types

Type aliases and interfaces both describe object shapes. The handbook's starting point: **use interfaces until you need a type alias feature**.

- **Interfaces** for object contracts you expect to extend.
- **Type aliases** for unions, tuples, mapped types, and other type expressions.

Interfaces can be easier for the compiler than large intersections, though it depends on the types involved. Both vanish from output, so runtime performance is unaffected.

---

<a id="file-types"></a>

## 📄 File types and categories

*File*, *script*, and *module* are often used interchangeably, but scripts and modules have different scoping rules.

### Language-level file types

| Type | Meaning |
| --- | --- |
| **Module** | Usually has imports or exports. Top-level declarations are module-scoped; exports form its public API. |
| **Script** | A non-module. Top-level declarations can contribute to the global scope. |

Module detection also depends on `moduleDetection` and the package environment.

### Organizational file categories

| Category | Purpose |
| --- | --- |
| **Single-export** | Exports one main item: a large function, class, or config object. |
| **Module object** | Default-exports a namespace object grouping the file's public values and functions. |
| **Inventory** | Exports several independent declarations, such as shared types or small utilities. |
| **Linear** | Runs a sequence of setup steps, often at startup. |

These are labels, not TypeScript file types. See [File category examples](./docs/File-Category-Examples.md).

### Why I use module-object files

For application logic whose structure is fixed after startup, I prefer module-object files (client and server; UI components follow their framework). Module objects give related functions one home:

- Callers import one object, not a list of functions.
- The public API is collected in one place.
- Helpers are less likely to be exported by accident.
- Related names are grouped under a namespace.

No class is needed for this.

Many style guides prefer named exports, which work better with editor tooling and tree-shaking. If that matters, keep the same call style with a namespace import:

```ts
import * as User from './User';

User.create();
```

Module objects are a house convention.

---

<a id="file-organization"></a>

## 🗂️ File organization

A predictable layout lets readers guess where something lives before searching.

### The hierarchy

Largest to smallest: **folders → files → regions → sections → blocks** (at file level or inside a function).

### Top-down file layout

After imports:

| Order | Region | Contents |
| --- | --- | --- |
| 1 | **Docs** | File-level documentation. |
| 2 | **Constants** | Primitive constants, object constants, then value factory functions. |
| 3 | **Types** | Interfaces, aliases, other local types. |
| 4 | **Classes** | Small local classes. Larger ones get their own file. |
| 5 | **Init** | Initialization and setup. |
| 6 | **Components** | JSX components, when applicable. |
| 7 | **Functions** | Function declarations and supporting logic. |
| 8 | **Export** | The file's public API. |

Single-export, module-object, and linear files collect exports at the bottom. Inventory files export where declared so it is clear which items are public.

Hoisting makes this convenient, but values must still be initialized before use.

### Regions

Three-line divider:

```ts
// ========================================================================= //
//                                 CONSTANTS                                 //
// ========================================================================= //
```

### Sections

Single-line divider within a region:

```ts
// ============================ Setup Middleware =========================== //
// Put any explanation for the section directly below its divider.

const app = express();

app.use(middleware1);
app.use(middleware2);

// Additional middleware setup goes here.

// ========================== Configure Front-end ========================== //

const FRONT_END_DIRECTORY_PATH = __dirname + '/client/html';

app.set('views', FRONT_END_DIRECTORY_PATH + '/views');
app.use(express.static(FRONT_END_DIRECTORY_PATH + '/static'));

// Additional front-end setup goes here.
```

### Blocks

Short comment dividers, at file level or inside larger functions:

```ts
// apiRouter.ts — a linear file.

// ============================ Add User Routes ============================ //

const loginRouter = express.Router();

// ---- Local Login
// Log in with a username and password.

const localRouter = express.Router();
localRouter.use('/local', addUser);
localRouter.use('/reset-password-request', sendLink);

loginRouter.use('/login', localRouter);

// ---- Google Login
// Google login setup goes here.

/**
 * Demonstrate block separators inside a larger function.
 */
function someLargeFunction() {
  // ---- Prepare Data
  // Preparation steps go here.

  // ---- Process Results
  // Processing steps go here.
}
```

Don't center dividers by hand. Write `// @reg Label` or `// @sec Label` and run [code-divider](https://github.com/seanpmaxwell/code-divider):

```bash
npx code-divider
```

It replaces markers with centered dividers, uppercasing region labels and capitalizing section labels.

### What belongs in Constants?

Fixed data, plus helpers whose purpose is to provide data: value factory functions and configured constant objects.

```ts
// Return a fresh object and date on each call.
const UserDefaults = (): IUser => ({
  id: 0,
  name: '',
  createdAt: new Date(),
});

// Build a configured constant object.
const Roles = SomeEnumLibrary({
  Basic: { value: 1, label: 'Basic' },
  Admin: { value: 2, label: 'Administrator' },
});
```

### Value factory functions

VFFs break the usual function conventions because they provide values:

- Place them in **Constants**.
- Use **PascalCase**.
- Use a function expression, not a declaration.
- A noun name is fine; no verb needed.

### Configured functions and initialization order

A configured function is assigned to a variable and cannot be used before that assignment runs:

```ts
const isValidAddress = isValidShape({
  // ...
});
```

`const` is hoisted but inaccessible until initialized—the **temporal dead zone**.

Usually, just initialize it earlier. If the file layout requires an earlier call, a hoisted declaration can create and cache the configured function on first use:

```ts
// User.ts
import { v4 as uuid, validate } from 'uuid';
import { isValidString, isValidShape } from 'some-validation-library';

// ========================================================================= //
//                                 CONSTANTS                                 //
// ========================================================================= //

const UserDefaults = (address: IAddress): IUser => {
  if (!isValidAddress(address)) {
    throw new Error('Invalid address');
  }

  return {
    id: uuid(),
    address: { ...address },
  };
};

// This runs while the module is loading, before the Functions region.
// A configured function assigned later with `const` would not be ready yet.
const GuestUser = UserDefaults({
  street: 'unknown',
  city: 'unknown',
});

// ========================================================================= //
//                                   TYPES                                   //
// ========================================================================= //

// Reusable helpers can live in `_common/types/utility-types.ts`.
type AnyFn = (...args: any[]) => any;

type SetLazy<T extends AnyFn> = T & {
  lazyFn?: T;
};

interface IUser {
  id: string;
  address: IAddress;
}

interface IAddress {
  street: string;
  city: string;
}

type IsValidAddress = SetLazy<typeof isValidAddress>;

// ========================================================================= //
//                                 FUNCTIONS                                 //
// ========================================================================= //

/**
 * Validate an address, creating the configured validator on first use.
 */
function isValidAddress(value: unknown): value is IAddress {
  const self: IsValidAddress = isValidAddress;
  const fn = self.lazyFn ??= isValidShape({
    street: isValidString({ minLength: 1, maxLength: 255 }),
    city: isValidString({ minLength: 1, maxLength: 255 }),
  });

  return fn(value);
}

/**
 * Normalize and validate a UUID.
 */
function normalizeId(id: string): string {
  const normalizedId = id.trim().toLowerCase();

  if (!validate(normalizedId)) {
    throw new Error('Id is not valid');
  }

  return normalizedId;
}

// ========================================================================= //
//                                  EXPORT                                   //
// ========================================================================= //

export default {
  UserDefaults,
  GuestUser,
  isValidAddress,
  normalizeId,
} as const;
```

The wrapper is hoisted; the validator is built on first call and reused. Your lint rules may need to allow use-before-define for function declarations.

### Short local type aliases

Prefer descriptive type names. If a signature feels long, simplify the function name before replacing the type with an acronym readers must memorize:

```ts
/**
 * Fetch subscriptions suspended because of failed payments.
 */
async function fetchPaymentSuspendedSubscriptions(): Promise<
  SuspendedForFailedPaymentSubscription[]
> {
  return database('subscriptions')
    .where({ /* Query conditions. */ })
    .returning('*');
}

// ---- OR

async function fetchPaymentSuspendedSubscriptions(): Promise<SFFPS> {
  return database('subscriptions')
    .where({ /* Query conditions. */ })
    .returning('*');
}
type SFFPS = SuspendedForFailedPaymentSubscription;
```

A short local alias helps when a complex type repeats. Keep it near its uses and self-explanatory. The goal is readability, not fewer characters.

### Exceptions for linear files

Large setup files need not follow region order rigidly. Group related steps into blocks and put each block's constants at its top.

### Comments and spacing inside functions

For ordinary functions, use short comments to separate steps rather than blank lines:

```ts
/**
 * Demonstrate a compact function layout.
 */
function normalFunction() {
  // Prepare the input.
  foo();
  bar();
  // Process the result.
  blah();
  whatever();
}
```

For large functions that cannot be split, use block dividers and blank lines:

```ts
try {
  // ---- Prepare Input
  foo();
  bar();
  // Additional preparation steps.

  // ---- Process Results
  blah();
  whatever();
  // Additional processing steps.
} catch (err) {
  handleErrorObject(err);
}
```

React components are an exception: blank lines between props, hooks, derived values, handlers, and UI aid scanning. See [Organizing component code](https://github.com/seanpmaxwell/React-Ts-Best-Practices#function-components-organization).

---

<a id="naming-conventions"></a>

## 🏷️ Naming conventions

Names should reveal purpose without opening the file.

### Folders and files

| Item | Convention |
| --- | --- |
| **Folder** | `kebab-case`, or the name of its main item. |
| **Linear file** | `kebab-case`. |
| **Single-export file** | Match the exported item. |
| **Module-object file** | Match the module object's name in code. |
| **Inventory file** | `kebab-case`. |

Reserved names:

- **`index.ts`:** Barrel file—a folder or library entry point.
- **`main.ts`:** Application entry point.

Add a suffix when a file's purpose is still unclear:

```ts
import User from '@src/models/User.model';
```

### Readonly values

`UPPER_SNAKE_CASE` for module-level primitive constants and readonly arrays.

For namespace-style constant objects: `PascalCase` for the object and nested objects; `UPPER_SNAKE_CASE` for keys holding fixed values. If the whole object is passed around as a value rather than used as a namespace, use `UPPER_SNAKE_CASE` for its name and whatever property names consumers require.

### Module objects

`PascalCase` by default:

```ts
import DateUtils from '@src/utils/DateUtils';
```

`camelCase` for widely used infrastructure objects with substantial initialization:

```ts
import db from '@src/infra/db';
```

Match the filename to the object name.

PascalCase for module objects, constant objects, and VFFs is a house convention—many projects reserve it for classes, types, and components. I use it to distinguish value providers and namespaces from ordinary variables and functions.

### Local variables

`camelCase`. Types stay PascalCase.

### Functions

`camelCase` for ordinary functions. `PascalCase` for JSX components and VFFs.

| Pattern | Use for | Example |
| --- | --- | --- |
| `get...` | Retrieving or computing without I/O. | `getDateAsString()` |
| `fetch...` | Reading through I/O. | `fetchUserRecords()` |
| `is...` | Validators and type guards. | `isValidUser(value: unknown): value is IUser` |
| `...OrThrow` | Throwing counterpart to a function that may return nothing. | `findUserByIdOrThrow()` |
| Trailing `_` | Avoiding a reserved word. | `delete_()` |

```ts
findUserById(id: number): IUser | null
findUserByIdOrThrow(id: number): IUser
```

VFFs are exempt from verb naming.

### Classes and types

`PascalCase` for classes, interfaces, and aliases. `I`/`T` prefixes are less common now. I use `I` only to distinguish an interface from a related class or object:

- `IUser`: The database entity type.
- `User`: The module object from `User.model.ts`.

### Booleans

Prefix with `is`:

```ts
const isEnabled = true;
const isValid = false;
```

### Abbreviations and acronyms

Prefer clear names. Abbreviations are fine when readers already know them: established acronyms (`URL`, `API`), familiar shortenings (`Pwd`, `Img`), and team-understood project terms. All caps for acronyms is fine:

```ts
insertIntoURL();
```

Avoid shortening words in `UPPER_SNAKE_CASE` names without good reason.

### Useful suffixes

| Suffix | Meaning |
| --- | --- |
| **`View`** | Data shaped for UI display, e.g. `UserView`. |
| **`DTO`** | Data transfer object moving data between parts of an app or across boundaries. Not necessarily an API request. |
| **`Label`** | A display-formatted string, e.g. `createdAtLabel`. For properties or values, not whole objects. |
| **`Payload`** | An object shaped for an API call. |

See [User.model.ts](./code/User.model.ts).

---

<a id="comments"></a>

## 💬 Comments

Explain purpose, intent, and what readers cannot infer from the code.

- `/** ... */` above every function declaration.
- `//` or nothing for function expressions.
- `/** ... */` for utility types, especially non-obvious ones.
- `//` for inline explanations.
- Capitalize and punctuate.
- Separate major regions clearly.

---

<a id="imports"></a>

## 📥 Imports

Group by origin: third-party, application modules, nearby local files. Split long lists across lines. Prettier handles wrapping; use an import-sorting plugin or ESLint rule to enforce order.

<br/>

---

<a id="organizing-shared-code"></a>

## 🤝 Organizing shared code

Without a clear home, helper/shared logic quickly becomes a disorganized mess.

This builds on **branch directory** and **focused directory** from [Terminology](#terminology). Examples use React-style folders, but apply to client and server alike.

### Shared-code categories

| Category | Contents |
| --- | --- |
| **`utils`** | Application agnostic logic. |
| **`constants`** | Readonly values and VFFs. |
| **`types`** | Standalone aliases and interfaces, no runtime code. |
| **`ui`** | Shared `.jsx`/`.tsx` files. |

Utilities may depend on third-party libraries and lower-level utilities but should generally be application agnostic.

Keep types beside closely related runtime logic; use shared `types` only for types that stand alone.

### Branch directories: `_common/`

Create `_common/` when code is shared across a branch directory. Avoid `misc/` or `helpers/` they become catch-alls. Category subfolders are fine, but filenames should still describe contents:

```text
src/_common/types/utility-types.ts
```

Nested branches can have their own `_common/`:

```text
public/
src/
├── assets/
├── _common/
│   └── types/
│       └── utility-types.ts
├── components/
│   ├── _common/                  <- Shared across components.
│   │   ├── ui/
│   │   │   └── buttons.tsx
│   │   └── styles/
│   │       └── BoxStyles.ts
│   ├── pages/
│   │   ├── Home/
│   │   │   ├── Home.tsx
│   │   │   └── Home.test.tsx
│   │   └── Login/
│   │       ├── dialogs/
│   │       │   └── ResetPasswordDialog.tsx
│   │       ├── Login.tsx
│   │       └── Login.test.tsx
│   ├── App.tsx
│   └── index.css
├── services/
└── index.html
package.json
tsconfig.json
```

`src/` and `components/` are branch directories; `Home/` and `Login/` are focused directories.

### Focused directories: `_local/`, `_external/`, `_internal/`

A focused directory already names the feature, so we can be less strict with how we name its supporting files:

| Folder | Purpose |
| --- | --- |
| **`_local/`** | Helpers used within the directory; may also be shared outward when sensible. |
| **`_external/`** | Helpers for outside consumers, not used internally. |
| **`_internal/`** | Implementation details not for outside use. |

Broad names like `utils.ts` or `ui.tsx` are fine inside `_local/` but not in the focused directory's root:

```text
Login/_local/ui.tsx  <- Good: clearly a local helper.
Login/ui.tsx         <- Avoid: its role is less clear.
```

The names `local`/`internal`/`external` communicate intent; they do not enforce access. You could still import an internal item some where else if you really need to: e.g. unit-testing.

```text
_common/
└── ui/
    └── DataTable/
        ├── _local/
        │   └── datatable-elements.tsx
        ├── _external/
        │   └── dataTableFilterToUrlString.ts
        ├── _internal/
        │   └── sortTableData.ts
        ├── DataTable.tsx
        └── DataTable.test.tsx

Login/
├── _local/
│   ├── ui.tsx
│   └── constants.ts
├── dialogs/
│   ├── _local/
│   │   └── AuthDialog.tsx
│   ├── ForgotPasswordDialog.tsx
│   └── SignupInsteadDialog.tsx
├── Login.tsx
└── Login.test.tsx
```

- `datatable-elements.tsx`: shared inside and outside `DataTable/`.
- `dataTableFilterToUrlString.ts`: for outside consumers.
- `sortTableData.ts`: used only by `DataTable.tsx`.
- `Login/_local/ui.tsx`: UI shared by `Login` and its dialogs.
- `AuthDialog.tsx`: common base for the two auth dialogs.

---

<a id="philosophy"></a>

## 🧠 Philosophy

<a id="testing"></a>

### Testing

#### Terminology

| Test type | What it checks |
| --- | --- |
| **Unit** | One piece of behavior in isolation. |
| **Integration** | Multiple units, modules, or layers together. |
| **End-to-end** | A full user flow through the running system. |

Boundaries vary. In backend projects, "integration test" often means calling a route and exercising several layers. See [Architecture](#architecture).

#### Conventions

**Cover important behavior, not every input combination.** Test meaningful behavior triggered by users not ever theoretical edge case.

**Developers write their own unit/integration tests**, even during rapid development. Writing tests not only catches bugs but doubles as proofreading.

**e2e tests can come later and/or be done by a dedicated tester** They are expensive to write and maintain (e.g. Cypress).

---

<a id="programming-paradigms"></a>

### Programming paradigms

TypeScript supports several styles; a project need not commit to one.

- **Procedural:** Functions operating on data.
- **Object-oriented:** Behavior organized around objects, emphasizing encapsulation, abstraction, inheritance, polymorphism.
- **Functional:** Composed functions, immutable data, controlled side effects. Pure FP applies these strictly.

Notes:
- Using functions instead of classes does not make code functional.
- This guide favors procedural with classes handling OOP specific features.

---

<a id="documenting-code"></a>

### Documenting code

Good model documentation saves trips to the database manager to answer "what does this field reference?"

#### Model terminology

| Term | Meaning |
| --- | --- |
| **Model layer** | Code describing and working with stored data shapes. |
| **Comment tag** | An `@` keyword inside a comment. |
| **Entity type** | A type representing a table row. |
| **Auxiliary table** | A supporting table, e.g. `user_avatars` for `users`. |
| **Join table** | A connecting table, e.g. `projects_users`. |
| **Derived type** | Built from an entity type with added or transformed fields. |
| **Audit column** | Lifecycle column such as `createdAt` or `createdBy`. |

I avoid *record* in type names to prevent confusion with `Record<>`. Join tables use both plural names: `projects_users`.

#### Useful comment tags

TypeScript already has parameter and return types; use tags only for what types cannot express.

Standard tags: `@private`, `@param`, `@returns`, `@see`.

Custom tags in this guide:

| Tag | Purpose |
| --- | --- |
| `@testOnly` | Used only by tests. |
| `@cronJob` | Used by scheduled jobs. |
| `@dummyData` | Generates or manages dummy data. |
| `@startupTime` | Runs during startup, not request handling. |
| `@entity` | The table an entity type represents. |
| `@auxiliaryOf` | The table an auxiliary table supports. |
| `@joins` | A table connected via a join table. |
| `@route` | A handler's HTTP method and path. |

#### Linking private helpers to callers

Keep the link in the description, `@private` on its own line:

```ts
/**
 * Prepare the values needed by the parent operation.
 *
 * Used by {@link parentFunction}.
 *
 * @private
 */
```

#### Documenting database relationships

```ts
/**
 * @entity users
 */
interface User {
  name: string;
}
```

Auxiliary table:

```ts
/**
 * @entity user_avatars
 * @auxiliaryOf users
 */
```

Join table:

```ts
/**
 * @entity charts_users
 * @joins users
 * @joins charts
 */
```

Tags and entity types:

1. **Primary keys:** `// @PK`.
2. **Ordinary data fields.**
3. **Foreign keys:** `// @FK` plus cardinality.
4. **Audit columns:** `// @AC`, unless already an FK.
5. **Transient fields:** `// @TE` for values added outside the database.

```ts
userId: number; // @FK 1-1
createdAt: Date; // @AC
```

#### Example: user entities

Here `user_avatars.userId` is both a FK and unique, allowing at most one avatar per user.

```ts
interface Entity {
  id: number; // @PK
  createdAt: Date | string; // @AC
  updatedAt: Date | string; // @AC
}

/**
 * @entity users
 */
interface User extends Entity {
  name: string;
}

/**
 * @entity user_avatars
 * @auxiliaryOf users
 */
interface UserAvatar extends Entity {
  filename: string | null;
  userId: number; // @FK 1-1; unique in the database.
}

// Created in the service layer.
// Binary data belongs in the transfer type, not the database entity.
interface UserAvatarDTO extends UserAvatar {
  data: Blob;
}

/**
 * Create a user for tests.
 *
 * @testOnly
 */
function getDummy() {
  return {
    id: randomInt(10),
    name: 'John',
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}
```

#### Documenting routes

Include method and path on route handlers; it makes them easy to find. Keep handlers focused on HTTP and delegate to a service.

```ts
/**
 * Fetch a user's posts.
 *
 * @route GET /api/posts/:userId
 */
async function fetchPostsByUserId(
  req: Request,
  res: Response,
): Promise<void> {
  const posts = await PostService.fetchPostsByUserId(
    Number(req.params.userId),
  );

  res.json(posts);
}

// Elsewhere in the application:
app.get(
  '/api/posts/:userId',
  validateUserIdParam,
  fetchPostsByUserId,
);
```

`validateUserIdParam` rejects invalid params before the handler runs (e.g. requiring a positive safe integer). `Number()` converts; it does not validate. Make the validation boundary explicit.

---

<a id="architecture"></a>

### Architecture

Architecture should make responsibilities easy to find and dependencies easy to follow.

#### Terminology

- **Domain:** A business area grouping related features, e.g. `Auth` with signup, login, and password recovery.
- **Layer:** A part of the app with one responsibility, such as handling requests or accessing stored data.

#### Common layers

| Layer | Responsibility |
| --- | --- |
| **Repository** | Reads/writes persisted data. Suffix `Repo`. |
| **Service** | Business logic and workflow coordination, server or client. Suffix `Service`. |
| **API client** | Client-side HTTP requests and responses. Suffix `Api`. |
| **Cron jobs** | Scheduled server-side work. |
| **Controller** | Handles client requests and delegates. |
| **Middleware** | Framework-level request processing, e.g. validation. |
| **Infrastructure** | Wraps external systems: DB connections, storage, HTTP clients. |

With several storage systems, make repo names specific: `UserRepo.ts` for database records, `UserAssetRepo.ts` for stored files such as S3 objects.

Services coordinate persistence through repositories or adapters rather than embedding storage operations in business logic.

#### Service conventions I use

**One service entry point per domain.** Controllers call the domain's primary service, never repositories or infrastructure directly:

```text
Controller → Service → Repository or infrastructure adapter → Persistence
```

#### Layer-based architecture

For small or solo projects, grouping by layer is straightforward: folder names describe technical roles and the structure is easy to explain. The cost is that related code spreads across more folders as features grow.

```text
config/
src/
├── assets/
├── cronjobs/
├── repos/
│   ├── db/
│   │   └── db.ts
│   ├── UserRepo.ts
│   └── PostRepo.ts
├── routes/
│   ├── UserRoutes.ts
│   └── PostRoutes.ts
├── services/
│   ├── UserServices/
│   │   ├── UserService.ts
│   │   └── UserAssets.ts
│   └── PostService.ts
├── main.ts
└── server.ts
tests/
├── users.test.ts
└── posts.test.ts
package.json
tsconfig.json
```

`UserAssets.ts` might be added later for avatar uploads. `UserRepo.ts` rather than `user.repo.ts` because these are module-object files—see [Naming conventions](#naming-conventions).

#### Domain-based architecture

For larger apps I prefer grouping by domain. Related layers stay together, which makes it easier to make updates as a feature grows.

Trade-offs: business-oriented names are less immediately obvious than `repos/` and `services/`.

```text
config/
src/
├── _assets/
├── _common/
├── cronjobs/
├── domains/
│   ├── users/
│   │   ├── _local/
│   │   │   ├── constants/
│   │   │   │   └── errors.ts
│   │   │   └── types/
│   │   │       └── schemas.ts
│   │   ├── UserRepo.ts
│   │   ├── UserService.ts
│   │   ├── UserAssets.ts
│   │   └── UserController.ts
│   └── posts/
│       ├── _internal/
│       │   └── PostToPDF.ts
│       ├── PostRepo.ts
│       ├── PostService.ts
│       └── PostController.ts
├── infra/
│   ├── db.ts
│   └── session.ts
├── routers/
│   ├── middleware/
│   ├── user.router.ts
│   ├── post.router.ts
│   └── api.ts
├── main.ts
└── server.ts
tests/
├── users.test.ts
└── posts.test.ts
package.json
tsconfig.json
```

User layers live under `domains/users/`, post layers under `domains/posts/`, shared infrastructure under `infra/`. `PostToPDF.ts` holds logic for rendering a post as a PDF.

In a layer-based layout, adding a second user service means creating `UserServices/` and moving files; in a domain layout, the files already belong together.

These examples use a backend server. For the client side, see [React + TypeScript Best Practices](https://github.com/seanpmaxwell/React-Ts-Best-Practices).
