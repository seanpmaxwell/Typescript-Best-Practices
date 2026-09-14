# 🚀 TypeScript Best Practices

[![GitHub stars](https://img.shields.io/github/stars/seanpmaxwell/Typescript-Best-Practices?style=flat-square)](https://github.com/seanpmaxwell/Typescript-Best-Practices/stargazers)

Patterns and best practices for **procedural TypeScript / JavaScript development**, guided by the **Rule of 4** principle.
<br/>

## 📚 Table of Contents

- [Terminology](#terminology)
- [Core Language Features](#core-language-features)
  - [Primitives](#primitives)
  - [Functions](#functions)
  - [Objects](#objects)
    - [Object Literals](#object-literals)
    - [Classes](#classes)
    - [Enums](#enums)
  - [Types](#types-link)
- [File Types and Categories](#file-types)
- [File Organization](#file-organization)
- [Naming Conventions](#naming-conventions)
- [Comments](#comments)
- [Imports](#imports)
- [Organizing Shared Code](#organizing-shared-code)
- [Philosophy](#philosophy)
  - [Testing](#testing)
  - [Programming Paradigms](#programming-paradigms)
  - [Documenting code](#documenting-code)
  - [Architecture](#architecture)

<br/><b>***</b><br/>

<a id="terminology"></a>
## 🔠 Terminology

So that things are clearer down the line, let's first clarify some terminology.

---

### Projects/Packages
- **Package**: any JavaScript/TypeScript project with a `package.json` is a **package**.
- **Application**: packages meant to be executed.
- **Library**: shared packages to be used by applications or other libraries.

---

### Files/Folders
- **root**: The highest level folder in a package.
- **branch-directory**: a directory other than the root with a broad focus and multiple nested directories of its own.
- **leaf-directory**: a directory with no nested-directories
- **focused-directory**: a nested-directory with a very narrow scope and purpose and is often a **leaf-directory** although not necessarily.
- Example:
  1. `package name/` <--root
  2.  `src/` <-- branch
  3.  `components/` <-- branch
  4.  `Login/` <-- focused
  5.  `_local/` <-- leaf
 
---

### Lifecycles
- **Compile-time:** the period before a program starts, when TypeScript is type-checked and converted to JavaScript.
  - Technically, `tsc` is a compiler: _transpiling_ (compiling source code to other source code) is just one kind of compiling. In everyday use, though, people often say TypeScript is "transpiled, not compiled" to distinguish it from languages which compile to machine code.
- **Runtime:** Everything that happens after compilation is runtime. Runtime can be further divided into:
  - **Startup-time:** When the application boots up.
  - **Request-time:** Code runs in response to input (e.g. a user triggers an API call).
 
---

<a id="terminology-objects"></a>
### Objects 
- **States**: Objects can be **static**, **readonly**, or **dynamic**.
  - **static:** values can change but not keys (default for TypeScript).
  - **dynamic:** keys and values can change (default for JavaScript).
  - **readonly:** neither keys nor values can change. `as const` enforces this at compile-time only; use `Object.freeze()` if you also need runtime immutability (note that it's shallow).
- **classes:** Template for describing objects using "Object-Oriented-Programming".  
- **object-literal:** curly-brace syntax `{ ... }` for describing and instantiating objects.
- **plain-objects:** objects which inherit directly from the root `Object` class and nothing else OR objects created with `Object.create(null)` (aka null-prototype objects).
  - Type is commonly `Record<PropertyKey, unknown>` although there is no way to enforce a plain-object type at compile-time.
  - 3 ways to implement: object-literals, constructor-functions `new Object()`, or `Object.create(null)`.
  - Note that instances of the Object class (e.g. object-literals) will inherit methods like `.hasOwnProperty`. _null-prototype objects_ inherit from nothing, so they cannot use these methods.
- **dictionary:** plain-objects whose type is narrowed to `Record<string, unknown>`.
  - In code, the type-alias is often shortened to `Dict` (i.e. `type Dict = Record<string, unknown>`).
  - Note: while a plain-object could technically include symbols, most object-iterator functions (e.g. `Object.keys()`) ignore symbols and numbers are converted to strings when used as keys, so you'll sometimes hear the terms plain-object and dictionary used interchangeably. 
- **plain-data-object:** plain-objects which can only contain types that are easily serializable: i.e. `primitives` (except `bigint` and `symbol`), `arrays`, `Dates`, and nested `plain-data-objects`.
  - Note: `Dates` are converted to ISOStrings when serialized and come back as strings (not `Date` objects) when parsed.
  - Note: `JSON.stringify()` throws on `bigint`, and drops `undefined`/`symbol` values from objects (they become `null` in arrays).
  - You can see a full implementation for the `PlainDataObject` type [here](./code/types-reference.ts#L4).
- **namespace-objects:** readonly object-literals used for code organization.
  - **value-object:** namespace-object for storing static values
    - **lookup-table:** value-object which stores static values and their label counterparts for displaying in a UI.
    - **configured-value-object:** a value-object returned from a function call: (e.g. most enum replacement libraries could fall into this category)
  - **module-object:** a namespace-object which is the `export default` from a file.
    - **module** is a type of file in JavaScript (see [File Types and Categories](#file-types) below), so we say **module-object** because it is an object which represents a file.
   
---
 
### Functions
- **top-level:** (aka module-level) Functions defined directly in a file and not nested in another function, object, class, etc. 
- **function-declarations:** any function declared with `function functionName(...) {...}`.
  - NOTE: for the remainder of this tutorial we'll use the acronym FD to refer to function-declarations.
- **arrow-functions:** any function declared with `() => { ... }`
- **embedded-functions:** functions declared in object-literals where the function-name is the object key.
```
const UserErrors = {
  getError(name: string): string {
    return `The user name is ${name}`;
  }
};
```
- **function-expressions:** any function defined where an expression is expected rather than as a standalone statement: e.g. assigned to a variable `const foo = function () {...}`, passed as a callback, or immediately invoked. Arrow-functions are always function-expressions.
- **factory-function:** a function whose primary purpose is to initialize some other function/object rather than perform actions.
  - **value-factory-functions:** a factory-function meant for returning mostly static-data (e.g. `const GetDefaults = () => ({ ... })`: using a function so we get a fresh copy every time).
  - NOTE: for the remainder of this tutorial we'll use the acronyms FF and VFF to refer to factory-functions and value-factory-functions respectively. 
- **configured-functions:** function-expressions returned by a FF: `const parseUser = parseObject(UserSchema)`.
- **validator-functions:** functions which accept an unknown variable and return a type-predicate
- **method:** function declared inside of a class
  - **static-method:** method which can be called directly on the class
  - **instance-method:** method which can only be called by the class's instance
  - **factory-method:** static-method used to return a class instance (Tip: prefer these over constructors)
    - Factory-method conventions:
      - **of** return an instance using individual properties as parameters: e.g. `User.of('name', 'email')`
      - **from** return an instance through transformation: e.g. `User.from("userObjectWhichHasBeenStringified")`
      - **create** return an instance using a partial of the instance-object or defaults: e.g. `User.create({ name, email })`, `User.create({})`, `User.create()`.

---

### Types
- **type-aliases**: any type declared with `type TypeName = ...`.
- **object-type-literal:** the `{ key: Type }` syntax used to describe the shape of an object. It is often named with a type-alias but can also be used inline: e.g. `function foo(arg: { id: number }) {...}`.
- **interfaces**: types declared with `interface SomeInterfaceName { ... }`.
- **utility-types:** type-aliases with generics used for resolving other types.

<br/><b>***</b><br/>

<a id="core-language-features"></a>
## 💡 Core Language Features

This guide revolves around four fundamental language features:

- **Primitives**
- **Functions**
- **Objects**
- **Types**

---

<a id="primitives"></a>
### Primitives 

JavaScript primitives include:

`null`, `undefined`, `boolean`, `number`, `string`, `symbol`, and `bigint`.

Understand **auto-boxing**: when calling methods on primitives, JavaScript temporarily wraps them in their object counterparts (`String`, `Number`, `Boolean`, `Symbol`, `BigInt`). Don't confuse this with **type-coercion**, which is the implicit conversion of a value from one type to another (e.g. `'5' * 2 === 10`).

`symbol` is particularly useful for defining unique object keys in shared or library code.

---

<a id="functions"></a>
### Functions

- Prefer FDs at the file level to take advantage of hoisting: FDs can be called from anywhere in the file, even above where they are declared.
  - Note: stack-traces are not a reason to avoid function-expressions. JavaScript infers the name of a function assigned to a variable (`const foo = () => {...}` is printed as `at foo`); only anonymous inline functions show up without a name.
- Use **arrow-functions** for callbacks and inline logic.

```ts
function parentFn(param: string) {
  const childFn = value => doSomething(value);
  const childFn2 = (a, b) => doSomethingElse(a, b);
}
```

---

<a id="objects"></a>
### Objects

Objects are collections of key/value pairs created via:

- Object-literals
- Classes
- Enums 
> Avoid legacy constructor functions (`new Fn()`) in favor of modern class syntax.

<a id="object-literals"></a>
#### `Object Literals`

Object-literals are convenient templates for initializing plain-objects. Readonly object-literals are ideal as namespaces and often preferable to classes if there's no internal *dynamic* data.

```ts
const Errors = {
  NameMissing: 'The value for name cannot be falsey',
  InvalidEmail(val: string): string {
    return `The value "${val}" is not a valid email format.`;
  },
} as const;
```

<a id="classes"></a>
#### `Classes`

OOP can be achieved in TypeScript/JavaScript with either classes or FFs. Each has its own way of encapsulating data: closures for FFs and `#private` fields for classes. TypeScript's `private` keyword is only enforced at compile-time; at runtime the member is still a regular, accessible property. A bare object literal has neither, so any private state has to live in non-exported variables at module scope, which makes it *shared* by every importer rather than private to an instance.

People coming from strict OOP environments (like Java) tend to overuse classes, but classes do make sense in some situations. Here are some basic guidelines:

- **DO use a class**
  - When you have an object with internal state and methods that modify that state over time.
  - When you need inheritance from a template you don't control (e.g. the built-in `Error`), since `class X extends Error` handles the prototype wiring for you.
- **DO NOT use a class**
  - Solely as a **namespace**. Use a plain object literal instead.
  - When you're **assembling and returning an object whose behavior is fully determined at instantiation**, with no meaningful **lifecycle** and no need for `this`.
    - An FF is the better fit here.
  - For **handling IO-data** (even when you feel tempted to model it as objects), because this often leads to:
    - Many unnecessary **constructor calls** to support dynamic behavior, or a large number of `public static` modifiers.
    - IO-data should be *acted upon*, not do things. (This is the "plain data + functions" position; DDD proponents prefer rich domain objects. Pick one and be consistent.)
    - Use **module-objects** for IO-data: a plain object literal of stateless functions that operate on plain data.
- **Why not just use FFs for OOP?**
  - You can, but there are two trade-offs:
    - **Per-instance allocation:** if the FF returns an object-literal with methods defined inline, every instance gets its own copy of each method.
       - This is technically avoidable — put methods on a shared prototype and return `Object.create(proto)` — but then those methods can no longer see closure-private state. Classes give you shared methods *and* `#private` fields at the same time.
    - **Inheritance:** FFs can inherit via the prototype chain (`Object.create`, `Object.setPrototypeOf`), or sidestep inheritance entirely via composition. But extending templates which you can't modify (like the built-in `Error` class) without the `class` keyword means manually wiring the prototype-chain — more boilerplate than it's worth (believe me, I tried).
- **Tips:**
  - **Tip 1:** When writing classes, make the constructor `protected` and expose factory-methods instead. Factory-methods will provide more flexibility than constructors (e.g. return sub-types). 
    - `private` for the constructor also works, but it makes the class non-extendable, since subclasses can't call `super()`.
  - Conventional class factory-methods:
    - `create(...)` builds from `undefined`, partials, or complete objects you want to clone.
    - `of(...values)` builds from individual values.
    - `from(other)` converts from another type. 
  - **Tip 2:** Keep class definitions clean. Logic that doesn't need `this` belongs in top-level FDs below the class: see [Keep classes clean](./code/keep-classes-clean.ts).
  - **Tip 3:** If a class is large enough to have its own file, define an interface for it containing only the instance methods, and have the factory-methods return the interface type. Callers then depend on the interface rather than the concrete class, you can hide public members you don't want exposed, and mocks/alternate implementations slot in freely.
    - Note: I prefix class-interfaces with `I`; the TypeScript team's own guidelines recommend against it, so treat that as a house convention rather than a rule.

> If you want to visualize these points more, check out this code snippet [OO with classes vs FFs](./code/oo-classes-vs-FFs.ts).

<a id="enums"></a>
#### `Enums`

Enums are not *erasable* syntax: unlike type annotations, they can't simply be stripped out to produce valid JavaScript (regular enums emit a runtime object and `const enum` values are inlined by the compiler). That's why they're discouraged in modern TypeScript configurations (e.g. `erasableSyntaxOnly`) and unsupported by type-stripping runtimes like Node.js. Prefer a **value-object** paired with a **type of the same name** instead. A value and a type can share a name because they live in separate declaration spaces (note that this is not *declaration-merging*, which combines declarations of the same kind, such as two interfaces):

```ts
const UserRoles = {
  BASIC: 0,
  ADMIN: 1,
  OWNER: 2,
} as const;

type UserRoles = typeof UserRoles[keyof typeof UserRoles]; // 0 | 1 | 2

const basic: UserRoles = UserRoles.BASIC;
```

---

<a id="types-link"></a>
### Types

Type-aliases and interfaces are the two primary ways to describe object-types and there's a lot of debate on when to use each. The recommendation from the official TypeScript documentation is to use interfaces until you need to use a type. That's because interfaces are faster to type-check (particularly compared to intersection types; both are erased when transpiling, so there's no runtime difference) and, being open to extension, more closely align with how runtime objects behave. If you're unsure about when to use each, go with the official TypeScript recommendation. 

<br/><b>***</b><br/>

<a id="file-types"></a>
## 📄 File Types and Categories

Important: even though the terms file, script, and module are used interchangeably, there is technically a difference between them.

File _types_:
  - **module**: Any file which has imports/exports. TypeScript will locally scope all declarations inside a module so they will not be accessible to other files unless exported.
  - **script**: A file which does not contain any imports/exports. TypeScript will globally scope all its contents so other files can see them without importing them. 

File _categories_:
  - **declaration:** exports a single declared item (e.g. a large function, enum, or configuration object).
  - **module-object:** `export default` is a namespace-object which organizes the values/logic for a particular file.
  - **inventory:** exports multiple independent declarations, such as shared types or small utility functions.
  - **linear:** executes a series of commands, often for **startup-time** logic.
  - You can see a full list of file-category examples [here](./docs/File-Category-Examples.md).

#### Module-object files are great for organization
I believe that for the backbone of all application logic, which is static after startup-time (both server and client-side, with the exception of JSX elements), module-object files are preferred.

Reasons:
- That way we only need one import at the top.
- Less likely to accidentally export helper functions.
- Less likely to have naming conflicts for exported functions.
- Classes should not be used as namespaces: see the [Classes](#classes) section.

<br/><b>***</b><br/>

<a id="file-organization"></a>
## 🗂️ File Organization

#### Project hierarchy summary: 
  1. `Folders` (aka directories)
  2. `Files` (usually modules: see [File Types and Categories](#file-types))
  3. `Regions`
  4. `Sections`
  5. `Blocks`
    5a. `File Blocks`: blocks directly within files
    5b. `Function Blocks`: blocks within functions

#### Top-down ordering
Due to how hoisting works, regions in a file should be in this order top-to-bottom:
  1. `Docs`
  2. `Constants`
     2a. Primitive-constants
     2b. Object-constants
     2c. VFFs
  3. `Types`
  4. `Classes`: Classes generally should go in their own file but small locally used ones are okay. 
  5. `Init`
  6. `Components`: (if applicable `.jsx` / `.tsx`)  
  7. `Functions`
  8. `Export`: For declaration, module-object, and linear files, group all your exports together at the bottom. For inventory-files you can export items on the line they are declared; this makes it easier to see what's public. 

> Note: **Constants** should be primarily for static data but could also include functions/objects which primarily handle static-data. See **Constants region nuances** below.

Separate regions with:

```ts
// ========================================================================= //
//                      "Region Name" (e.g. Constants)                       //
// ========================================================================= //
```

**Regions** can be divided further into **sections**:

```ts
// ============================ Setup Middleware =========================== //
// Note: if you want to add some comments for a Section or Region separator
// place them here, directly below the separator.

const app = express();

app.use(middleware1);
app.use(middleware2);

do stuff....

// ========================== Configure Front-end ========================== //
const FRONT_END_DIRECTORY_PATH = __dirname + '/client/html';

app.set('views', FRONT_END_DIRECTORY_PATH + '/views');
app.use(express.static(FRONT_END_DIRECTORY_PATH + '/static'));

do more stuff...
```

**Sections** can be divided into **blocks**:
- I use the same type of separator for file AND function blocks.

```ts
// apiRouter.ts <-- Linear file

// ============================ Add User Routes ============================ //
const loginRouter = express.Router();

// ---- Local Login <-- Separate "blocks" with this
// Login with username and password

const localRouter = express.Router();
localRouter.use('/local', addUser);
localRouter.use('/reset-password-request', sendLink);

loginRouter.use('/login', localRouter);

// ---- Google Login
// Login with Google credentials

/**
 * Example of "function-block" separators
 */
function someLargeFunction() {

  // ---- Block 1
  ...do stuff

  // ---- Block 2
  ..do more stuff
}
```

> If adding **region**/**section** separators with perfectly centered labels seems a little tedious (which it is), write `// @reg Label` or `// @sec Label` on its own line and run [code-divider](https://github.com/seanpmaxwell/code-divider) (`npx code-divider`) to replace the markers with centered dividers. Region labels are uppercased and section labels are capitalized for you.

#### *Constants region* nuances
- VFFs (see [Terminology](#terminology) above).
- Although FDs are preferred for functions in most situations, use function-expressions for VFFs so they are more in line with other content in the **Constants** section.
```ts
// bottom of the *Constants* region

// VFFs: we wrapped the defaults in a function so we get a current datetime each time
const UserDefaults = (): IUser => ({
  id: 0,
  name: '',
  createdAt: new Date(),
});

// Configured-value-object
const Roles = SomeEnumLibrary({
  Basic: { value: 1, label: 'Basic' },
  Admin: { value: 2, label: 'Administrator' },
});

...
```

#### VFF nuances
- Because the purpose of VFFs is to return values rather than run logic:
  - These can go in the **CONSTANTS** region.
  - Their name does not have to be in a verb form.
  - Use PascalCase instead of camelCase for the name.
  - Use function-expressions instead of declarations.

#### Configured-function nuances
- Because configured-functions are assigned to a variable, we can't use them above the line they're declared on like we can with FDs (`const` declarations are technically hoisted, but they can't be accessed until initialized: this is called the *temporal dead zone*). Usually this isn't a problem, but if a configured-function is needed in the same file where it is initialized AND in a region above the **FUNCTIONS** region, you can use lazy-loading in an FD to get the hoisting you need. 

##### Hoisting configured-functions example: 
```ts
// User.ts
import { v4 as uuid, validate } from 'uuid';
import { isValidString, isValidShape } from 'some-validation-library';

// Reusable — belongs in `_common/types/utility-types.ts`
type AnyFn = (...args: any[]) => any;
type SetLazy<T extends AnyFn> = T & {
  lazyFn?: T;
};

// ========================================================================= //
//                                   TYPES                                   //
// ========================================================================= //

interface IUser {
  id: string;
  address: IAddress; // required
}

interface IAddress {
  street: string;
  city: string;
}

type IsValidAddress = SetLazy<typeof isValidAddress>;

// ========================================================================= //
//                                 CONSTANTS                                 //
// ========================================================================= //

// ---- Linter issue
// If not lazily-loaded, referencing `isValidAddress` here is only safe when
// `UserDefaults` is called after the module finishes loading, and it can still
// trigger linter errors since it's being referred to before being defined.
const UserDefaults = (address: IAddress): IUser => {
  if (!isValidAddress(address)) throw new Error('Invalid address');
  return { id: uuid(), address: { ...address } };
};

// ---- Runtime issue
// `GuestUser` calls `UserDefaults` while the module is still loading, so a
// non-lazy `isValidAddress` would throw a `ReferenceError` here.
const GuestUser = UserDefaults({ street: 'unknown', city: 'unknown' });

// ========================================================================= //
//                                 FUNCTIONS                                 //
// ========================================================================= //

// What the non-lazy-loaded version looks like. 
// const isValidAddress = isValidShape({
//  street: isValidString({ minLength: 1, maxLength: 255 }),
//  city: isValidString({ minLength: 1, maxLength: 255 }),
// });

/**
 * Validate a user address object: (lazily-loaded).
 */
function isValidAddress(val: unknown): val is IAddress {
  const self: IsValidAddress = isValidAddress;
  const fn = self.lazyFn ??= isValidShape({
    street: isValidString({ minLength: 1, maxLength: 255 }),
    city: isValidString({ minLength: 1, maxLength: 255 }),
  });
  return fn(val);
}

function normalizeId(id: string): string {
  const normalizedId = id.trim().toLowerCase();
  if (!validate(normalizedId)) throw new Error('Id is not valid');
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

### Shorthand-helper types
- If you have long stretches of code and you both can and want to shorten it by assigning a long type name to a shorter name then that's okay. Just make sure the shorter name isn't used anywhere other than the code it's close to. If the type is declared directly in a file, I advise using acronyms to prevent collisions. 
```ts
/**
 * Fetch user subscriptions whose status is suspended and suspension-reason type is 'failed-payment'.
 */
function fetchSubscriptionsWhichAreSuspendedDueToFailedPayments(): Promise<SFFPS[]> {
  return database('subscriptions').where({ ... }).returning('*');
}
type SFFPS = SuspendedForFailedPaymentSubscription;
```

#### Linear-File Exceptions
- For large linear-files, you don't have to follow strict section placement for items, but you should group large linear-files into **code-blocks** and place constants at the top of their respective block.

#### Comments in functions:
- Generally you should not put spaces in functions and separate chunks of logic with a single inline comment.
- If you have a really large function that can't be broken up (e.g. React Component) then you can further separate functions into blocks.

```ts
/**
 * Normal everyday JavaScript function.
 */
function normalFunction() {
  // Do stuff
  foo();
  bar();
  // Do more stuff
  blah();
  whatever();
}
```

```ts
{
  try {
    // ---- Do stuff
    foo();
    bar();
    ...several more lines of code

    // ---- Do more stuff
    blah();
    whatever();
    ...several more lines of code
  } catch (err) {
    handleErrorObject(err);
  }
}
```

<br/><b>***</b><br/>

<a id="naming-conventions"></a>
## 🏷️ Naming Conventions

- **Folders**: `kebab-case` (default) or name them after the primary declared item they are meant to export.
- **Files**:
  - **Linear-file:** `kebab-case`
  - **Declaration-files:** Name them after the item being exported.
  - **Module-object files:** Name them after the module-object that's used in the code. Usually this is PascalCase but not always. See object naming below.
  - **Inventory-files:** `kebab-case`
  - **index.ts** and **main.ts** 
    - Reserve the filename `index.ts` for **barrel-files**. Barrel-files are for creating a single entry point for a folder.
    - Use the filename `main.ts` for a file meant to be the starting point of an application (in contrast to a library).
    - Think of `index.ts` as the entry point for libraries and `main.ts` the starting point for applications.
  - **file suffixes:** If you follow these conventions but a file's intention is still not clear through the name, consider appending a suffix (e.g. `User.model.ts` for `import User from '@src/models/User.model'`).
- **Readonly**:
  - **Primitives/Arrays:** `UPPER_SNAKE_CASE`
  - **Objects**:
    - For value-objects, use `PascalCase` for the object name and any nested objects and `UPPER_SNAKE_CASE` for the keys holding readonly values.
    - If an object is readonly but not a namespace-object (the whole object is being passed as a value) and you need specific key names, UPPER_SNAKE_CASE is preferred for the object name.
    - Ultimately, name module-object files the same way the object is named in the code. Here are some tips for naming module-objects:
      - Prefer `PascalCase` by default: e.g. `import DateUtils from '@src/utils/DateUtils';`.
      - If its functions require a heavy amount of initialization (e.g. infrastructure-level files) and the module-object is used widely throughout your application, prefer `camelCase`: e.g. `import db from '@src/infra/db';`.
- **All variables declared inside of functions except for type declarations**: `camelCase`
- **Functions**:
  - Casing: 
    - `camelCase`: most of the time
    - `PascalCase`: for certain situations
      - JSX Elements
      - VFFs: `const Defaults = () => ...`
  - Prepend functions returning non-IO-data with a `get` and IO-data with a `fetch`: e.g. `getDateAsString()`, `async fetchUserRecords()`.
    - VFFs are an exception; you do not need to declare them in a verb-format.  
  - Prepend **validator-functions** with an `is`: `isValidUser(arg: unknown): arg is IUser`.
  - If you need to distinguish functions meant to throw an error from a counterpart function, append `OrThrow`: e.g. `findUserById(id: number): IUser | null` vs `findUserByIdOrThrow(id: number): IUser`.
  - If you want to avoid collisions with a built-in keyword (e.g. `delete`) append with an underscore (e.g. `function delete_(): IUser ...`).
- **Classes:** `PascalCase`
- **Types**: `PascalCase`
  - Traditionally it was common to prepend interfaces with an `I` and type-aliases with a `T` but these have fallen out of favor. I still recommend prepending interfaces with an `I` ONLY if you need to prevent naming collisions between an interface and some other class/object counterpart: e.g. `IUser` <-- the database entity and `User` from `User.model.ts` <-- `User` is a module-object. 
- **Booleans**: prefix with `is`

**Abbreviations** and **Acronyms**: This is not an exact science and abbreviations/acronyms should generally be avoided for clarity BUT there are plenty of exceptions:
- Well-established acronyms (e.g. `URL`, `API`) and common abbreviations (e.g. `Pwd`, `Img`) are usually okay.
- Using **ALL CAPS** for well-established acronyms is okay: e.g. `insertIntoURL()`.
- Avoid abbreviations for `UPPER_SNAKE_CASE` variable names.
- Uncommon abbreviations/acronyms are okay if they are used widely throughout your project and it's clear to others what their purpose is. 
 
**Suffixes**:
- `View`: objects specifically formatted for going from server to client and rendering in a UI: e.g. `UserInfo` -> `UserInfoView`.
- `DTO` (data-transfer-object): objects which only exist in memory and are for moving data around. They may or may not be for IO calls: e.g. `IUser` <-- database entity, `UserDTO` <-- movement around your backend.
- `Label`: When you need to distinguish a `string` value, specifically meant for rendering in a UI, from the value it was processed from: (e.g. `IUser['createdAt']` <-- an ISOString, `UserView['createdAtLabel']` <-- string formatted as `"MM/DD/YYYY"`).
  - Can be for object-keys or primitive variable names. DO NOT use for object names; use `View` for that.
- `Payload`: An object formatted for movement through an API call.

> The module-object file [User.model.ts](./code/User.model.ts) has some good examples on standard naming conventions.

<br/><b>***</b><br/>

<a id="comments"></a>
## 💬 Comments

- Place `/** */` above all FDs always; `//` or no comment is okay for **function-expressions**.
- I would also recommend `/** */` for utility-types as they can become pretty complex.
- Place a `@testOnly` tag for items not meant to be used in production. 
- Use `//` for inline explanations.
- Capitalize and punctuate comments.
- Separate logical regions clearly.

<br/><b>***</b><br/>

<a id="imports"></a>
## 📥 Imports

- Group imports by origin: libraries → application → local.
- Split long import lists across multiple lines.
- For those of you using Prettier, this can be configured automatically.

<br/><b>***</b><br/>

<a id="organizing-shared-code"></a>
## 🤝 Organizing shared code

Here the terms **branch-directory** and **focused-directory** are important: see the [Terminology](#terminology) section above. Note: even though we used a React schema for our examples, the following section could be applied to any TypeScript project, client or server.

### Shared categories
- Let's consider **utils**, **types**, and **constants** the 3 main **shared-categories**, plus a 4th category, **ui**, for those working with JSX elements.
  - **utils**: runtime logic. Functions under `utils` should not fetch IO-data, talk to persistence layers, or import runtime logic from anywhere else other than third-party-libraries or other utility functions in the same file. This helps to prevent dependency loops.
  - **constants**: organizing readonly values but can also include VFFs.
  - **types**: standalone compile-time items (type-aliases and interfaces, never runtime items) that don't need to be coupled with runtime logic in the shared area.
  - **ui:** Any file ending with a `.jsx/.tsx` extension.

### Branch-directories and the `_common` folder
- In a **branch-directory** with shared content create a subfolder named `_common/`.
- Avoid using **dumping-ground-names** for folders like `misc/`, `helpers/`, `shared/` etc. (except for the common-categories listed above) as their purpose is ambiguous and can quickly degrade your package's organization.
- Within `_common/` it's okay to group folders by category but for files **DO NOT EVER** use dumping-ground names. In branch-directories (including `_common/`) **filenames should always demonstrate clear intent**: (e.g. `src/_common/types/utility-types.ts`).
- You can have multiple levels of `_common/` for nested branch-directories:
```md
- public/
- src/
  - assets/
  - _common/
    - types/
      - utility-types.ts
  - components/
    - _common/ <-- shared folder just for components
      - ui/
        - buttons.tsx
      - styles/
        - box-styles.ts
    - pages/
      - Home/
        - Home.tsx
        - Home.test.tsx
      - Login/
        - dialogs/
          - ResetPasswordDialog.tsx
        - Login.tsx
        - Login.test.tsx
    - App.tsx
    - index.css
  - services/
  - index.html
- package.json
- tsconfig.json
```

> In the above markdown, `src/` and `components/` are examples of **branch-directories**, `Home/` and `Login/` are **focused-directories**. 

### Focused-directories and the `_local` folder
- Use the folder name **_local/** for shared content in a focused-directory.
- Because a file's purpose in a focused-directory has many layers of narrowing, dumping-ground names like `utils.ts`, `ui.tsx`, etc. are actually okay in the `_local/` folder. However, **DO NOT** place files with dumping-ground-names directly in the focused-directory itself. For example, `"focused directory name"/_local/ui.ts` <-- OK, `"focused directory name"/ui.ts` <-- NOT OK.
- If there's focused-directory code which needs to be shared both locally and externally, you can place those items in `_local/` as well: **`_local/` is not meant to be super strict**.
- If a focused-directory has some shared code not used internally, **but it still makes sense to place that code in that particular focused-directory because it's very unique to that directory's purpose,** place those items in the **_external/** folder. For example, a folder exports a table component as well as some helper functions to manage it (e.g. sortByName).
- If you want to be extra careful about some focused-directory items never being used externally, place them in a folder named **_internal/**.
- If some code in a focused directory isn't shared (that is, it's just used in one place but it was large enough to make a separate file for) but you'd like to keep it separated from the other files at a focused-directory's root, you can use `_internal/` for that as well: see the `sortTableData.ts` file in the example below.

Various focused directories in a React project:
```md
- _common/
  - ui/
    - DataTable/
      - _local/
        - datatable-elements.tsx <-- shared inside and outside of DataTable/
      - _external/
        - dataTableFilterToUrlString.ts <-- an external-only helper function.
      - _internal/
        - sortTableData.ts <-- not shared, only called in one place in DataTable.tsx
      - DataTable.tsx
      - DataTable.test.tsx
- Login/
  - _local/
    - ui.tsx <-- stores JSX elements needed by both the `Login` component and the `ForgotPasswordDialog` component.
    - constants.ts
  - dialogs/
    - _local/
      - AuthDialog.tsx <-- base dialog for the other two
    - ForgotPasswordDialog.tsx
    - SignupInsteadDialog.tsx
  - Login.tsx
  - Login.test.tsx
```

### Going further

Folders under `_common/` and files/folders under `_local/` are not confined to common-category names. You can create your own categories too for something used heavily throughout your codebase. Common-categories are more for storing items which don't fit into a specific place. Some other categories I commonly create are:
  - **classes** - I rarely implement new classes but I'll create a folder for them if I do: (e.g. creating custom `Error` objects).
  - **entities** - types used to describe database tables.

Files under `_common`, `_local`, `_internal`, `_external` should never talk to persistence-layers/fetch-IO-data. Use the layers of your application (e.g. Service layer) for that.

<br/><b>***</b><br/>

<a id="philosophy"></a>
## 🧠 Philosophy

<a id="testing"></a>
### Testing

#### Testing Terminology
- **unit-tests:** tests portions of workflows in isolation. Could involve multiple-layers (see <a href="#architecture">Architecture</a> for more about layers) but not typically.
- **integration-tests:** tests two or more units (e.g. functions, modules, or layers) working together, but not the back-end and front-end together.
  - Technically, any test of multiple units working together is an integration-test. In practice though, people often use the term for tests which run through all the layers of the back-end at once (e.g. tests which call server routes).
- **e2e (end-to-end)-tests:** tests client and server together (simulates live user interaction)

#### Testing tips and conventions
- Unit-tests don't have to cover all theoretical scenarios but should cover all workflows a user can trigger.
- Developers should write their own unit-tests even in rapid-development cycles, and ideally their own integration-tests too (see Tip 2 below).
  - Note: requiring developers to write their own unit-tests not only improves correctness but also results in a proofreading step improving code readability.
- e2e-tests are vital to long-term application maintainability but are time-consuming and typically require advanced knowledge of the framework in use (e.g. *cypress*).
  - Tip 1: e2e testing can be skipped in early development phases (as long as unit/integration testing is done).
  - Tip 2: It's okay for teams to have a dedicated tester write the integration-tests instead of each developer (developers should still write their own unit-tests): having an extra set of eyes on the code can improve its quality. 

--- 

<a id="programming-paradigms"></a>
### Programming Paradigms
- To be clear, **OOP (Object-Oriented-Programming)** is a set of design principles, not a specific language feature.
  - The four design principles are: **Inheritance**, **Polymorphism**, **Abstraction**, and **Encapsulation**.
- The term **functional-programming** has been used loosely to mean both **procedural-programming** (organizing code into reusable functions) and **pure functional-programming** (pure functions and immutable data with side-effects kept isolated, e.g. Haskell).
- Technically, TypeScript is a **multi-paradigm** language: it supports procedural, object-oriented, and functional styles. In practice though, most TypeScript is written procedurally (and is not purely functional), so this tutorial refers to TypeScript as a procedural programming language which supports OOP.
- Projects don't have to strictly adhere to one paradigm or the other; use procedural where procedural makes the most sense and likewise for OOP.
- OOP can be achieved through either **classes** or FFs, although I prefer the former.

---

<a id="documenting-code"></a>
### Documenting code

> Documenting the model-layer well saves us a lot of time from constantly having to look in our database-manager for relationship-info.

#### Terminology
- **model-layer:** is an architecture-layer for describing/handling the shape of database-tables.
- **comment-tags:** keyword in a comment that starts with `@`.
- **entity-type:** a type used to describe the shape of a raw database-table.
  - People also use the term **record** when referring to database-rows, but for TypeScript I advise against this to avoid confusion with the type **Record<>**
- **auxiliary-table:** a database-table which supports another: (e.g. user_avatars holds image metadata for users)
  - **join-table:** an auxiliary-table which supports multiple tables together. Use plural for both tables in the name: e.g. `projects_users`
- **derived-type:** is a type which builds off of an entity-type.
- An **audit-column** is a database-column which holds metadata about an entity's lifecycle: e.g. `createdAt`, `createdBy`.

#### Documenting with comment @tags

Because TypeScript lets us type the return value and parameters, traditional `JSDoc` comments like `@returns`/`@param` are excessive; however, there are still some comment-tags which can be pretty useful. 

##### Misc
- `@private`: functions never used outside of their file.
  - You can also link to the function using it: `@private {@link nameOfTheFunctionUsingIt}`.  
- `@testOnly`: for testing only and never in production (any item not just functions).
- `@cronJob`: functions only for cron-jobs and not user-initiated.
- `@dummyData`: functions only used by dummy-data files.
- `@startupTime`: functions run at startup-time not request-time. Not really necessary for libraries or automation files, but useful for user-heavy applications like web-servers.

##### Working with relational-databases

> `@tags` are extremely helpful for code that works with a database so we don't constantly have to look in our DBMS for relationship info.

- `@entity table_name`, above an entity-type declaration:
```ts
/**
 * @entity users
 */
interface User { name: string; }
```

- `@entity table_name` + `@auxiliaryOf table_it_complements`, auxiliary-tables:
```ts
/**
 * @entity user_avatars
 * @auxiliaryOf users
 */
```

- `@entity table_name` + `@joins table_key`, join-tables:
```ts
/**
 * @entity charts_users
 * @joins users
 * @joins charts
 */
```

- For `@entity`, define the columns in this order and use the following tags:
  - `// @PK`: primary-key
  - ...everything in between... (e.g. `name`)
  - `// @FK + "relationship cardinality" (e.g. 1-1 or 1-many)`: foreign-key
  - `// @AC`: auditing columns which are not also foreign-keys (e.g. `createdAt`, `updatedAt`)
  - `// @TE`: transient entries appended to an object outside the database level
    - Generally, try to use derived-types in place of entities with transient-keys.

#### User model snippet
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
  userId: number; // @FK 1-1
}

// This is set up in the services layer
interface UserAvatarDTO extends UserAvatar {
  data: Blob; // Place this here instead of UserAvatar
}

/**
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

If you're building a back-end webserver, I highly suggest you document your route functions with the HTTP "verb+path" as well. Long term, it will help you look up route functions faster.

```ts
/**
 * @route GET /api/posts/:userId
 */
async function fetchPostsByUserId(req: Request, res: Response): Promise<void> {
  const posts = await PostRepo.findByUserId(Number(req.params.userId));
  res.json(posts);
}

// ...Somewhere else in your package
app.get('/api/posts/:userId', fetchPostsByUserId);
```

--- 

<a id="architecture"></a>
### Architecture

#### Terminology:
  - **domain:** high-level business feature for grouping smaller features:
    - For example: if _Signup_ and _Login_ are features for a website, _Auth_ could be a domain.
  - **layer:** is a specific level of an application that data moves through.

#### Layers overview:
  - **repository (suffix `Repo`):** data-access layer which talks to the persistence-layer (called by the service-layer)
    - If you have multiple persistence-layers (e.g. a database and a *file storage third party tool*), I like to use plain `repo` when referring to the database and then `"persistence layer" + Repo` for something else: e.g. "UserRepo.ts" (talks to the database) and "UserAssetRepo.ts" (fetches user file data from S3).
  - **service:** business logic (server-side) or API calls (client-side)
    - Server-side, the service-layer can reach the persistence layers **BUT SHOULD NEVER CALL THEM DIRECTLY**. It should do this indirectly through the repo/infrastructure layers.
  - **operations (suffix `Ops`):** business-logic (client-side only)
  - **cronjobs:** logic which runs at intervals (server-side only)
  - **controller:** handle incoming requests from the client (server-side)
  - **middleware:** logic typically passed to the framework to format/validate incoming requests

#### Not established conventions but what I like to do:
  - Only the services layer (files appended with `Service`) can call the repo/infrastructure layers (and through them, the persistence layers) and contain business logic.
  - **auxiliary-services** (`...Service.aux.ts`): Auxiliary services can contain business logic and call other repo/infrastructure layers but **CANNOT** be called by the controller-layers. Only the primary service layer file for a domain can be called by the controller: e.g. `UserService.ts` (called by the controller), `UserAssetService.aux.ts` fetching user avatars which requires calling the repo-layer and binary-storage handler. This helps to keep your architecture clean by creating a single entry point for controllers.
  - **static auxiliary-services** (`"Some Service".saux.ts`): These can contain business logic but are not allowed to talk to any persistence-layers. `.saux.ts` files are useful for large features where separating the static business logic out makes sense to keep other service files clean. Don't put your business logic in files marked `...Utils.ts` or under `utils/` folders. Try to keep utility files/functions for more generic non-application-specific logic. Also, for `saux` files you can leave off the `...Service` suffix if the file name can demonstrate clear intent without it. 


Use **layer-based** architecture for simple (single developer) applications:
  - Easier mental map
  - Folder names show clear intent
  - Doesn't scale well though

```markdown
- config/
- src/
  - assets/
  - cronjobs/
  - repos/
    - db/
      - db.ts <-- setup and return database handler
    - UserRepo.ts
    - PostRepo.ts
  - routes/ (aka controllers)
    - UserRoutes.ts
    - PostRoutes.ts
  - services/
    - UserServices/
      - UserService.ts
      - UserAssetService.aux.ts <-- Created later: for uploading avatar to remote storage (e.g. S3).
    - PostService.ts
  - main.ts
  - server.ts
- tests/
  - users.test.ts
  - posts.test.ts
- package.json
- tsconfig.json
```

You might be wondering why we gave the files names like `UserRepo.ts` instead of `user.repo.ts`. That's because these are **module-object files** not **inventory-files**: see the [Naming Conventions](#naming-conventions) section.

Use **domain-based** architecture for large applications:
- Scales better
- Less risk of circular dependencies
- Avoids bloated services layer
- Avoids merge-conflicts
- Intent less clear so harder to demo for smaller projects/tutorials

```markdown
- config/
- src/
  - _assets/
  - _common/
  - cronjobs/
  - domain/
    - users/
      - _local/
        - constants/
          - errors.ts
        - types/
          - schemas.ts
      - UserRepo.ts
      - UserService.ts
      - UserAssetService.aux.ts
      - UserController.ts
    - posts/
      - _internal/
        - PostToPDF.saux.ts <-- If a user wants to download a post as a PDF file
      - PostRepo.ts
      - PostService.ts
      - PostController.ts
  - infra/ <-- Talking directly to the persistence layer (server or client-side). 
    - db.ts
    - session.ts
  - routers/
    - middleware/
    - user.router.ts
    - post.router.ts
    - api.ts
  - main.ts
  - server.ts
- tests/
  - users.test.ts
  - posts.test.ts
- package.json
- tsconfig.json
```

##### Key points
- Now you can see why layer-based architecture does not scale well. In the above layer-based example, you can see that when we needed to add another module for `UserService`, we had to add a folder to the services-layer, move UserService.ts inside of it, and now for the root of the `services/` folder, we have a mixture of files and folders to list the different service-layer domains.
- For domain-based architecture, keep only layer-files (e.g. `UserRepo.ts`) directly in the domain's root folder. Make use of the `_local/`, `_internal/`, and `_external/` folders discussed earlier under [Organizing shared code](#organizing-shared-code) for helper files (e.g. `constants.ts`). That said, layer files can go in `_internal/` or `_external/` where it makes sense (e.g. `PostToPDF.saux.ts`).
 
> These examples demonstrate architecture using a typical back-end web server. For a client-side example of domain-based architecture, see: [React-Ts-Best-Practices](https://github.com/seanpmaxwell/React-Ts-Best-Practices).
