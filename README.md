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
- **plain-objects:** objects which inherit directly from the root `Object` class and nothing else. 
- **namespace-objects:** readonly object-literals used for organizing related code.
  - **value-object:** namespace-object for storing static values
    - **lookup-table:** value-object which stores the labels for values as well (never functions).
    - **configured-value-object:** a value-object returned from a function call: (i.e. most enum replacement libraries could fall into this category)
 
### Functions
- **function-declarations:** any function declared with `function functionName`.
- **arrow-functions:** any function declared with `() => { ... }`
- **embedded-functions:** functions declared in object-literals and the functionName is the object key.
```
const UserErrors = {
  getError(name: string): string {
    return `The user name is ${name}`;
  }
};
```
- **function-expressions:** any function assigned to a variable `const foo = ...some function`
- **factory-function:** a function whose primary purpose is to initialize some other function/object rather than perform actions.
  - **value-factory-functions:** a factory-function meant for returning mostly static-data (i.e. const GetDefaults => {...} using a function so we get a deep-clone everytime).
- **configured-functions:** function-expressions returned by a factory-function: `const parseUser = parseObject(UserSchema)`.
- **validator-functions:** accepts and unknown variable and returns a type-predicate

### Types
- **type-aliases**: any type declared with `type TypeName = ...`.
  - **structured-type:** type-aliases used describe the entries of an object.
- **interfaces**: types declared with `interface ISomeInterfaceName { ... }`.
- **utility-types:** type-aliases with generics used for resolving other types.

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

- Prefer **function-declarations** at the file level to take advantage of hoisting and better error handling: error stack-tracing will only print the function name for function-declarations.
- Use **arrow-functions** for callbacks and inline logic.

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

Object-literals are convenient templates for initialzing plain-objects. Readonly object-literals are ideal as namespaces and are often preferable to classes.

```ts
export default {
  someFunction,
  someOtherFunction,
} as const;
```

<a id="classes"></a>
#### `Classes`

OOP can be achieved in TypeScript/JavaScript with classes or factory-functions. Object-literals cannot follow OOP because they lack encapsulation. 

People coming from strict OOP environments (like Java) tend to overuse classes, but they do make sense in some situtations. Here are some basic guidelines:

- **Use a class** when you have an object with an internal state and methods which modify that internal state.
- **Don't use a class** soley as a namespace or when you're **assembling and returning an object whose behavior is fully determined at instantiation** with no meaningful **lifecycle** or need for `this`. A **factory-function** would be more appropriate here.
- **Note:** I would also recommend avoiding classes for **handling IO-data** (even when you feel tempted to use OOP), because this often leads to:
  - Many unnecessary **constructor calls** to support dynamic behavior, or a large number of identical `public static` functions
  - IO-data should just be 'acted upon' not do things.
  - Use **namespace-object scripts** for handling IO-data and describe the data-items with **type-aliases**.

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

Type-alias and interfaces are the two primary ways to describe object-types and there's a lot of debate on when to use each. The recommendation from the official TypeScript documentation is to use interfaces until you need to use a type. However, there's not a universal consensus about this amongst the TypeScript community. Types are much more versatile and the only features interfaces have that types don't is declaration merging and implementing classes. Also interfaces can cause issues when transforming data too (due to possible declaration-merging they can't be passed to `Record<PropertyKey, unknown>`) so my personal recommendation is this: *use type-aliases until you need to use an interface (classes and declaration-merging)*.

To put this into perspective, here's an example of an issue we'd face if we used an interface where a structured-type would be better:

```ts
interface User {
  id: number;
  name: string;
}

function printDataEntries(item: Record<string, unknown>): void {
  console.log(Object.entries(item))
}

const user: User = { id: 1, name: 'joe' };

printDataEntries(user); // TYPE-ERROR: IUser cannot be used to index type 'string'
```

<br/><b>***</b><br/>

<a id="script-types"></a>
## 📄 Script Types

Every file should have a clear purpose. Most scripts fall into one of the following categories:

