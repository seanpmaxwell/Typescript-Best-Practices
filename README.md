# 🚀 TypeScript Best Practices

[![GitHub stars](https://img.shields.io/github/stars/seanpmaxwell/Typescript-Best-Practices?style=flat-square)](https://github.com/seanpmaxwell/Typescript-Best-Practices/stargazers)

Practical patterns for **procedural TypeScript and JavaScript development**.

The goal is simple: make code easier to read, navigate, and maintain.

This guide combines language fundamentals with the conventions I use in my own projects. Some recommendations are widely adopted; others are personal preferences. Where a convention differs from common practice, I explain the trade-offs.

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

Before getting into the recommendations, let’s agree on a few terms. Some are standard JavaScript terminology; others are names used throughout this guide.

### Projects and packages

| Term | Meaning |
| --- | --- |
| **Package** | A JavaScript or TypeScript project with a `package.json`. |
| **Application** | A package intended to be run. |
| **Library** | A package intended to be used by applications or other libraries. |

### Files and folders

| Term | Meaning |
| --- | --- |
| **Root** | The top-level folder of a package. |
| **Branch directory** | A folder below the root with a broad purpose and several nested folders. |
| **Leaf directory** | A folder with no subfolders. |
| **Focused directory** | A folder dedicated to one specific feature or responsibility. It is often—but not always—a leaf directory. |

For example:

```text
package-name/           ← Root
└── src/                ← Branch directory
    └── components/     ← Branch directory
        └── Login/      ← Focused directory
            └── _local/ ← Leaf directory
```

### Application lifecycle

- **Compile time:** The stage before execution when code may be type-checked and transformed into JavaScript.
- **Runtime:** When the JavaScript executes.
  - **Startup time:** When the application initializes.
  - **Request time:** When it responds to input, such as an API request or a user action.

Type-checking and transpilation are separate operations:

- **Type-checking** checks whether the code follows TypeScript’s type rules.
- **Transpilation** converts the code into JavaScript.

`tsc` can do both, but some tools only transform the code or remove its types. Successfully running TypeScript does not necessarily mean it has passed type-checking.

You may also hear that TypeScript is “transpiled, not compiled.” Transpiling is simply a kind of compiling: it translates one source language into another rather than directly into machine code.

<a id="terminology-objects"></a>

### Object terminology

#### Object shape and mutability

This guide uses these terms to describe how an object is expected to change:

| Term | Meaning |
| --- | --- |
| **Fixed-shape** | The expected keys stay the same, but their values may change. |
| **Dynamic** | Keys can be added or removed, and values can change. |
| **Readonly** | Properties cannot be reassigned through the type that declares them readonly. |

These describe how an object is used—not separate kinds of JavaScript objects.

TypeScript usually checks an object against a known shape, but those checks do not restrict the object at runtime.

Readonly properties also do not guarantee that nested values are immutable:

```ts
const user: { readonly address: { city: string } } = {
  address: { city: 'Paris' },
};

user.address.city = 'Rome'; // Allowed.
```

Here, `user.address` cannot be replaced through its declared type, but the address object can still change.

`readonly` and `as const` provide compile-time checks, not runtime protection. `as const` also preserves literal types and makes properties in the literal readonly.

Use `Object.freeze()` when you need runtime protection against changing an object’s own properties. Freezing is shallow: nested objects are not automatically frozen.

#### Classes and object literals

- **Class:** A template for creating objects with shared behavior and, often, internal state.
- **Object literal:** The `{ ... }` syntax used to create an object directly.

#### Plain objects

A **plain object** has either:

- `Object.prototype` as its direct prototype.
- No prototype at all, as with `Object.create(null)`.

Common ways to create one are:

```ts
const first = {};
const second = new Object();
const third = Object.create(null);
```

Objects created with `{}` inherit methods such as `hasOwnProperty`. Null-prototype objects do not inherit those methods.

`Record<PropertyKey, unknown>` is a common general-purpose type for an object with arbitrary keys, but it does **not** guarantee that the value has a plain-object prototype.

#### Dictionaries

A **dictionary** is a plain object used as a collection of string-keyed values:

```ts
type Dict = Record<string, unknown>;
```

Plain objects can also have symbol keys, but common iteration methods such as `Object.keys()` ignore them. Numeric property keys are converted to strings.

Because string-keyed objects are so common, people sometimes use *dictionary* and *plain object* interchangeably.

#### Plain data objects

A **plain data object** contains data rather than behavior.

In this guide, it can contain:

- Primitive values, excluding `bigint` and `symbol`.
- Arrays of supported values.
- `Date` objects.
- Nested plain data objects.

This describes a data container—not a guarantee that serialization will preserve everything unchanged.

For JSON in particular:

| Value or structure | What happens |
| --- | --- |
| A valid `Date` | Becomes an ISO string. Parsing the JSON does not restore the `Date` object. |
| `NaN`, `Infinity`, or `-Infinity` | Becomes `null`. |
| An object property containing `undefined` or a symbol value | The property is omitted. |
| An array entry containing `undefined` or a symbol value | Becomes `null`. |
| A top-level `undefined` | `JSON.stringify()` returns `undefined`, not a JSON string. |
| A `bigint` | Normally causes serialization to throw. |
| A circular reference | Causes serialization to throw. |

A recursive TypeScript type cannot guarantee that a value has no circular references.

See the [PlainDataObject type implementation](./code/types-reference.ts#L4) for an example of describing these data shapes.

#### Namespace objects

A **namespace object** groups related values or functions under one name. In this guide, its public properties are intended to remain readonly.

A few more specific terms are useful:

- **Constant object:** A namespace object containing fixed values.
  - **Lookup table:** A constant object that pairs values with labels, often for display in a UI.
  - **Configured constant object:** A constant object returned by a function, such as an enum-replacement helper.
- **Module object:** A namespace object exported as a file’s default export.

A *module* is a kind of JavaScript file. A *module object* is an object representing that file’s public API. See [File types and categories](#file-types).

### Function terminology

| Term | Meaning |
| --- | --- |
| **Top-level function** | A function defined directly in a file, rather than inside another function, object, or class. Also called a module-level function. |
| **Function declaration** | A function written as `function functionName(...) { ... }`. Abbreviated **FD** in this guide. |
| **Arrow function** | A function written with arrow syntax, such as `() => { ... }`. |
| **Function expression** | A function created where an expression is expected, such as a variable assignment, callback argument, or returned value. Arrow functions are always function expressions. |
| **Object method** | A function defined as a method on an object, including an object literal. |
| **Factory function** | A function whose main job is to create and return an object or another function. Abbreviated **FF**. |
| **Value factory function** | A factory function that primarily provides data, often returning a fresh object on each call. Abbreviated **VFF**. |
| **Configured function** | A function returned by a factory after supplying configuration, such as `const parseUser = parseObject(UserSchema)`. |
| **Validator function** | In this guide, a function that checks an unknown value and uses a type predicate to narrow its type. |

An object-literal method looks like this:

```ts
const UserErrors = {
  getError(name: string): string {
    return `The user name is ${name}`;
  },
};
```

A value factory function looks like this:

```ts
const UserDefaults = () => ({
  name: '',
  createdAt: new Date(),
});
```

Each call returns a new object and a newly created date.

#### Class methods

- **Static method:** Called on the class itself.
- **Instance method:** Called on an instance of the class.
- **Factory method:** In this guide, a static method that creates and returns a class instance.

I use these factory-method names consistently:

| Method | Purpose | Example |
| --- | --- | --- |
| `of` | Build an instance from individual values. | `User.of('name', 'email')` |
| `from` | Convert another representation into an instance. | `User.from(serializedUser)` |
| `create` | Build from defaults, a partial object, or an existing object. | `User.create({ name, email })` or `User.create()` |

### Type terminology

| Term | Meaning |
| --- | --- |
| **Type alias** | A type declared with `type TypeName = ...`. |
| **Object type literal** | The `{ key: Type }` syntax used to describe an object’s shape. It can be named with a type alias or used inline. |
| **Interface** | A type declared with `interface SomeInterface { ... }`. |
| **Utility type** | A type that builds or transforms another type, usually with generics. |

For example, this parameter uses an inline object type literal:

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

This guide centers on four building blocks:

- **Primitives**
- **Functions**
- **Objects**
- **Types**

<a id="primitives"></a>

### Primitives

JavaScript has seven primitive types:

`null`, `undefined`, `boolean`, `number`, `string`, `symbol`, and `bigint`.

Two related concepts are worth understanding:

- **Autoboxing:** JavaScript lets you access methods on most primitives by treating them as their object counterparts. For example, a string can use methods from `String.prototype`. This does not apply to `null` or `undefined`.
- **Type coercion:** JavaScript converts a value from one type to another. For example, `'5' * 2` evaluates to `10`.

These are different behaviors: calling a method on a primitive is not the same as converting it to another primitive type.

Symbols are especially useful for creating unique object keys in shared code and libraries.

<a id="functions"></a>

### Functions

Prefer **function declarations at the file level**. Their hoisting lets you put the main logic first and supporting functions farther down the file.

Use **arrow functions for callbacks and short inline logic**.

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

Hoisting makes a function declaration available earlier in the file. It does not guarantee that every value the function uses has already been initialized.

Also, stack traces are not a strong reason to avoid function expressions. JavaScript generally infers a name for functions assigned to variables:

```ts
const normalizeName = (name: string) => name.trim();
```

A stack trace can still identify this function as `normalizeName`.

<a id="objects"></a>

### Objects

Objects commonly appear as:

- Object literals.
- Class instances.
- Runtime objects generated by regular TypeScript enums.

For custom constructor functions, prefer modern class syntax over the older `function` plus `new` pattern.

<a id="object-literals"></a>

#### Object literals

Object literals are a simple way to create plain objects.

Readonly object literals also work well as namespaces. If you only need to group related values or stateless functions, you usually do not need a class.

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

Both classes and factory functions can support object-oriented designs:

- Factory functions can keep private state in **closures**.
- Classes can keep private state in **`#private` fields**.

TypeScript’s `private` keyword is different: it is checked at compile time, but the property remains an ordinary property at runtime.

An object literal by itself does not provide instance-private storage. If you keep its state in non-exported module variables, that state belongs to the module and is shared by its importers.

##### When a class is a good fit

Use a class when:

- An object has internal state that its methods update over time.
- You need to extend a class you do not control, such as the built-in `Error` class.

##### When to reach for something simpler

Avoid using a class:

- **Just as a namespace.** Use an object literal instead.
- **To assemble a configured object with no meaningful lifecycle or need for `this`.** A factory function is often a better fit.
- **Simply to wrap I/O data**—data read from or written to databases, files, or APIs.

For I/O data, this guide favors **plain data plus functions**. Keep the data simple, and use module objects to group stateless functions that act on it.

This avoids building layers of class instances around data that mainly needs to be validated, transformed, or transferred.

Other approaches, such as domain-driven design, often favor richer domain objects. Both approaches can work; choose deliberately and keep the boundaries clear.

##### Why not use factory functions for everything?

You can, but classes make two things convenient:

- **Shared methods:** Class instance methods normally live on the prototype. A factory that defines methods inside each returned object creates new function objects on every call.
- **Inheritance:** Extending an existing class is simpler with `class ... extends ...` than manually setting up a prototype chain.

Factories can share methods through a prototype too, but then per-instance private state needs a different design. Classes provide shared methods and `#private` fields directly.

##### Class conventions I use

**Prefer factory methods when you want control over construction.**

My usual approach is a `protected` constructor with public factory methods such as `create`, `of`, and `from`.

Factories can provide named creation paths, return subtypes, and handle setup that does not fit neatly into a constructor.

A `private` constructor also works, but prevents ordinary subclassing because subclasses cannot call `super()`.

This is a house convention. Public constructors and `new` are the usual JavaScript approach; you do not need a factory method for every class.

**Keep logic that does not need `this` outside the class.**

Put that logic in top-level function declarations below the class. See [Keep classes clean](./code/keep-classes-clean.ts).

**Expose a focused interface for larger classes.**

If a class is large enough to deserve its own file, consider defining an interface for the instance members callers need. Have factory methods return that interface.

This lets callers depend on the public contract rather than the concrete implementation, making mocks and alternative implementations easier to use. It narrows what callers see through the type; it does not hide properties at runtime.

I sometimes prefix these interfaces with `I` to distinguish them from the implementation. Many style guides avoid that prefix, so treat it as a naming preference rather than a TypeScript requirement.

For a side-by-side example, see [OO with classes vs. factory functions](./code/oo-classes-vs-FFs.ts).

<a id="enums"></a>

#### Enums

Prefer a **constant object paired with a type of the same name** over a TypeScript enum.

Enums require more than simply removing type annotations:

- Regular enums generate runtime JavaScript.
- `const enum` values can be inlined by the compiler.
- Neither form is supported by tools that only strip types, such as Node.js’s type-stripping mode.
- TypeScript’s `erasableSyntaxOnly` option rejects enum syntax.

A plain object avoids those restrictions:

```ts
const UserRoles = {
  BASIC: 0,
  ADMIN: 1,
  OWNER: 2,
} as const;

type UserRoles = typeof UserRoles[keyof typeof UserRoles]; // 0 | 1 | 2

const basic: UserRoles = UserRoles.BASIC;
```

The object and type can share a name because TypeScript keeps value declarations and type declarations in separate spaces.

This is not declaration merging. Declaration merging combines compatible declarations, such as two interfaces with the same name.

<a id="types-link"></a>

### Types

Type aliases and interfaces can both describe object shapes.

If you are unsure which to use, the TypeScript handbook offers a useful starting point: **use interfaces until you need a feature that requires a type alias**.

In practice:

- Use **interfaces** for object contracts you expect to extend.
- Use **type aliases** for unions, tuples, mapped types, and other type expressions.

Interfaces can also be easier for the compiler to handle than large intersection types, though performance depends on the actual types involved.

Both disappear from the generated JavaScript, so choosing one over the other does not change runtime performance.

---

<a id="file-types"></a>

## 📄 File types and categories

People often use *file*, *script*, and *module* interchangeably, but scripts and modules have different scoping rules.

### Language-level file types

| Type | Meaning |
| --- | --- |
| **Module** | Usually a file with imports or exports. Its top-level declarations are scoped to the module. Other modules use exports to access its public API. |
| **Script** | A file treated as a non-module. In TypeScript, its top-level declarations can contribute to the shared global scope. |

TypeScript’s module detection also depends on settings such as `moduleDetection` and the package environment, so imports and exports are not the only possible signals.

### Organizational file categories

These categories describe a file’s main role:

| Category | Purpose |
| --- | --- |
| **Single-export** | Exports one main standalone item, such as a large function, class, or configuration object. |
| **Module object** | Default-exports a namespace object that groups the file’s public values and functions. |
| **Inventory** | Exports several independent declarations, such as shared types or small utilities. |
| **Linear** | Runs a sequence of setup steps or commands, often during startup. |

These are organizational labels, not additional TypeScript file types.

See [File category examples](./docs/File-Category-Examples.md) for examples.

### Why I use module-object files

For application logic whose structure is fixed after startup, I prefer module-object files. This applies to both client and server code; UI components generally follow their framework’s own conventions.

Module objects give related functions one clear home:

- Callers import one object instead of a list of functions.
- The file’s public API is collected in one place.
- Helpers are less likely to be exported accidentally.
- Related function names are grouped under a namespace.

There is no need to use a class just to get this organization.

This differs from many style guides, which prefer named exports. Named exports often work better with editor tooling and give bundlers more opportunities to remove unused code.

If those benefits matter to your project, you can keep the same call style with named exports and a namespace import:

```ts
import * as User from './User';

User.create();
```

Module objects are a house convention, not a requirement for well-organized code.

---

<a id="file-organization"></a>

## 🗂️ File organization

A predictable layout makes unfamiliar files easier to navigate. Readers should be able to guess where something belongs before searching for it.

### The hierarchy

Organize code from largest to smallest:

1. **Folders**
2. **Files**
3. **Regions**
4. **Sections**
5. **Blocks**, either at the file level or inside a function.

### Top-down file layout

After imports, use this region order:

| Order | Region | Contents |
| --- | --- | --- |
| 1 | **Docs** | File-level documentation. |
| 2 | **Constants** | Primitive constants, object constants, then value factory functions. |
| 3 | **Types** | Interfaces, type aliases, and other local type definitions. |
| 4 | **Classes** | Small local classes. Larger classes usually belong in their own files. |
| 5 | **Init** | Initialization and setup. |
| 6 | **Components** | JSX components, when applicable. |
| 7 | **Functions** | Function declarations and supporting logic. |
| 8 | **Export** | The file’s public API. |

For single-export, module-object, and linear files, collect exports at the bottom.

For inventory files, export declarations where they are defined. This makes it easier to see which individual items are public.

Function hoisting makes this top-down organization convenient, but runtime initialization still matters. Values must be initialized before code tries to use them.

### Regions

Use a three-line divider for a major region:

```ts
// ========================================================================= //
//                                 CONSTANTS                                 //
// ========================================================================= //
```

### Sections

Use a single-line divider for a smaller group within a region:

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

Use a short comment divider to separate blocks, both at the file level and inside larger functions:

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

You do not need to center dividers by hand. Write `// @reg Label` or `// @sec Label` on its own line, then run [code-divider](https://github.com/seanpmaxwell/code-divider):

```bash
npx code-divider
```

It replaces the markers with centered dividers, uppercases region labels, and capitalizes section labels.

### What belongs in the Constants region?

Use this region mainly for fixed data. It can also contain helpers whose main purpose is to provide data:

- Value factory functions.
- Configured constant objects.

For example:

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

VFFs are an exception to the usual function conventions because their main job is to provide values.

For VFFs:

- Place them in the **Constants** region.
- Use **PascalCase**.
- Use a function expression rather than a declaration.
- A noun-based name is fine; it does not need to start with a verb.

This keeps them visually grouped with the values they provide.

### Configured functions and initialization order

A configured function is assigned to a variable:

```ts
const isValidAddress = isValidShape({
  // ...
});
```

Unlike a function declaration, it cannot be used before that assignment runs.

A `const` declaration is technically hoisted, but it remains inaccessible until initialization. That period is called the **temporal dead zone**.

Often, the simplest solution is to initialize the configured function earlier. If your file layout requires an earlier call, a hoisted function declaration can create and cache the configured function on first use.

Here is the pattern:

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

The wrapper is hoisted. The configured validator is created on the first call and reused afterward.

This handles the initialization-order issue. Depending on your lint rules, you may also need to allow references to function declarations before their position in the file.

### Short local type aliases

Prefer descriptive type names.

If a signature feels too long, first look for simpler wording in the function name rather than replacing the type with an acronym readers need to memorize.

For example:

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
```

A shorter local alias can still help when a complex type appears repeatedly. Keep it close to the code that uses it, and choose a name that remains understandable on its own.

The goal is easier reading—not fewer characters at any cost.

### Exceptions for linear files

Large setup files do not need to follow the region order rigidly.

Group related steps into blocks, and put each block’s constants near the top of that block. Keeping setup steps together is more useful than forcing every declaration into a distant region.

### Comments and spacing inside functions

For ordinary functions, I prefer a compact layout: use short comments to separate related steps instead of adding blank lines between every group.

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

If a function is large and cannot reasonably be split, use block dividers and blank lines to make its phases easier to follow:

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

---

<a id="naming-conventions"></a>

## 🏷️ Naming conventions

Names should make an item’s purpose clear without requiring readers to open the file or inspect its implementation.

### Folders and files

| Item | Convention |
| --- | --- |
| **Folder** | Use `kebab-case`, or name it after the main item it contains. |
| **Linear file** | Use `kebab-case`. |
| **Single-export file** | Match the name of its main exported item. |
| **Module-object file** | Match the name used for the module object in code. |
| **Inventory file** | Use `kebab-case`. |

Reserve these filenames for specific purposes:

- **`index.ts`:** A barrel file that provides a single entry point for a folder.
- **`main.ts`:** The starting point of an application.

As a rule of thumb, think of `index.ts` as a library or folder entry point, and `main.ts` as an application entry point.

If the purpose of a file is still unclear, add a descriptive suffix:

```ts
import User from '@src/models/User.model';
```

### Readonly values

Use **`UPPER_SNAKE_CASE`** for module-level primitive constants and readonly arrays.

For namespace-style constant objects:

- Use **`PascalCase`** for the object and nested object names.
- Use **`UPPER_SNAKE_CASE`** for keys holding fixed values.

If the entire object is passed around as a value rather than used as a namespace, prefer `UPPER_SNAKE_CASE` for its name. Keep whatever property names its consumers require.

### Module objects

Use **`PascalCase`** by default:

```ts
import DateUtils from '@src/utils/DateUtils';
```

For widely used infrastructure objects with substantial initialization, I prefer **`camelCase`**:

```ts
import db from '@src/infra/db';
```

Match the filename to the object’s name in code.

Using PascalCase for module objects, constant objects, and VFFs is a house convention. In many JavaScript projects, PascalCase is reserved for classes, types, and components.

I use it here to distinguish value providers and namespaces from ordinary variables and functions.

### Local variables

Use **`camelCase`** for variables inside functions. Type declarations keep their normal PascalCase naming.

### Functions

Use **`camelCase`** for ordinary functions.

Use **`PascalCase`** for:

- JSX component functions.
- Value factory functions, such as `const Defaults = () => ...`.

For function names:

| Pattern | Use it for | Example |
| --- | --- | --- |
| `get...` | Retrieving or computing values without I/O. | `getDateAsString()` |
| `fetch...` | Reading data through I/O. | `fetchUserRecords()` |
| `is...` | Validators and type guards. | `isValidUser(value: unknown): value is IUser` |
| `...OrThrow` | A throwing counterpart to a function that can return no result. | `findUserByIdOrThrow()` |
| A trailing `_` | Avoiding a reserved word in a function declaration. | `delete_()` |

For example, these signatures communicate different failure behavior:

```ts
findUserById(id: number): IUser | null
findUserByIdOrThrow(id: number): IUser
```

VFFs are an exception to verb-based naming because they primarily provide values.

### Classes and types

Use **`PascalCase`** for classes, interfaces, and type aliases.

Prefixes such as `I` for interfaces and `T` for type aliases are less common than they used to be.

I only recommend an `I` prefix when it helps distinguish an interface from a related class or object:

- `IUser`: The database entity’s type.
- `User`: The module object exported from `User.model.ts`.

### Booleans

Prefix boolean names with **`is`** so they read like a condition:

```ts
const isEnabled = true;
const isValid = false;
```

### Abbreviations and acronyms

Prefer clear names over clever shortcuts.

Abbreviations are reasonable when readers already recognize them:

- Established acronyms, such as `URL` and `API`.
- Familiar abbreviations, such as `Pwd` or `Img`, when the meaning is clear.
- Project-specific abbreviations that are well understood by the team.

Using all caps for established acronyms is fine:

```ts
insertIntoURL();
```

Avoid shortening words in `UPPER_SNAKE_CASE` names unless there is a good reason.

### Useful suffixes

| Suffix | Meaning |
| --- | --- |
| **`View`** | Data shaped for display in a UI, such as `UserInfoView`. |
| **`DTO`** | A data transfer object used to move data between parts of an application or across boundaries. It does not have to represent an API request. |
| **`Label`** | A string formatted for display, such as `createdAtLabel`. Use it for properties or individual values, not entire objects. |
| **`Payload`** | An object shaped for transfer through an API call. |

For example:

- `IUser['createdAt']` might contain an ISO date string.
- `UserView['createdAtLabel']` might contain a date formatted as `MM/DD/YYYY`.

See [User.model.ts](./code/User.model.ts) for more naming examples.

---

<a id="comments"></a>

## 💬 Comments

Use comments to explain purpose, intent, and anything readers cannot easily infer from the code.

My conventions are:

- Put a `/** ... */` documentation comment above every function declaration.
- Use `//` or no comment for function expressions, depending on whether an explanation helps.
- Document utility types with `/** ... */`, especially when their behavior is not obvious.
- Mark test-only items with `@testOnly`.
- Use `//` for inline explanations.
- Capitalize and punctuate comments.
- Separate major regions clearly.

A useful comment explains **why the code exists or behaves a certain way**, rather than narrating each line.

---

<a id="imports"></a>

## 📥 Imports

Group imports by where they come from:

1. Third-party libraries.
2. Application modules.
3. Nearby local files.

Split long import lists across multiple lines.

Prettier can handle wrapping and formatting. To enforce import ordering or grouping automatically, use an import-sorting plugin or an appropriate ESLint rule.

---

<a id="organizing-shared-code"></a>

## 🤝 Organizing shared code

Shared code needs a clear home. Otherwise, “just put it in helpers” eventually becomes “where did we put that helper?”

This section builds on the **branch directory** and **focused directory** terms from [Terminology](#terminology).

The examples use React-style folders, but the same ideas apply to client-side and server-side TypeScript projects.

### Shared-code categories

Start with three main categories, plus a fourth for projects using JSX:

| Category | Contents |
| --- | --- |
| **`utils`** | Generic runtime helpers. |
| **`constants`** | Readonly values and value factory functions. |
| **`types`** | Standalone type aliases and interfaces, with no runtime code. |
| **`ui`** | Shared `.jsx` or `.tsx` files. |

Utilities may depend on third-party libraries and other lower-level utilities. They should not depend on application services, controllers, or feature-specific workflows.

Keep dependencies one-way and avoid cycles. Two utilities do not need to live in the same file to call one another.

Application-specific data access belongs in repositories or infrastructure adapters, not generic utility files.

Keep types beside their runtime logic when the two are closely related. Use the shared `types` category for types that genuinely stand on their own.

### Branch directories: `_common/`

Create a `_common/` folder when code is shared across a branch directory.

Avoid vague folder names such as `misc/` or `helpers/`. They say little about what belongs there and tend to become catch-all folders.

Inside `_common/`, category folders such as `types/`, `utils/`, and `constants/` are fine. File names should still describe their contents:

```text
src/_common/types/utility-types.ts
```

Nested branches can have their own `_common/` folders:

```text
public/
src/
├── assets/
├── _common/
│   └── types/
│       └── utility-types.ts
├── components/
│   ├── _common/                  ← Shared across components.
│   │   ├── ui/
│   │   │   └── buttons.tsx
│   │   └── styles/
│   │       └── box-styles.ts
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

Here, `src/` and `components/` are branch directories. `Home/` and `Login/` are focused directories.

### Focused directories: `_local/`, `_external/`, and `_internal/`

A focused directory already tells readers which feature the code belongs to. Its helper folders can therefore use a more local vocabulary.

| Folder | Purpose |
| --- | --- |
| **`_local/`** | Helpers used within the focused directory. They may also be shared with outside consumers when that makes sense. |
| **`_external/`** | Helpers provided for outside consumers but not used internally. |
| **`_internal/`** | Implementation details that should not be used outside the focused directory. |

Inside `_local/`, broad file names such as `utils.ts`, `constants.ts`, or `ui.tsx` are acceptable because the surrounding directory supplies the context.

Keep those broad names out of the focused directory’s root:

```text
Login/_local/ui.tsx  ← Good: clearly a local helper.
Login/ui.tsx         ← Avoid: its role is less clear.
```

`_local/` is intentionally flexible. A helper does not need to move elsewhere just because one outside consumer also uses it.

Use `_internal/` for code you want to keep private to the feature. It is also a useful home for a large helper extracted from one file, even if that helper is only called once.

These names communicate intent; they do not enforce access restrictions on their own.

For example:

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

In this example:

- `datatable-elements.tsx` is shared inside and outside `DataTable/`.
- `dataTableFilterToUrlString.ts` is a helper for outside consumers.
- `sortTableData.ts` is an internal helper used only by `DataTable.tsx`.
- `Login/_local/ui.tsx` contains UI pieces shared by `Login` and its dialogs.
- `AuthDialog.tsx` provides a common foundation for the two authentication dialogs.

### Add categories when they help

You do not have to limit `_common/` or `_local/` to the categories listed above.

Create a more specific category when it has a clear, recurring purpose. For example:

- **`classes/`:** Shared classes, such as custom error types.
- **`entities/`:** Types representing database entities.

Specific categories are usually more helpful than forcing everything into `utils/`.

### Let responsibilities—not folder names—control data access

A folder such as `_internal/` describes who should use its contents. It does not determine which application layer those contents belong to.

Keep persistence access in repositories and infrastructure adapters, regardless of their folder location.

For example:

- An internal repository may access the database.
- An internal service may coordinate work through repositories.
- A generic helper should not contain application-specific data access.

This keeps access boundaries separate from architectural responsibilities.

---

<a id="philosophy"></a>

## 🧠 Philosophy

<a id="testing"></a>

### Testing

#### Testing terminology

| Test type | What it checks |
| --- | --- |
| **Unit test** | A small piece of behavior in isolation, usually within one unit or layer. |
| **Integration test** | Multiple units, modules, or layers working together. |
| **End-to-end test** | A complete user flow through the running system, often including both client and server. |

The boundaries vary between teams.

For example, any test of multiple cooperating units can be called an integration test. In backend projects, the term often refers more specifically to tests that call a route and exercise several layers together.

See [Architecture](#architecture) for the layer terminology used here.

#### Testing conventions

**Cover important behavior, not every imaginable input combination.**

Test each unit’s meaningful behavior, including boundary conditions and failure paths. This includes behavior triggered by users, scheduled jobs, other services, and internal operations.

Use integration tests to check how units cooperate, and end-to-end tests to protect critical user workflows.

**Developers should write their own unit tests.**

This matters even during rapid development. Writing tests is also a useful proofreading pass: it often reveals confusing interfaces, missing cases, and code that is difficult to explain.

Ideally, developers write integration tests too. A dedicated tester can also write them, giving the code a valuable second set of eyes.

**Add end-to-end tests where they provide the most value.**

E2E tests protect important user flows, but they take time to write and maintain and require familiarity with tools such as Cypress.

Early in development, it can be reasonable to focus on unit and integration tests, then add E2E coverage as the application stabilizes. Start with the flows that would hurt most if they broke.

---

<a id="programming-paradigms"></a>

### Programming paradigms

TypeScript supports several programming styles. You do not need to commit every part of a project to the same one.

- **Procedural programming** organizes work into functions that operate on data.
- **Object-oriented programming** organizes behavior around objects and commonly emphasizes encapsulation, abstraction, inheritance, and polymorphism.
- **Functional programming** emphasizes composing functions, immutable data, and controlling side effects. Pure functional programming applies these ideas more strictly.

Using functions instead of classes does not automatically make code functional in the programming-paradigm sense.

This guide favors procedural organization: **plain data, clear functions, and explicit application layers**. It uses OOP where objects with state and behavior make the design simpler.

Both classes and factory functions can support OOP. When I need that style, I generally prefer classes.

Choose the approach that makes the particular problem easier to understand—not the one that lets you use the same pattern everywhere.

---

<a id="documenting-code"></a>

### Documenting code

Good model documentation saves repeated trips to the database manager just to answer questions such as “What does this field reference?”

Keep the important relationships close to the code that uses them.

#### Model terminology

| Term | Meaning |
| --- | --- |
| **Model layer** | Code describing and working with the shape of stored data. |
| **Comment tag** | A keyword beginning with `@` inside a comment. |
| **Entity type** | A type representing a row in a database table. |
| **Auxiliary table** | A table supporting another table, such as `user_avatars` supporting `users`. |
| **Join table** | A table connecting other tables, such as `projects_users`. |
| **Derived type** | A type built from an entity type, often with added or transformed fields. |
| **Audit column** | A column describing an entity’s lifecycle, such as `createdAt` or `createdBy`. |

People also call database rows *records*. I avoid that term in type names when it could be confused with TypeScript’s `Record<>` utility type.

For join-table names, I use the plural names of both tables: `projects_users`, for example.

#### Useful comment tags

TypeScript already describes parameter and return types, so there is usually no need to repeat those types in JSDoc.

Use `@param` and `@returns` when they add information the types cannot express, such as constraints, units, side effects, or the meaning of a result.

Standard JSDoc tags include:

- **`@private`:** Marks an item as private in documentation.
- **`@param`:** Describes a parameter.
- **`@returns`:** Describes the returned result.
- **`@see`:** Points readers to related documentation.

This guide also uses custom tags:

| Tag | Purpose |
| --- | --- |
| `@testOnly` | An item used only by tests, not production code. |
| `@cronJob` | A function used by scheduled jobs rather than user requests. |
| `@dummyData` | A function used to generate or manage dummy data. |
| `@startupTime` | A function intended to run during startup rather than request handling. |
| `@entity` | Identifies the database table represented by an entity type. |
| `@auxiliaryOf` | Identifies the table supported by an auxiliary table. |
| `@joins` | Identifies a table connected through a join table. |
| `@route` | Identifies a route handler’s HTTP method and path. |

Custom tags may need to be registered with your documentation tooling. They describe intent; they do not enforce application behavior unless you configure tools to act on them.

`@startupTime` is especially useful in request-driven applications, where startup logic and request handling have different responsibilities.

#### Linking private helpers to their callers

Keep the caller link in the description, with `@private` on its own line:

```ts
/**
 * Prepare the values needed by the parent operation.
 *
 * Used by {@link parentFunction}.
 *
 * @private
 */
```

This is clearer and more portable than putting the link inside the `@private` tag.

Remember that a documentation tag does not make an exported function inaccessible. Use module exports to control a file’s actual public API.

#### Documenting database relationships

Use `@entity` above an entity type to identify its table:

```ts
/**
 * @entity users
 */
interface User {
  name: string;
}
```

For an auxiliary table, add `@auxiliaryOf`:

```ts
/**
 * @entity user_avatars
 * @auxiliaryOf users
 */
```

For a join table, list each related table:

```ts
/**
 * @entity charts_users
 * @joins users
 * @joins charts
 */
```

Within entity types, use this property order:

1. **Primary keys:** `// @PK`.
2. **Ordinary data fields:** Names, descriptions, and other stored values.
3. **Foreign keys:** `// @FK`, followed by the relationship cardinality.
4. **Audit columns:** `// @AC`, unless the column is already marked as a foreign key.
5. **Transient fields:** `// @TE` for values added outside the database.

For example:

```ts
userId: number; // @FK 1-1
createdAt: Date; // @AC
```

These tags describe the database schema; they do not enforce it.

A one-to-one relationship normally requires both a foreign-key constraint and a uniqueness constraint on the referencing column. A foreign key alone does not prevent several rows from referencing the same parent.

Prefer a derived type over adding transient fields directly to an entity type.

#### Example: user entities

In this example, the database declares `user_avatars.userId` as both a foreign key and a unique column. That allows at most one avatar row per user.

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
  fileName: string | null;
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

For backend route handlers, include the HTTP method and path. It makes handlers much easier to find later.

Keep route handlers focused on HTTP concerns and delegate application work to a service.

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

Here, `validateUserIdParam` is middleware responsible for rejecting invalid route parameters before the handler runs. For example, it can require a decimal ID that converts to a positive safe integer.

`Number()` performs conversion, not validation. Make the validation boundary explicit rather than relying on conversion to reject bad input.

---

<a id="architecture"></a>

### Architecture

Architecture should make responsibilities easy to find and dependencies easy to follow.

#### Basic terminology

- **Domain:** A high-level business area that groups related features. For example, `Auth` might contain signup, login, and password recovery.
- **Layer:** A part of the application with a specific responsibility, such as handling requests or accessing stored data.

#### Common layers

| Layer | Responsibility |
| --- | --- |
| **Repository** | Reads and writes persisted data. Use the `Repo` suffix. |
| **Service** | Handles business logic on the server, or API calls on the client. |
| **Operations** | Handles client-side business logic. Use the `Ops` suffix. |
| **Cron jobs** | Run scheduled server-side work. |
| **Controller** | Handles incoming client requests and delegates application work. |
| **Middleware** | Performs framework-level request processing, such as validation or formatting. |
| **Infrastructure** | Sets up and wraps external systems, such as database connections, storage clients, or HTTP clients. |

When several storage systems are involved, make the repository names specific:

- `UserRepo.ts` works with database records.
- `UserAssetRepo.ts` works with stored user files, such as objects in S3.

On the server, services coordinate persistence work through repositories or infrastructure adapters rather than embedding low-level storage operations in business logic.

#### Service conventions I use

These are house conventions for keeping larger applications organized.

**Give controllers one clear service entry point per domain.**

Controllers should call the domain’s primary service rather than reaching into repositories or infrastructure directly.

For example:

```text
Controller → Service → Repository or infrastructure adapter → Persistence
```

**Use auxiliary services to split up larger workflows.**

Name them `...Service.aux.ts`.

Auxiliary services may contain business logic and access repositories or infrastructure, but controllers should not call them directly.

For example:

- `UserService.ts` is the controller-facing service.
- `UserAssetService.aux.ts` handles avatar work that involves database records and binary storage.

**Use non-I/O auxiliary services for business logic that does not access external systems.**

I call these *static auxiliary services* and name them `...Service.saux.ts`, or use a clear descriptive name ending in `.saux.ts`.

These files are useful when calculations, transformations, or other non-I/O business rules become large enough to extract.

Keep application-specific business logic out of generic `utils/` folders. Utilities should remain broadly reusable; business rules should stay with their domain.

#### Layer-based architecture

For a small application or a solo project, grouping by layer provides a straightforward map:

- Folder names clearly describe technical responsibilities.
- The structure is easy to explain and navigate.
- As features grow, related code becomes spread across more folders.

For example:

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
│   │   └── UserAssetService.aux.ts
│   └── PostService.ts
├── main.ts
└── server.ts
tests/
├── users.test.ts
└── posts.test.ts
package.json
tsconfig.json
```

Here, `UserAssetService.aux.ts` might be added later to handle uploading avatars to remote storage.

Why `UserRepo.ts` rather than `user.repo.ts`? These are module-object files, so their filenames match the objects used in code. See [Naming conventions](#naming-conventions).

#### Domain-based architecture

For larger applications, I prefer grouping by business domain.

This keeps related layers close together and makes it easier to:

- Add features without growing one enormous services folder.
- Define ownership boundaries between teams.
- Keep changes within a smaller part of the project.
- Limit unnecessary dependencies between features.

The trade-off is that business-oriented folder names may be less immediately obvious than technical names such as `repos/` and `services/`.

Domain folders also do not automatically prevent circular dependencies or merge conflicts. They provide boundaries; the code still needs to respect them.

For example:

```text
config/
src/
├── _assets/
├── _common/
├── cronjobs/
├── domain/
│   ├── users/
│   │   ├── _local/
│   │   │   ├── constants/
│   │   │   │   └── errors.ts
│   │   │   └── types/
│   │   │       └── schemas.ts
│   │   ├── UserRepo.ts
│   │   ├── UserService.ts
│   │   ├── UserAssetService.aux.ts
│   │   └── UserController.ts
│   └── posts/
│       ├── _internal/
│       │   └── PostToPDF.saux.ts
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

In this layout:

- User-related layers stay together under `domain/users/`.
- Post-related layers stay together under `domain/posts/`.
- Shared infrastructure lives under `infra/`.
- `PostToPDF.saux.ts` contains the non-I/O business logic for preparing a post as a PDF.

##### Keeping domain folders tidy

Keep the domain’s main layer files directly in its root:

```text
UserRepo.ts
UserService.ts
UserController.ts
```

Place supporting files in `_local/`, `_internal/`, or `_external/`, following the conventions in [Organizing shared code](#organizing-shared-code).

A layer file can also live in one of those folders when its intended audience calls for it. For example, an internal service can live in `_internal/` without changing its architectural responsibility.

The main advantage is that a growing feature already has a home. In a layer-based layout, adding a user-related service may require introducing a `UserServices/` folder and moving files. In a domain-based layout, those files already belong together.

These examples use a backend web server. For a client-side example, see [React + TypeScript Best Practices](https://github.com/seanpmaxwell/React-Ts-Best-Practices).
