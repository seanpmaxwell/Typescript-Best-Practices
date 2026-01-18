# 🚀 TypeScript Best Practices

[![GitHub stars](https://img.shields.io/github/stars/seanpmaxwell/Typescript-Best-Practices?style=flat-square)](https://github.com/seanpmaxwell/Typescript-Best-Practices/stargazers)

Patterns and best practices for **procedural TypeScript / JavaScript development**, guided by the **Rule of 4** principle.

> This guide is intentionally opinionated. It prioritizes clarity, consistency, and long-term maintainability over abstraction or novelty.
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
- [Script Types](#script-types)
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

So things are more clear down the line let's first clarify some terminology.

### Projects/Packages
- **Package**: any JavaScript/TypeScript project with a `package.json` is a **package**.
- **Application**: packages mean to be executed.
- **Library**: shared packages to be used by applications or other libraries.

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
  5.  `local/` <-- leaf 

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
- **utilities:** either standalone functions or **namespace-object scripts** (see [Script Types)[#script-types] section below) for grouping related functions.

### Types
- **type-aliases**: any type declared with `type TypeName = ...`.
- **interfaces**: types declared with `interface SomeInterfaceName { ... }`.
- **utility-types:** type-aliases with generics used for resolving other types.
- **structured-types:** type-aliases or interfaces used to describe the entries of an object.

<br/><b>***</b><br/>

<a id="core-language-features"></a>
## 💡 Core Language Features

This guide revolves around four fundamental language features:

- **Primitives**
- **Functions**
- **Objects**
- **Types**

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
- **configured-functions** should go above **function-declarations** in the functions section: see [File Organization](#file-organization).

```ts
const 

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

- **Use a class** when you have an object with an internal state and methods which modify that internal state.
- **Don't use a class** soley as a namespace or when you're **assembling and returning an object whose behavior is fully determined at instantiation** with no meaningful **lifecycle** or need for `this`. A **factory-function** would be more appropriate here.
- **Note:** I would also recommend avoiding classes for **handling IO-data** (even when you feel tempted to use OOP), because this often leads to:
  - Many unnecessary **constructor calls** to support dynamic behavior, or a large number of identical `public static` functions
  - IO-data should just be 'acted upon' not do things.
  - Use **namespace-object scripts** for handling IO-data and describe the data-items with **interfaces**.

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

<a id="script-types"></a>
## 📄 Script Types

Every file should have a clear purpose. Most scripts fall into one of the following categories:

- **Declaration**  
  Exports a single declared item (e.g., a large function, enum, or configuration object).

- **Namespace-Object**  
  Exports a default object-literal that groups closely related logic/readonly-values.

> Note: the term **module** can be used interchangeably with a namespace-object script's default export, because in JavaScript a module also refers to a file. So if we have a namespace-object script called `User.ts` we could say (in referring to the default export) "that's the User module" OR "that's the User namespace-object". 

- **Inventory**  
  Exports multiple independent declarations, such as shared types or small utility functions.

- **Linear**  
  Executes a series of commands, often for **startup-time** logic.

You can see a full list of script examples [here](Script-Examples.md).

#### Namespace-object scripts are great for organization
I believe that for the backbone of all application logic, which is static after startup-time (both server and client-side, with the exception of JSX elements), namespace-object scripts are preferred.

Reasons:
- That way we only need one import at the top
- Less likely to accidentally export helper functions.
- Less likely to have naming conflicts for exported functions.
- Classes should not be used as namespaces: see the [Classes](#classes) section.

<br/><b>***</b><br/>

<a id="file-organization"></a>
## 🗂️ File (script) Organization

#### Project heirarchy summery: 
  1. `Folders` (aka directories)
  2. `Files` (aka modules)
  3. `Regions`
  4. `Sections`
  5. `Blocks` (uncommon except in maybe linear scripts)

#### Top-down ordering
Due to how hoisting works, regions in a file should be in this order top-to-bottom:
  1. `Docs`
  2. `Constants`  
  3. `Types`  
  4. `Run (or Setup)`: (if it runs at start-up time I like to say "Setup" but if it's at request-time I'll say "Run") 
  5. `Components`: (if applicable `.jsx` / `.tsx`)  
  6. `Functions`
  7. `Classes`: Classes generally should go in their own file but small locally used ones are okay. 
  8. `Export`: imports should generally go at the bottom unless it's an inventory-script

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

more stuff...
```

> If you find your region/section separators getting off center over time there is the [center-comment-headers script](center-comment-headers.js) which can adjust them for you.

#### Linear Script Exception
- For large linear scripts, you don't necessarily have to place all constants in their own region and the top, but you should group large linear scripts into **sections** and place constants at the top of their respective section/block.

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

<a id="naming-conventions"></a>
## 🏷️ Naming Conventions

- **Folders**: `kebab-case` (default) or name them after the primary declared item they are meant to export.
- **Files**:
  - **Linear scripts**: `kebab-case`
    - Can also use kebab-case in conjunction with `.` to differentiate sibling scripts with similar purposes: i.e `user.router.ts` and `post.router.ts`.
  - **Declaration scripts**: Name them after the item being exported.
  - **Namespace-object scripts:** Name them after the object that's used in the code. Usually this is PascalCase but not always. See object naming below.
  - **Inventory:** `kebab-case`
  - **index.ts** and **main.ts** 
    - Reserve the filename `index.ts` for **barrel-files**. Barrel-files are for creating a single entry point for a folder.
    - Use the filename `main.ts` for a file meant to be the starting point of an application (in contrast to a library).
    - Think of `index.ts` as the entry point for libraries and `main.ts` the starting point for applications. 
- **Readonly**:
  - **Primitives/Arrays**: `UPPER_SNAKE_CASE`
  - **Objects**:
    - For object-literals used as a namespace for a collection of readonly values `PascalCase` for the object name and any nested objects and `UPPER_SNAKE_CASE` for the keys.
    - If an object is readonly but the entire object is being passed as as value (it's not simply a namespace) and you need specific key names, UPPER_SNAKE_CASE is preferred for the object name.
    - For the objects of namespace-object scripts:
      - If its functions are mostly static-logic (no initialization at startup-time), prefer `PascalCase`: i.e `import DateUtils from 'DateUtils.ts;`.
      - If its functions require initialization, prefer `camelCase`: i.e `import db from '@src/infra/db.ts;`.
- **All variables declared inside of functions except for type declarations**: `camelCase`
- **Functions**:
  - `camelCase`: most of the time
  - `PascalCase`: for certain situations
    - JSX Elements
    - Functions just meant to return mostly static data with simple formatting (i.e. return an error message and interpolate a value) can be `PascalCase`.
  - Prepend functions returning non IO-data with a `get` and IO-data with a `fetch` (i.e. `getTimeAsUTC()`,`async fetchUserRecords()`).
  - Prepend **validator-functions** with an `is`: `isValidUser(arg: unknown): arg is IUser`.
- **Classes / Types**: `PascalCase`
  - Aside from using PascalCase, there are some other common patterns used; however, these are not established conventions:
    - Prepend interfaces with an `I`. I like to do this because I mostly used interfaces for structured-types and it helps to avoid naming collisions with classes/namespace-objects.
    - Prepend type-aliases with a `T. I don't usually do this unless I specific value I'm trying to distinguish the type from. 
- **Booleans**: prefix with `is`

**Abbreviations** and **Acronyms**:
- This is not an exact science and abbreviations/acronyms should generally be avoided for clarity BUT there are plenty of exceptions:
  - Well-establish abbreviations (i.e. URL, API) and acronyms (i.e. Pwd, Req => Request) are usually okay.
  - Use **ALL CAPS** for well-established acronyms: i.e `insertIntoURL()`.
  - Avoid both when when doing `UPPER_SNAKE_CASE` unless it's a well-establish acronym.
  - For a long variable-names that could be cumbersome to use (are used widely throughout your application) an abbreviation/acronym is probably okay; however, the core layer describing them (i.e. the database table and its interface) should refrain from doing so unless it's a well-establish acronym.
  - For very narrowly-scoped items, abbreviate/use-acronyms are usually okay.

> The namespace-object script [User.ts](User.ts) has some good examples on standard naming conventions.

<br/><b>***</b><br/>

<a id="comments"></a>
## 💬 Comments

- Place `/** */` above all **function-declarations** always, `//` or no comment is okay for **configured-functions**.
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
- For those your using prettier this can be configured automatically.

<br/><b>***</b><br/>

<a id="organizing-shared-code"></a>
## 🤝 Organizing shared code

Here the terms **branch-directory** and **focused-directory** are important: see the [Terminology](#terminology) section above. Note: even though we used a React schema for our examples, the following section could be applied to any TypeScript project, client or server.

### Shared categories
- Let's consider **utils**, **types**, and **constants** the 3 main **shared-categories**. And a 4th category **ui** for those working with JSX elements.
  - **utils** runtime logic. If some runtime logic is tightly coupled with a type which also needs to be exported, the type can go in the corresponding util folder too.
  - **constants**: organzing readonly values but can also include functions which return mostly readonly values after some simple formatting (function which returns an error message string with the username inserted into it).
  - **types**: standalone compile-time items (type-aliases and interfaces, never runtime items) that don't need to be coupled with runtime logic in the shared area.
  - **ui:** Any file ending with a `.jsx/.tsx` extension.

### Branch-directories and the `common` folder
- In a **branch-directory** with shared content create a subfolder named `common/`.
- Avoid using **dumping-ground** names for folders like `misc/`, `helpers/`, `utils/`, `shared/` etc. as their purpose is ambiguous and can quickly degrade your package's organization.
- Within `common/` it's okay to group files into category-named folders like `constants/`, `types/`, `utils/` etc but for files **DO NOT** use dumping-ground names. In branch-directories (including `common/`) **filenames should always demonstrate clear intent**: (i.e. `src/common/types/utility-types.ts`).
- You can have multiple levels of `common/` for nested branch-directories:
```markdown
- public/
- src/
  - assets/
  - common/
    - types/
      - utility-types.ts
  - components
    - common/ <-- shared folder just for components
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

### Focused-directories and the `local` folder
- Use the folder name **local/** for shared content in a focused-directory.
- Because a file's purpose in a focused-directory has many layers of narrowing, dumping-ground names like `utils.ts`, `ui.tsx`, etc are actually okay in the `local/` folder. However, **DO NOT** place them directly in the focused-directory itself.
- If there's a focused-directory code which needs to be shared both locally and externally, you can place those items in `local/` as well; `local/` is not meant to be super strict.
- If a focused-directory has some shared code not used internally, **but it still makes sense to place that code in that particular focused-directory because it's very unique to that directory's purpose,** place those items in the **external/** folder.
- If you want to be extra careful about some focused-directory items never being used externally, create a folder named **internal/**, and configure eslint to never allow imports from folders named `internal/`, except for files of the same focused-directory.
```markdown
- common/
  - ui/
    - DataTable/
      - external/
        - dataTableFilterToUrlString.ts <-- an external helper function.
      - Datatable.tsx
- Login/
  - dialogs/
    - local/
      - utils.ts <-- stores functions needed by both dialog components
    - ForgotPasswordDialog.tsx
    - SignupInsteadDialog.tsx
  - local/
    - ui.tsx <-- stores JSX elements needed by both the `Login` component and the `ForgotPasswordDialog` component.
    - constants.ts
  - Login.tsx
  - Login.test.tsx
```

Keep in mind, folders under `common/` and files/folders under `local/` are not confined to common-category names. You can create your own categories too for something used heavily throughout your codebase. Common-categories are more for storing items which don't fit into a specific place. Some other categories I commonly created are:
  - DTOs (Data-Transfer-Objects) - for moving IO data.
  - Entities - types which describe data-base tables. Note don't confuse entities with the **Model** layer which is a full layer of the application for handling specific entities.

<br/><b>***</b><br/>

<a id="philosophy"></a>
## 🧠 Philosopy

<a id="testing"></a>
### Testing
- Unit-test all user-driven behavior.
- Developers should write their own tests.
- Integration tests should be focused and minimal early on.
- Tests improve readability as well as correctness.

--- 

<a id="programming-paradigms"></a>
### Programming Paradigms
- To be clear, **OOP (Object-Oriented-Programming)** is a set of design principles not a specific language feature.
  - The four design principles are: **Inheritence**, **Polymorphism**, **Abstraction**, and **Encapsulation**
- The term **functional programming** has been used interchangeably between **procedural-programming** and **strict functional-programming** (stateless, i.e. Haskell).
- TypeScript supports OOP and is clearly not strictly stateless, so to avoid confusion, let's refer to TypeScript as a procedural programming language which supports OOP.
- Projects don't have to strictly adhere to one paradigm or the other, use procedural where procedural makes the most sense and likewise for OOP.
- OOP can be achieved either through **classes** or **factory-functions** although I prefer the former.
- You can see a more thorough list of design rules [here](Design-Rules.md) to help you decide what feature/paradigm to use and when.

---

<a id="documenting-code"></a>
### Documenting code

> Documenting the model-layer well saves us a lot of time from constantly have to look in our database-manager for relationship-info.

#### Terminology
- **model-layer:** is an architecture-layer for describing/handling the shape of database-tables.
- **comment-tags:** keyword in a comment that starts with `@`.
- **entity-type:** an interface or structured-type-alias used to describe the shape of a raw database-table.
  - People also use the term **record** when referring to database-rows, but for TypeScript I advise against this to avoid confusion with the type **Record<>**
- **auxiliary-table:** a database-table which supports another: (i.e user_avatars holds image data for users)
  - **join-table:** an auxiliary-entity which supports multiple tables together. User plural for both tables in the name: i.e. `projects_users`
- **derived-type:** is a type which builds off of an entity-type.
- **data-transfer-object (DTO):** is an object created for moving IO-data.
  - A good convention is to append their types with `DTO` at the end: ie `IUserDTO`.
- An **audit-key** is a database-key which holds meta-data about an entity's lifecycle: i.e. `createdAt`, `createdBy`.

#### Documenting with comment @tags

##### Misc
- Function-declarations not exported tag with `@private`
- Tag code only to be used for testing with `@testOnly`.

##### Working with relational-databases

> `@tags` are extremely helpful for code that works with database, so we don't constantly have to look in our DBMS for relationship info

- `@entity table_name`, above an entity-type declaration:
```ts
/**
 * @entity users
 */
interface IUser { name: string; };
```

- `@entity table_name` + `@auxiliaryOf table_it_compliments`, auxiliary-tables:
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
  - ...everything in between... (i.e. `name`)
  - `// @FK + "join type" (i.e. 1-1 or 1-many)`: foreign-key
  - `// @AK`: for audits which are not also foreign-keys (i.e. `createdAt`, `updatedAt`)
  - `// @TK`: transient-key, keys appended to an object outside the database level
    - Generally, try to use derived-types in palace of entites with transient-keys.

#### User model snippet
```ts
interface IModel {
  id: number; // @PK
  createdAt: Date | string; // @AK
  updatedAt: Date | string; // @AK
}

/**
 * @entity users
 */
interface IUser extends IModel {
  name: string;
}

/**
 * @entity user_avatars
 * @auxiliaryOf users
 */
interface IUserAvatar extends IModel {
  fileName: string | null;
  userId: number; // @FK 1-1
}

// This is setup in the services layer
interface IUserAvatarDTO extends IUserAvatar {
  data: Blob; // Place this here instead of IUser
}

/**
 * @testOnly
 */
function getDummyUser() {
  return {
    id: randomInt(10),
    name: 'John',
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}
```

If you're building a back-end webserver, I highly suggest you document your route functions with the Http "verb+path" as well. Long term, it will help you look up route functions faster.

```ts
/**
 * @route GET /api/posts/:userId
 */
function fetchPostsByUserId(userId: number): IPost[] {
  return postRepo(userId);
}

// ...Somewhere else in your package
express.get('/api/posts/:userId', fetchPostsByUserId);
```

--- 

<a id="architecture"></a>
### Architecture

Terminology:
  - **domain:** high-level business feature for grouping smaller features:
    - For example: if _Signup_ and _Login_ are features for a website, _Auth_ could be a domain.
  - **layer:** is a specific level of an application that data moves through.
    - Layers are typically grouped as: 
      - **repository:** talks to the persistence layer (server-side)
      - **service:** business logic (server-side) or API calls (client-side)
      - **controller:** handle incoming requests from the client (server-side)
      - **middleware:** logic typically passed to the framework to format/validate incoming requests
      - Note: layers are not an exact science and you'll find many applications which take various approaches to the above.

Use **layer-based** based architecture for simple (single developer) applications
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
- package.json
- tsconfig.json
```

Use **domain-based** architecture for large applications:
- Scales better
- Less risk of circular dependencies
- Avoids bloated services layer
- Avoids merge-conflicts
- Intent less clear so harder to demo for smaller projects tutorials

```markdown
- config/
- src/
  - common/
  - domain/
    - users/
      - UserBlobUtils.ts <-- Created later: for uploading avatar to blob storage. 
      - UserRepo.ts
      - UserServices.ts
      - UserController.ts
    - posts/
      - PostRepo.ts
      - PostServices.ts
      - PostController.ts
  - infra/ <-- Talking to the persistence layer. 
    - db.ts
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

##### Keys points
- In the above layer-based example, you can see that when we needed to add another module for `UserServices`, we had to add a folder to the services-layer, move UserServices.ts inside of it, and now for the root of the `services/` folder, we have a mixture of files and folders to list the different service-layer domains.
- You might be wondering why we gave the certain files names like `UserRepo.ts` instead of `user.repo.ts`. That's because these are **namespace-object scripts** not **inventory-scripts**: see the [Naming Conventions](#naming-conventions) section. The files ending in `*.router.ts`, are linear-scripts for adding controller functions to an express `Router()` instance and then returning that instance to the root express-instance.
- The examples demonstrated architecture using a typical back-end web server. For a client-side example of domain-based architecture, see: [React-Ts-Best-Practices](https://github.com/seanpmaxwell/React-Ts-Best-Practices).