- **Declaration**  
  Exports a single declared item (e.g., a large function, enum, or configuration object).

- **Namespace-Object**  
  Exports a default object-literal that groups closely related logic/readonly-values. 

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
  4. `Types`  
  5. `Run (or Setup)`
  6. `Components`: (if applicable `.jsx` / `.tsx`)  
  7. `Functions` (function-declarations)
  8. `Classes`: Classes generally should go in their own file but small locally used ones are okay. 
  9. `Export`: imports should generally go at the bottom unless it's an inventory-script

> Note: **Constants** should be primarily for static data but could also include functions/objects which primarily handle static-data. See **Constants nuances** below.

Separate regions with:

```ts
/******************************************************************************
                        "Region Name" (i.e. Constants)
******************************************************************************/
```

**Regions** can be divided further into **sections**:

```ts
// -------------------------- Setup middleware --------------------------- //
// Note: if you to add some comments for a Section or Region separator
// place them here, directly below the separator.

const app = express();

app.use(middleware1);
app.use(middleware2);

do stuff....

// ----------------------- Configure Front-End --------------------------- //
const FRONT_END_DIRECTORY_PATH = __dir + '/client/html';

app.views(FRONT_END_DIRECTORY_PATH + '/views');
app.static(FRONT_END_DIRECTORY_PATH + '/static');

do more stuff...
```

**Sections** can be divided into **blocks**:

```ts
// apiRouter.ts <-- Linear script

// ----------------------- Add User Routes  --------------------------- //
const loginRouter = Router.new();

// -- Local Login -- // <-- Separate blocks with this
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

#### *Constants section* nuances
- Value-factory-functions (see [Terminology](#terminology) above) and configured-value-objects can also go at the bottom of the **Constants** section.
- Although function-declarations are preferred for functions in most situations, use function-expressions for value-factory-functions so they are more inline with other content in the **Constants** section.
```ts
// bottom of the *Constants* section

