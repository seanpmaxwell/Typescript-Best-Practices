# 🚀 TypeScript Best Practices

[![GitHub stars](https://img.shields.io/github/stars/seanpmaxwell/Typescript-Best-Practices?style=flat-square)](https://github.com/seanpmaxwell/Typescript-Best-Practices/stargazers)

Patterns and best practices for **procedural TypeScript / JavaScript development**, guided by the **Rule of 4** principle.

> This guide is intentionally opinionated. It prioritizes clarity, consistency, and long-term maintainability over abstraction or novelty.
<br/>

## 📚 Table of Contents

- [Philosophy](#philosophy)
- [Terminology](#terminology)
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
  - [Types](#types-link)
- [Naming Conventions](#naming-conventions)
- [Comments](#comments)
- [Imports](#imports)
- [Testing](#testing)
- [Organizing Shared Code](#organizing-shared-code)
- [Food for Thought](#food-for-thought)

<br/><b>***</b><br/>

<a id="philosophy"></a>
## 🧭 Philosophy 

This guide favors:

- Explicitness over cleverness  
- Simplicity over abstraction  
- Consistency over novelty  

It is designed to scale with real-world TypeScript applications.

<br/><b>***</b><br/>

<a id="terminology"></a>
## 🔠 Terminology

So things are more clear down the line let's first clarify some terminology.

### Projects/Packages
- **Package**: any JavaScript/TypeScript project with a `package.json` is a **package**.
- **Applications**: packages mean to be executed (the final thing called with `node main."js/ts"`).
- **Library**: shared packages to be used by applications or other libraries. 

### Lifecycles
- **Compile-time:** Even though TypeScript is technically a _transpiled_ (not compiled) language we still use the term **compile-time** to refer to period before a program starts.
- **Runtime:** Everything that happens after compilation is runtime. Runtime can be futher divided into:
  - **Startup-time:** When the application boots up.
  - **Request-time:** Code runs in response to input (i.e. a user triggers and API call).

### Objects
- **States**: Objects can be **static**, **readonly**, or **dynamic**.
  - **static:** values can change but not keys (default for TypeScript).
  - **dynamic:** keys and values can change (default for JavaScript).
  - **readonly:** neither keys or values can change (typically done with `as const`).
- **namespace-objects:** readonly object-literals used for organizing related code.
- **lookup-table:** object-literal for storing related values and their labels (never functions).
 
### Functions
- **embedded-functions:** functions declared in object literals and the functionName is the object key.
- **validator-functions:** accepts and unknown variable and returns a type-predicate
- **function-declarations:** functions declared with `function functionName`.
- **configured-functions:** functions returned from some other function call: `const parseUser = parseObject(UserSchema)`.
- **utilities:** either standalone functions or **namespace-object-scripts** (see [Script Types)[#script-types] section below) for grouping related functions.

### Types
- **type-aliases**: any time declared with `type TypeName = ...`.
- **utility-types:** type-aliases with generics used for resolving other types.

### Files/Folders
- **nested-directory**: a directory other than the root.
- **branch-directory**: a nested-directory with a broad focus and which has lots of its own child-directories.
- **leaf-directory**: a nested-directory with no nested-directories
- **focused-directory**: a nested-directory with a very narrow scope and purpose and is usually a leaf-directory although not necessarily.

<br/><b>***</b><br/>

<a id="fundamental-concepts"></a>
## 💡 Fundamental Concepts

This guide revolves around four fundamental language features:

- **Primitives**
- **Functions**
- **Objects**
- **Types**

These concepts form the foundation of all JavaScript and TypeScript programs. Mastering them—and using them consistently—results in code that is easier to read, reason about, and maintain.

<br/><b>***</b><br/>

<a id="script-types"></a>
## 📄 Script Types

Every file should have a clear purpose. Most scripts fall into one of the following categories:

- **Declaration**  
  Exports a single declared item (e.g., a large function, enum, or configuration object).

- **Namespace-Object**  
  Exports a default object-literal that groups closely related logic/readonly-values.

> Note: the term **module** can be used interchangeably with a namespace-object-script's default export, because in JavaScript a module also refers to a file. So if we have a namespace-object-script called `User.ts` we could say (in referring to the default export) "that's the 'User module'" OR "that's the 'User namespace-object'". 

- **Inventory**  
  Exports multiple independent declarations, such as shared types or small utility functions.

- **Linear**  
  Executes a series of commands, often for **startup-time** logic.

You can see a full list of script examples [here](Script-Examples.md).

#### Namespace-object-scripts are great for organization
I believe that for organzing the backbone of logic (both server and client-side, with the exception of JSX elements of course), namespace-object scripts are a much better than classes or inventory-scripts.

Reasons:
- That way we only need one import at the top
- It's easier differentiate between public and helper functions
- We don't end up with name conflicts for two modules which have the same name for a function that is exported.
- Classes should not be used as namespaces: see the [Classes](#classes) section.

<br/><b>***</b><br/>

<a id="file-organization"></a>
## 🗂️ Script Organization

#### Project heirarchy summery: 
  1. `Folders` (aka directories)
  2. `Files` (aka modules)
  3. `Regions`
  4. `Sections`
  5. `Blocks` (uncommon except in maybe linear scripts)

#### Top-down ordering
Due to how hoisting works, regions in a file should be in this order top-to-bottom:
  1. `Constants`  
  2. `Types`  
  3. `Run (or Setup)` (if it runs at start-up time I like to say "Setup" but if it's at request-time I'll say "Run") 
  4. `Components` (if applicable `.jsx` / `.tsx`)  
  5. `Functions`
  6. `Classes`
  7. `Export` 

- Place `export default` at the **very bottom** of the file to make the public API immediately obvious.
- Classes generally should go in their own file but small locally used ones are okay. 

Separate regions with:

```ts
/******************************************************************************
                        "Region Name" (i.e. Constants)
******************************************************************************/
```

**Regions** can be divided further into **sections**:

```ts
// ---------------------- Accessor Functions --------------------------- //
// Note: if you to add some comments for a Section or Region separator
// place them here, directly below the separator.

function getUserName(userId: number) { isValidUser(id) ...do stuff }
function getUserEmail(userId: number) { isValidUser(id) ...do stuff }

// ----------------------- Helper Functions --------------------------- //

function isValidUser(id: number) { ...do stuff }
```

**Sections** can be divided into **blocks**:

```ts
// apiRouter.ts <-- Linear script

// ----------------------- Add User Routes  --------------------------- //
const loginRouter = Router.new();

// -- Local Login -- //
// Login with username and password

const localRouter = Router.new();
localRouter.use('/local', addUser);
localRouter.use('/reset-passowrd-request', sendLink);

loginRouter.use('/login', localRouter);

// -- Google Login -- //
// Login with Google credentials

do stuff...
```

> If you find your region/section separators getting off center over time there is the [center-comment-headers script](center-comment-headers.js) which can adjust them for you.

#### Linear Script Exception
- For large linear scripts you don't necessarily have to place all constants in their own region and the top, but you should group large linear scripts into **sections** and place constants at the top of their respective **section**.

#### Comments in functions:
- Generally you should not put spaces in functions and separate chunks of logic with a single inline comment.
- If you have a really large function that can't can't be broken up (i.e. React Component) the you can further separate functions with a space and `// ** "Info" ** //`

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

// Lage self executing startup script that needs to be wrapped
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

<br/><b>***</b><br/>

<a id="core-language-features"></a>
## 🛠️ Core Language Features

<a id="primitives"></a>
### Primitives 

JavaScript primitives include:

`null`, `undefined`, `boolean`, `number`, `string`, `symbol`, and `bigint`.

Understand **type-coercion**: when calling methods on primitives, JavaScript temporarily wraps them in their object counterparts (`String`, `Number`, `Boolean`).

`symbol` is particularly useful for defining unique object keys in shared or library code.

---

<a id="functions"></a>
### Functions

- Prefer **function-declarations** at the file level to take advantage of hoisting.
- Use **arrow-functions** for callbacks and inline logic.
- **configured-functions** should go above **function-declarations** in the functions section.

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

- Object literals
- Classes
- Enums 
> Avoid legacy constructor functions (`new Fn()`) in favor of modern class syntax.

<a id="object-literals"></a>
#### `Object Literals`

Readonly object-literals are ideal as namespaces and are often preferable to classes.

```ts
export default {
  someFunction,
  someOtherFunction,
} as const;
```

<a id="classes"></a>
#### `Classes`

OOP can be achieved in TypeScript/JavaScript with classes or factory-functions.

People coming from strict OOP environments (like Java) tend to overuse classes, but they do make sense in some situtations. Here are some basic guidelines:

- **Use a class** when you have an object with an internal state with functions which modify that internal state.
- **Don't use a class** soley as a namespace or when you're **assembling and returning an object whose behavior is fully determined at instantiation** with no meaningful **lifecycle** or need for `this`. A **factory-function** would be more appropriate here.
- **Note:** I would also recommend avoiding classes for **handling IO-data** (even when you feel tempted to use OOP), because this often leads to:
  - Many unnecessary **constructor calls** to support dynamic behavior, or a large number of identical `public static` functions
  - IO-data should just be 'acted upon' not do things.
  - Use **namespace-object-scripts** for handling IO-data and describe the data-items with **interfaces**.

> You can see a more thorough list of design rules [here](Design-Rules.md). 

<a id="enums"></a>
#### `Enums`

Enums emit runtime JavaScript and are discouraged in modern TypeScript configurations because they generate additional code. Prefer **lookup-tables** with **declaration-merging** intead:

```ts
const UserRoles = {
  BASIC: 0,
  ADMIN: 1,
  OWNER: 2,
} as const;

type UserRoles = typeof UserRoles[typeof UserRoles]; // 0 | 1 | 2

const basic: UserRoles = UserRoles.BASIC;
```

---

<a id="types-link"></a>
### Types

- Prefer `interface` for object shapes.
- Use `type` for unions, primitives, and utility-types.
- Place type aliases above interfaces.

```ts
type Roles = "basic" | "admin";

interface IUser {
  id: number;
  name: string;
  role: Roles;
}
```

<br/><b>***</b><br/>

<a id="naming-conventions"></a>
## 🏷️ Naming Conventions

- **Folders**: `kebab-case`
- **Files**:
  - **Linear scripts**: `kebab-case`
  - **Namespace-object scripts / Declaration scripts**: name it after the item being exported
  - **Inventory**
    - Default to `kebab-case` but the name can be more nuanced depending on context.
    - For inventory-scripts in **branch-directories** (see (Terminology)[#terminology] above) kebab-case usually makes sense.
    - For **focused-directories** see the (Organizing Shared Code)[#organizing-shared-code] section below.
  - **index.ts** and **main.ts** 
    - Reserve the filename `index.ts` for **barrel-files**. Barrel-files are for creating a single entry point for a folder.
    - Use the filename `main.ts` for a file meant to be the starting point of an application (in contrast to a library).
    - Think of `index.ts` as usually the entry point for libraries and `main.ts` the starting point for applications. 
- **Readonly**:
  - **Primitives/Arrays**: `UPPER_SNAKE_CASE`
  - **Objects**:
    - For object-literals used as a namespace for a collection of readonly values `PascalCase` for the object name and any nested objects and `UPPER_SNAKE_CASE` for the keys.
    - If the entire object is a value being passed (it's not simply a namespace) and you can't choose the keys, UPPER_SNAKE_CASE is okay for the name. 
- **Variables**: `camelCase`
- **Functions**:
  - `camelCase`: most of the time
  - `PascalCase`: for certain situations
    - JSX Elements
    - Functions just meant to return static data or make simple insertions to static data (i.e. put a value in a string) can be `PascalCase`.
  - Prepend functions returning non IO-data with a `get` and IO-data with a `fetch` (i.e. `fetchUsers()`).
  - Prepend **validator-functions** with an `is`.
- **Classes / Types**: `PascalCase`
  - You can prepend an interface with an `I` for scenarios where you might have a type/value naming conflict: ie. `class Dog implements IDog`.
- **Booleans**: prefix with `is`

**Abbreviations** and **Acronyms**:
- This is not an exact science and abbreviations/acronyms should generally be avoided for clarity BUT there are plenty of exceptions:
  - Well-establish abbreviations (i.e. URL, API) and acronyms (i.e. Pwd, Req => Request) are usually okay.
  - Use **ALL CAPS** for well-established acronyms: i.e `insertIntoURL()`.
  - Avoid both when when doing `UPPER_SNAKE_CASE` unless it's a well-establish acronym.
  - For a long variable-names that could be cumbersome to use (are used widely throughout your application) an abbreviation/acronym is probably okay; however, the core layer describing them (i.e. the database table and its interface) should refrain from doing so unless it's a well-establish acronym.
  - The more localized a name gets (i.e. used just used once in a small function) the more you can abbreviate/use-acronyms.

> The namespace-object-script [User.ts](User.ts) has some good examples on standard naming conventions.

<br/><b>***</b><br/>

<a id="comments"></a>
## 💬 Comments

- Place `/** */` above all **function-declarations** always, `//` or no comment is okay for **configured-functions**.
- Place a `@TestOnly` comment annotation for items not meant to be used in production. 
- Use `//` for inline explanations.
- Capitalize and punctuate comments.
- Separate logical regions clearly.

<br/><b>***</b><br/>

<a id="imports"></a>
## 📥 Imports

- Group imports by origin: libraries → application → local.
- Split long import lists across multiple lines.
- For those your using prettier this can be configured automatically.

<br/><b>***</b><br/>

<a id="testing"></a>
## 🧪 Testing

- Unit-test all user-driven behavior.
- Developers should write their own tests.
- Integration tests should be focused and minimal early on.
- Tests improve readability as well as correctness.

<br/><b>***</b><br/>

<a id="organizing-shared-code"></a>
## 🤝 Organizing shared code
- In a **branch-directory** with shared content create a subfolder named `common/`.
- Try to avoid using folders names like `misc/`, `helpers/`, `shared/` etc. as these can quickly become dumping grounds.
- If `common/` is in a folder with a bunch of other sibling folders and you want them flushed to the top of whatever IDE or file-explorer your using, you can prepend it with an `underscore` (i.e. `_common/`).
- Within `_common/` it's okay to group files into folder categories like `constants/`, `types/`, `utils/` but for files **DO NOT** use names which could be ambiguous. For files, names like `shared.ts`, `utils.ts`, etc are dumping-ground names: filenames should always demonstrate clear intent: (i.e. `_common/utility-types.ts`).
- Let's consider **utils**, **types**, and **constants** the 3 main **common-categories**:
  - **utils** either standalone functions in inventory-scripts or namespace-object-scripts for grouping related functions.
  - **constants**: organzing readonly values or but can also include simple functions with basic parsing (function which returns an error message string while inserting a username into it).
  - **types**: storing only compile-time items (type-aliases and interfaces, never runtime items).
  - **components:** 4 category **components** for those working with JSX elements.

### Organzing shared code in focused-directories
- Don't create folders named `common/` under focused-directories.
- There might be scenarios where you need an inventory-script in a focused-directory (i.e. `pages/Login/some-shared-home-components.ts` in a React app). 
- For inventory-scripts the default is to use `kebab-case` but for **focused-directory inventory-scripts** what demonstrats clear intent is to use the domain-name followed by what's being exported:
  - `Login/`
    - `dialogs/` 
      - `ForgotPasswordDialog.tsx`
      - `SignupInsteadDialog.tsx`
    - `Login.tsx`
    - `Login.test.tsx`
    - `Login.shared.tsx` <-- Stores JSX elements needed by both the `Login` component and the `ForgotPasswordDialog` component.
    - `Login.utils.ts`

> In the previous example, you might be wondering why we did `Login.shared.tsx` when I said not to used the name `shared`. Because this is a focused directory and we prepended the "domain name" `.shared` is okay. But here we are only doing this for JSX components because with the name `Login.components.tsx`, it could be unclear whether this contains all Login components (like the ones in `Login.tsx`) or just the shared ones.

<br/><b>***</b><br/>

<a id="food-for-thought"></a>
## 🍽️ Food for Thought

### Programming Paradigms
- To be clear, **OOP (Object-Oriented-Programming)** is a set of design principles not a specific language feature.
  - The four design principles are: **Inheritence**, **Polymorphism**, **Abstraction**, and **Encapsulation**
- The term **functional programming** has been used interchangeably between **procedural-programming** and **strict functional-programming** (stateless, i.e. Haskell).
- TypeScript supports OOP and is clearly not strictly stateless, so to avoid confusion, let's refer to TypeScript as a procedural programming language which supports OOP.
- Projects don't have to strictly adhere to one paradigm or the other, use procedural where procedural makes the most sense and likewise for OOP.
- OOP can be achieved either through **classes** or **factory-functions** although I prefer the former.
- You can see a more thorough list of design rules [here](Design-Rules.md) to help you decide what feature/paradigm to use and when.

---

### Working with databases
- A **comment-annotation** is keyword in a comment that starts with `@`.
- Use interfaces to describe the raw database records with `/** */` comments above them like how you do with function-declarations.
- Place a `@Table: table_name` comment above the interface declaration.
- Try to create new types for variations of the raw database-record created at the API level instead of appending properties the original (i.e. `IUserDTO`).
- Although for simple/auxilliary tables an optional property is okay.
- Make sure to document foreign/primary-keys with comments (i.e `@PK` and `@FK`).
- I like to use `// @NaC` which stands for `Not a Column` to indicate properties which do not correspond to a database-column.
```ts
/**
 * @Table: users
 */
interface IUser {
  id: number; // @PK
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

// This is setup in the service layer
interface IUserDTO extends IUser {
  associates: IUser[]; // Place this here instead of IUser
}

/**
 * @Table user_avatars
 * This is a simple auxilliary table so appending entries not
 * on the database table is okay.
 */
interface IUserAvatar {
  id: number; // @PK
  s3Path: string;
  userId: number; // @FK
  imageSource?: string; // @NaC
}

/**
 * @TestOnly
 */
function getDummyUser() {
  return {
  id: randomInt(10),
  name: 'John',
  createdAt: new Date(),
  updatedAt: new Date(), 
}
```

### Architecture

#### Server-Side

Use **layered-based** architecure for simple (single developer) applications:
  - Easier mental map
  - Folder names show clear intent
  - Doesn't scale well though

```markdown
- tests/
- src/
  - config/
  - repos/
    - UserRepos.ts
    - PostRepos.ts
  - routes/ (aka controllers)
    - UserRoutes.ts
    - PostRoutes.ts
  - services/
    - UserServices/
      - UserServices.ts
      - UserBlobUtils.ts <-- Created later: for uploading avatar to blob storage.
    - PostServices.ts
  - main.ts
  - server.ts
```

Use **feature-based** architecure for large applications:
  - Scales better
  - Less risk of circular dependencies
  - Avoid bloated services layer
  - Avoid merge-conflicts
  - Intent less clear for smaller projects and demos/tutorials

```markdown
- tests/
- src/
  - config/
  - users/
    - UsersRepo.ts
    - UserRoutes.ts
    - UserServices.ts
    - UserBlobUtils.ts <-- Created later: for uploading avatar to blob storage. 
  - posts/
    - PostRepo.ts
    - PostRoutes.ts
    - PostServices.ts
  - main.ts
  - server.ts
```

In the above **layer-based** example, you can see that when we needed to add another module for UserServices, we had to add a folder to the services layer, move UserServices.ts inside of it, and now for the root of the `services/` folder we have a mixture of files and folders.

You might be wondering why we gave the domain files names like `UserRepo.ts` instead of `User.repo.ts`. That's because these are **namespace-object-scripts** not **inventory-scripts**. 

#### Client-Side

This could vary widely depending on your framework but I'll go over what I like to use for React:

#### Smaller projects
For simple applications/static websites I used the directory structure as is by the generating framework

#### Large projects