// Value-factory-function: we wrapped the defaults in a function so we get a current datatime each time
const GetDefaults = (): IUser => ({
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

#### Configured-functions nuances
- Because areas of a script above the **Functions** section maybe depend on configured-functions (but they are not hoisted), a common practice is to wrap them with helper function-declarations when hoisting is needed. This allows us to keep our script clean by keeping all functions (other than value-factory-functions of course) together in one section.
- Here is the recommended way to do this in more detail:
  - Place configured-functions above all functions declarations in the **Functions** section, and separate them with a *section-separator* if you have both.
  - Create a *hoist* helper function which accepts a configured-function's name and returns it with a switch-case.
  - If a configured-function does not need to be hoisted, you do not need a switch case for it.

Hoisting configured-functions example:
```ts
// UserModel.ts

/******************************************************************************
                                      Setup                                  
******************************************************************************/

// Setup validators object
const UserSchema = {
  isName: isValidString,
  isEmail: hoist('isURL'),
};

/******************************************************************************
                                   Functions                                   
******************************************************************************/

const isEmail = isValidString({
  maxLength: 255,
  regex: ...some regex,
});

// Does not need hoisting so we don't add a switch case for it.
const isValidURL = isValidString({
  maxLength: 255,
  regex: ...some regex,
});

// --------------------- Function-Declarations ---------------------------- //

/**
 * Use a function-declaration since we don't need hoisting.
 */
function isValidString(arg: unknown): arg is string {
  return typeof arg === 'string';
}

/**
 * @private
 */
function hoist(name: string) {
  switch (name) {
    case 'isEmail':
      return isEmail;
    default:
      throw new Error('Unknown declaration');
  }
}

/******************************************************************************
                                   Export                                   
******************************************************************************/

return {
  schema: UserSchema
  isValidURL,
} as const;
```

### Helper types
- If you have a long lengths of code and you both can and want shorten it by assigning a long type name to a shorter name then that's okay. Just may sure the shorter name isn't used anywhere other than the code it's close to. If the type is declared directly in a file, I advise using acronyms to prevent collisions. 

```
/**
 * Fetch user scriptions whose status is suspended and suspension-reason type is 'failed-payment'.
 */
type sffps = ISuspendedForFailedPaymentSubscription;
function fetchSubscriptionsWhichAreSuspendedDueToFailedPayments(): Promise<sffps[]> {
  return database('subscriptions').where({ ... }).returning('*');
}
```

#### Linear Script Exceptions
- For large linear scripts, you don't have to follow strict section placement for items, but you should group large linear scripts into **sections** and place constants at the top of their respective section/block.

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
    - For value-objects, use `PascalCase` for the object name and any nested objects and `UPPER_SNAKE_CASE` for the keys holding readonly values.
    - If an object is readonly but not a namespace-object (the whole is being passed as  value) and you need specific key names, UPPER_SNAKE_CASE is preferred for the object name.
    - For the objects exported from namespace-object scripts:
      - If its functions are mostly static-logic (no initialization at startup-time), prefer `PascalCase`: i.e `import DateUtils from 'DateUtils.ts;`.
      - If its functions require initialization, prefer `camelCase`: i.e `import db from '@src/infra/db.ts;`.
- **All variables declared inside of functions except for type declarations**: `camelCase`
- **Functions**:
  - `camelCase`: most of the time
  - `PascalCase`: for certain situations
    - JSX Elements
    - Functions just meant to return mostly static data with little or no formatting (i.e. validator-factory-functions) can be `PascalCase`.
  - Prepend functions returning non IO-data with a `get` and IO-data with a `fetch` (i.e. `getTimeAsUTC()`,`async fetchUserRecords()`).
  - Prepend **validator-functions** with an `is`: `isValidUser(arg: unknown): arg is IUser`.
  - If you need to distinguish functions meant to throw an error from a counterpart function, append `OrThrow`: i.e. `findUserById` (IUser | null) vs `findUserByIdOrThrow` (IUser).
- **Classes:** `PascalCase`
- **Types**: `PascalCase`
  - Aside from using PascalCase, there are some other common patterns used:
    - Traditionally, interfaces would be prepended with an `I` and type-aliases with a `T` but these have fallen out of favor. I'd recommend prepending interfaces with an `I` still ONLY if it's describing a class and you want to avoid naming collisions with the class (i.e. IUser for class User).
    - The suffix `_raw` is useful for indicating types which **MUST** be processed before being used (i.e. `IUserAvatar_raw` -> "service layer" -> `IUserAvatar`).
- **Booleans**: prefix with `is`

**Abbreviations** and **Acronyms**:
- This is not an exact science and abbreviations/acronyms should generally be avoided for clarity BUT there are plenty of exceptions:
  - Well-establish abbreviations (i.e. URL, API) and acronyms (i.e. Pwd, Req => Request) are usually okay.
  - Use **ALL CAPS** for well-established acronyms: i.e `insertIntoURL()`.
  - Avoid both when when doing `UPPER_SNAKE_CASE` unless it's a well-establish acronym.
  - For a long variable-names that could be cumbersome to use (are used widely throughout your application) an abbreviation/acronym is probably okay; however, the core layer describing them (i.e. the database table and its typer) should refrain from doing so unless it's a well-establish acronym.
  - For very narrowly-scoped items, abbreviate/use-acronyms are usually okay.

> The namespace-object script [UserModel.ts](UserModel.ts) has some good examples on standard naming conventions.

<br/><b>***</b><br/>

<a id="comments"></a>
## 💬 Comments

- Place `/** */` above all **function-declarations** always, `//` or no comment is okay for **function-expressions**.
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
  - **utils** runtime logic. Functions under `utils` should not fetch IO-data, talk to persistance layers, or import runtime logic from anywhere else other than third-party-libraries or other utility functions in the same directory. This helps to prevent dependency loops.
  - **constants**: organzing readonly values but can also include functions which return mostly readonly values after some simple formatting (function which returns an error message string with the username inserted into it).
  - **types**: standalone compile-time items (type-aliases and interfaces, never runtime items) that don't need to be coupled with runtime logic in the shared area.
  - **ui:** Any file ending with a `.jsx/.tsx` extension.

### Branch-directories and the `common` folder
- In a **branch-directory** with shared content create a subfolder named `common/`.
- Avoid using **dumping-ground-names** for folders like `misc/`, `helpers/`, `shared/` etc. (except for the common-categories listed above) as their purpose is ambiguous and can quickly degrade your package's organization.
- Within `common/` it's okay to group files by category but for files **DO NOT EVER** use dumping-ground names. In branch-directories (including `common/`) **filenames should always demonstrate clear intent**: (i.e. `src/common/types/utility-types.ts`).
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
- Because a file's purpose in a focused-directory has many layers of narrowing, dumping-ground names like `utils.ts`, `ui.tsx`, etc are actually okay in the `local/` folder. However, **DO NOT** place files with dumping-ground-names directly in the focused-directory itself.
- If there's focused-directory code which needs to be shared both locally and externally, you can place those items in `local/` as well **`local/` is not meant to be super strict**.
- If a focused-directory has some shared code not used internally, **but it still makes sense to place that code in that particular focused-directory because it's very unique to that directory's purpose,** place those items in the **external/** folder.
- If you want to be extra careful about some focused-directory items never being used externally, place them in a folder named **internal/**.
- If some code in a focused directory isn't shared (that is, it's just used in one place but it was large enough to make separate file for) but you'd like to keep in separated from the other files at a focused-directories root, you can use `local/internal` for that as well: see the `sortTableData.ts` file in the example below.

Various focused directories in a React project:
```markdown
- common/
  - ui/
    - DataTable/
      - local/
        - datatable-elements.tsx <-- shared inside and outside of DataTable/
      - external/
        - dataTableFilterToUrlString.ts <-- an external only helper function.
      - internal/
        - sortTableData.ts <-- not shared, only called in one place in DataTable.ts
      - Datatable.tsx
      - Datatable.test.tsx
- Login/
  - dialogs/
    - local/
      - AuthDialog.tsx <-- base dialog for the other two
    - ForgotPasswordDialog.tsx
    - SignupInsteadDialog.tsx
  - local/
    - ui.tsx <-- stores JSX elements needed by both the `Login` component and the `ForgotPasswordDialog` component.
    - constants.ts
  - Login.tsx
  - Login.test.tsx
```

### Going further

Folders under `common/` and files/folders under `local/` are not confined to common-category names. You can create your own categories too for something used heavily throughout your codebase. Common-categories are more for storing items which don't fit into a specific place. Some other categories I commonly create are:
  - **classes** - I rarely implement new classes but I'll create a folder for them if I do: (i.e. creating custom `Error` objects).
  - **entities** - types used to describe database table.

Files under `common/local/internal/external` should never talk to persistance-layers/fetch-IO-data. Use the layers of your application (i.e. Service layer) for that.

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
- **entity-type:** an structured-type used to describe the shape of a raw database-table.
  - People also use the term **record** when referring to database-rows, but for TypeScript I advise against this to avoid confusion with the type **Record<>**
- **auxiliary-table:** a database-table which supports another: (i.e user_avatars holds image metadata for users)
  - **join-table:** an auxiliary-entity which supports multiple tables together. User plural for both tables in the name: i.e. `projects_users`
- **derived-type:** is a type which builds off of an entity-type.
- An **audit-column** is a database-key which holds meta-data about an entity's lifecycle: i.e. `createdAt`, `createdBy`.

#### Documenting with comment @tags

Because TypeScript let's us type the return value and parameters, traditional `jsDoc` comments like `@returns`/`@param` are excessive; however, there are still some comment-tags which can be pretty useful. 

##### Misc
- `@private`: functions never used outside of their file.
  - Below `@private` can also add `@see nameOfTheFunctionUsingIt`  
- `@testOnly`: for testing only and never in production (any item not just functions).
- `@cronJob`: functions only for cron-jobs and not user-initiated.
- `@dummyData`: functions only used by dummy-data scripts.
- `@startupTime`: functions run at startup-time not request-time. Not really necessary for libraries or automation scripts but for user-heavy based applications like web-servers.

##### Working with relational-databases

> `@tags` are extremely helpful for code that works with a database so we don't constantly have to look in our DBMS for relationship info.

- `@entity table_name`, above an entity-type declaration:
```ts
/**
 * @entity users
 */
type User = { name: string; };
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
  - `// @AC`: auditing columns which are not also foreign-keys (i.e. `createdAt`, `updatedAt`)
  - `// @Tr`: transient entries appended to an object outside the database level
    - Generally, try to use derived-types in palace of entites with transient-keys.

#### User model snippet
```ts
type Entity = {
  id: number; // @PK
  createdAt: Date | string; // @AC
  updatedAt: Date | string; // @AC
};

/**
 * @entity users
 */
type User = Entity & {
  name: string;
};

/**
 * @entity user_avatars
 * @auxiliaryOf users
 */
type UserAvatar = Entity & {
  fileName: string | null;
  userId: number; // @FK 1-1
}

// This is setup in the services layer
type UserAvatarDTO = UserAvatar & {
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

Layers overview:
  - **repository:** service-layer which talks to the persistence-layer
    - If you have multiple persistence-layers (i.e. and database and a file storage third party tool). I like to use plain `repo` when referring to the database and then `"persistence layer" + "repo"` for something else: i.e "UserRepo.ts" (talks to the database) and "UserAssetRepo.ts" (fetches user file data from s3).
  - **service:** business logic (server-side) or API calls (client-side)
  - **controller:** handle incoming requests from the client (server-side)
  - **middleware:** logic typically passed to the framework to format/validate incoming requests

Use **layer-based** based architecture for simple (single developer) applications:
  - Easier mental map
  - Folder names show clear intent
  - Doesn't scale well though

```markdown
- config/
- src/
  - assets/
  - repos/
    - db/
      - db.ts <-- setup and return database handler
    - UserRepos.ts
    - PostRepos.ts
  - routes/ (aka controllers)
    - UserRoutes.ts
    - PostRoutes.ts
  - services/
    - UserServices/
      - UserService.ts
      - UserImageAssetService.ts <-- Created later: for uploading avatar to remote storage (i.e S3).
    - PostService.ts
  - main.ts
  - server.ts
- tests/
  - users.test.ts
  - posts.test.ts
- package.json
- tsconfig.json
```

You might be wondering why we gave the files names like `UserRepo.ts` instead of `user.repo.ts`. That's because these are **namespace-object scripts** not **inventory-scripts**: see the [Naming Conventions](#naming-conventions) section.

Use **domain-based** architecture for large applications:
- Scales better
- Less risk of circular dependencies
- Avoids bloated services layer
- Avoids merge-conflicts
- Intent less clear so harder to demo for smaller projects tutorials

```markdown
- config/
- src/
  - asssets/
  - common/
  - domain/
    - users/
      - local/
        - constants/
          - errors.ts
        - types
          - schemas.ts
      - UserRepo.ts
      - UserService.ts
      - UserImageAssetService.ts
      - UserController.ts
    - posts/
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

##### Keys points
- In the above layer-based example, you can see that when we needed to add another module for `UserService`, we had to add a folder to the services-layer, move UserService.ts inside of it, and now for the root of the `services/` folder, we have a mixture of files and folders to list the different service-layer domains.
- For domain-based architecture, keep only layer-files (i.e. `UserRepo.ts`) directly in the domain's root folder. Make use of the `local/internal/external` folders discussed earlier under [Organizing shared code](#organizing-shared-code) for helper files (i.e. `constants.ts`).
 
> The examples demonstrated architecture using a typical back-end web server. For a client-side example of domain-based architecture, see: [React-Ts-Best-Practices](https://github.com/seanpmaxwell/React-Ts-Best-Practices).
