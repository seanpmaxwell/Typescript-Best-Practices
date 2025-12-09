# Typescript-Best-Practices
Patterns and Best Practices for procedural Typescript/JavaScript development following the rule of 4 principle


## Table of contents
- [4 fundamental features](#4-fundamental-features)
- [4 types of scripts](#4-types-of-scripts)
- [Script (file) Organization](#script-organization)
- [4 fundamental features in detail](#4-fundamental-features-in-detail)
  - [Primitives](#primitives)
  - [Functions](#functions)
  - [Objects](#objects)
    - [Object-literals](#object-literals)  
    - [Classes](#classes)
    - [Enums](#enums)
  - [Types](#types)
- [Naming](#naming)
  - [Files/Folders](#files-folders)
  - [General Notes](#general-naming-notes)
  - [Functions](#naming-functions)
  - [Objects](#naming-objects)
  - [Types](#naming-types)
- [Comments](#comments)
- [Imports](#imports)
- [Example Scripts](#example-scripts)
- [Misc Style](#misc-style)
- [Testing](#testing)
  - [General Notes](#testing-general-notes)
  - [Structuring BDD style tests](#testing-bdd-style)
<br/>


## 4 "Fundamental" Features <a name="4-fundamental-features"></a>
- `Primitives`, `Functions`, `Objects`, and `Types`
- <b>Primitives</b> - 5 original: `null`, `undefined`, `boolean`, `number`, `string`. Two new ones `symbol` and `bigint`. 
- <b>Functions</b> - 4 ways to create functions: function-declarations `function functionName() {}`, arrow-functions `() => {}`, placing them directly in object-literals (not counting arrows), and directly inside classes (not counting arrows).
- <b>Objects</b> - 4 ways to create objects: object-literals, enums, classes, calling functions with `new` (obsolete es5 way).
- <b>Types</b> - 2 main ways to create types:
  - types-aliases (created with `type`): This also includes includes utility-types which create new types with generics. 
  - interfaces (`interface`): Note: there's also function-overloading for function-declarations. 
- Note: Functions are technically objects too but for all practical purposes we'll consider them separate.
<br/>


## 4 types of scripts <a name="4-types-of-scripts"></a>
- <b>Declaration</b>: exports one large declared item (i.e. a file called HttpStatusCodes.ts which exports a single enum containing all the http status codes.
- <b>Modular-Object</b>: In JavaScript, module is another term for file, so if we use a single object to represent the items available from that file, we'll call it a modular-object script. The export default is an `object-literal` containing a bunch of closely related functions/variables (i.e. a file call UserRepo.ts which has a bunch of functions for handling database queries related to user objects, we refer to it as the _UserRepo_ module).
- <b>Inventory</b>: for storing a large number of declared items that are individually exported (i.e. a file called types.ts which stores commonly shared types throughout your application).
- <b>Linear</b>: executes a series of commands (i.e. a file called `setup-db.ts` which does a bunch of system commands to initialize a database).
<br/>


## Script (file) Organization <a name="script-organization"></a>
- Because of how hoisting works in JavaScript, you should organize a file into these regions. Note that your file may not (and usually won't) have all of them:
  - Constants
  - Types
  - Run/Setup
  - Components (for .jsx/.tsx files)
  - Functions
  - Export
- Some special notes about organization:
  - Only constant/readonly variables (primitive and object values) should go directly in files in the `Constants` region (except maybe in linear scripts).
  - If you are writing a linear script, it might make more sense to group your code by the task they are doing instead of by the fundamental-feature. Still, if you decide to create some function-declarations in the same script, place your function-declarations in another region at the bottom of the file below the <b>Run/Setup</b> section.
  - Always put the `export default` at the very bottom of every file. This makes your default export easier to keep track of and apply any wrappers it may need.
- Organzation overview
  - Project (application or library)
  - Directory (Folder)
  - File (aka module)
  - Region
  - Section
<br/>


## 4 fundamental features in detail and when/how you should use them. <a name="4-fundamental-features-in-detail"></a>

### Primitives <a name="primitives"></a>
- To repeat: the 5 original are: `null`, `undefined`, `boolean`, `number`, `string` and the two new ones added recently are `symbol` and `bigint`.
- `symbol` is not nearly as prevalent as the others but is useful for creating unique keys on objects exported from libraries. Since objects from libraries are passed around a lot to other unknown applications, with symbols we don't have to worry about the key/value pairs in the library object getting overridden. 
- In addition to knowing what the primitives are you should know how coercion works. Coercion is when we try to call a function on a primtive and JavaScript (under the hood) wraps its object counterpart (`Boolean`, `Number`, or `String`) around it so we can make the function call, since primitives by themselves don't have functions.

### Functions <a name="functions"></a>
- As mentioned, there are function-declarations made with `function fnName() {}` and arrow-functions made with `() => {}`. Function-declarations should be used directly in files (so that we can use hoisting) and arrow functions should be used when creating functions inside of other functions (i.e. a callback passed to a JSX element). You may have to make exceptions to this when working with certain libraries cause of how `this` works in each, but generally this is how it should be done.
- When using arrow functions, only use parenthesis for the params if there are multiple params. Paranthesis are overkill if there is only one param:
```.ts
function ParentFn(param) {
   const childFn = val => ...do something with the val;
   const childFn2 = (val1, val2) => do something else;
   const badThing = (val) => ...do something else with the val;
   childFn(val);
}
```
- Functions can be be placed directly in object literals. I usually do it this way for longer multi-line functions but will use an arrow function for short functions. Note that for `direct-in-object-literal` functions The `this` keyword will refer to properties on the containing object.
```
const objLiteral = {
  helloPre: 'hello ',
  sayHello(name: string) {
    console.log(this.helloPre + name);
  },
  sayHelloAlt: (name: string) + console.log(...) // Can also use an arrow function but the `this` keyword won't refer to the parent-object literal. 
}
```

### Objects <a name="objects"></a>
- _Objects_ are lists of key/value pairs and there are 3 templates for intializing objects, <i>object-literals</i>, <i>enums</i>, and <i>classes</i>.
- Another way to initialize objects is to call a function with `new` but this is considered obsolete next to classes and leads to more complex code when doing inheritance.
- `instance-objects` are objects created from classes or calling functions with `new`. 
- All objects inherit from the parent `Object` class. We'll use the term <b>basic-object</b> to refer to objects which inherit directly from this class and no other.
- Just to point out, symbols have single key/value pair and functions also have key/values pairs and inherit from the `Function` class which in turn inherits from the `Object` class. Due to how we use these features though, we'll consider objects, functions, and symbols separate datatypes. Also note that in Javascript objects are dynamic (we can append as many properties as we want) but in Typescript the keys are static by default once the object is instantiated.

#### Object-literals <a name="object-literals"></a>
- `object-literals` are a what's created from doing key/value pairs lists with curly-braces (ie `{ name: 'john' }`) and are a convenient, shorthand way of creating basic-objects. They make it easy to both organize code and pass data around.
- When we use `export default { func1, func2, etc} as const` at the bottom of a modular-object script, we are essentially using object-literals to organize our code.
- We should generally (but not always) use object-literals over classes for organizing code for the reasons mentioned in the next section.

#### Classes <a name="classes"></a>
- Try to follow the <b>"M.I.N.T."</b> principle (<i>Multiple Instances, Not-Serialized, and Tightly-Coupled</i>) when deciding whether or not to use classes. This Medium article here explains the MINT principle in more detail:
<a target="_blank" href="https://github-readme-medium-recent-article.vercel.app/medium/@seanpmaxwell1/0">
  <img src="https://github-readme-medium-recent-article.vercel.app/medium/@seanpmaxwell1/0" alt="Recent Article 0"/>
</a>

#### Enums <a name="enums"></a>
Enums are somewhat controversial, I've heard a lot of developers say they do and don't like them. I like enums because because we can use the enum itself as a type which represents and `OR` for each of the values. We can also use an enum's value to index that enum and get the string value of the key. Here's what I recommend, don't use enums as storage for static values, use a readonly object for that with `as const`. Use enums for when the value itself doesn't matter but what matters is distinguishing that value from related values. For example, suppose there are different roles for a user for a website. The string value of each role isn't important, just that we can distinguish `Basic` from `SuperAdmin` etc. If we need to display the role in a UI somewhere, we can change the string values for each role without affecting what's saved in a database.
```typescript
// Back and front-end
enum UserRoles {
  Basic,
  Admin,
  Owner,
}

// Front-end only
const UserRolesDisplay = {
  [UserRoles.Basic]: 'Basic',
  [UserRoles.Admin]: 'Administrator',
  [UserRoles.Owner]: 'Owner'
} as const;

interface IUser {
  role: UserRoles; // Here we use the enum as a type
}

function printRole(role: UserRoles) {
  console.log(UserRolesDisplay[role]); // => "Basic", "Administrator", "Owner"
}
```

#### Enum Alternative
<b>UPDATE 12/7/2025:</b> The TypeScript team is now discouraging the use of enums with the `--erasableSyntaxOnly` flag. A alternative to enums you can use in an object appended with `as const`. If you need a tuple of it's values, a simple utility-type can help.
```ts
const USER_ROLES = {
  Basic: 0,
  Admin: 1,
  Owner: 2,
} as const;

type ValueOf<T extends object> = T[keyof T]; 
type TUserRoles = ValueOf<typeof UserRoles>; // '0 | 1 | 2'

interface IUser {
  id: number;
  name: string;
  role: TUserRoles;
}
```

### Types (type-aliases and interfaces) <a name="types"></a>
- Use interfaces (`interface`) by default for describing object-literals as they are a bit cleaner for implenting/extending. Note that interfaces can also describe classes. 
- Use type-aliases (`type`) for everything else. I like to separate type-aliases into standard type-aliases and utility-types which use generics for construction standard types.
- I generally like to places type-aliases above interfaces in the `Types` region of my files.
```
type TRoles = 'basic' | 'admin'; // standard type-alias
type ModelKeys<T extends Model> = keyof T; // utility-type
type TUserKeys = ModelKeys<IUser>; // standard type-alias constructed from utility-type


interface IUser {
  id: number;
  name: string;
  role: TRoles;
}
```
<br/>


## Naming <a name="naming"></a>

### Files/Folders <a name="files-folders"></a>

#### Misc Notes
- Folders: Generally use lowercase with hyphens (Kebab case), but you can make exceptions for special situations (i.e. a folder in React holding Home.tsx and Home.test.tsx could be named `Home/`.
- Declaration scripts: filename should match declaration name. (i.e. if the export default is a function `useSetState()`, the filename should be `useSetState.ts`.
- Modular-object scripts: PascalCase.
- Inventory: Kebab case (shared-types.ts)
- Linear: Kebab case (setup-db.ts)
- Folders not meant to be committed as part of the final code, but may exists along other source folders, (i.e. a test folder) should start and end with a double underscore `__test-helpers__`.

#### The "common/" and "support/" subfolders
- Try to avoid naming folders `misc/` or `shared/`. These can quickly become dumping grounds for all kinds of miscellaneous content making your code disorganized. What I usually do is, if a folder has files with shared content, create a subfolder named `common/` which will only ever have these three subfolders `constants/`, `utils/` and `types/`. You can create multiple `common/` folders for different layers/sections of your application and remember to place each one's content only at the highest level that it needs to be. Here's a list of what each `common/` subfolder is for:
  - `utils/`: logic that needs to be executed (i.e. standalone functions, modular-object scripts, and classes)
  - `constants/`: static items, could be objects, arrays, or primitives
  - `types/`: for type only storage (type aliases, utility-types, and interfaces)
  - <b>CHEAT</b>: If you have a very simple `common/` folder, that only has a single file that's a declaration or modular-object script, you can have just that one file in there without creating the `constants/`, `utils/` and `types/` subfolders, but remember to add these if that `common/` folder grows though. If you have an extremely small number of shared items, you can create a `common.ts/index.tsx` file instead of folder.
- In short `common/` is not a grab-n-bag, `common/` is ONLY for shared types, constants, and utilities (executable logic) that are used across multiple files, nothing else.
- If you have something that isn't shared but you don't want it to go in the file that it is used in for whatever reason (i.e. a large function in an express route that generates a PDF file) create another subfolder called `support/`and place it there.

#### Example of file/folder naming using a basic express server
```
- src/
  - common/
    - constants/
      - HttpStatusCodes.ts
      - Paths.ts
      - index.ts
    - types/
      - index.ts
    - utils/
      - StringUtil.ts
      - misc.ts // A bunch of standalone functions
  - routes/
    - common/
      - Authenticator.ts // See cheat above. Authenticator.ts is a modular-object script that would never be used outside of routes/.
    - support/
      - generateUserPaymentHistoryPdf.ts // A single function used only in UserRoutes.ts but is large/complex enough to have it's own file. 
    - UserRoutes.ts
    - LoginRoutes.ts 
  - server.ts
- tests/
  - common/
    - tests/
  - user.tests.ts
  - login.tests.ts
```

### General Notes <a name="general-naming-notes"></a>
- Primitives should be declared at the top of files at the beginning of the "Constants" section and use UPPER_SNAKE_CASE (i.e. `const SALT_ROUNDS = 12`).
- Readonly arrays/objects-literals (marked with `as const`) should also be UPPER_SNAKE_CASE.
- Variables declared inside functions should be camelCase, always.
- Boolean values should generally start with an 'is' (i.e. session.isLoggedIn)
- Use `one-var-scope` declarations for a group of closely related variables. This actually leads to a slight increase in performance during minification. DON'T overuse it though. Keep only the closely related stuff together.
```typescript
// One block
const FOO_BAR = 'asdf',
 BLAH = 12,
 SOMETHING = 'asdf';

// Auth Paths
const AUTH_PATHS = [
  '/login',
  '/signup',
 ] as const;

// Errors, don't merge this with AUTH_PATHS
const ERRS = {
   Foo: 'foo',
   Bar: 'bar',
} as const;
```

### Functions <a name="naming-functions"></a>
- camelCase in most situtations but for special exceptions like jsx elements can be PascalCase.
- Generally, you should name functions in a verb format: (i.e. don't say `name()` say `getName()`).
- For functions that return data, use the `get` word for non-io data and fetch for IO data (i.e. `user.getFullName()` and `UserRepo.fetchUser()`).
- Simple functions as part of object-literals just meant to return constants don't necessarily need to be in a verb format. Example:
```typescript
const ERRORS = {
   SomeError: 'foo',
   EmailNotFound(email: string) {
      return `We're sorry, but a user with the email "${email}" was not found.`;
   },
} as const;

// Note: Errors in an immutable basic-object because we create it with an object-literal and make it immutable with 'as const'.
```
- Prepend helper functions (function declarations not meant to be used outside of their file) with an underscore (i.e. `function _helperFn() {}`).
- If you want to name a function that's already a built-in keyword, pad the name with a double underscore `__`:
```
// User.ts

function __new__(): IUser {
  return ...do stuff
}

export default { new: __new__ } as const;
```

### Objects <a name="naming-objects"></a>
- Generally, objects initialized outside of functions and directly inside of files with object-literals should be immutable (i.e. an single large `export default {...etc}` inside of a Colors.ts file) and should be appended with `as const` so that they cannot be changed. As mentioned in the <b>Variables</b> section, simple static objects/arrays can be UPPER_SNAKE_CASE. However, large objects which are the `export default` of declaration or modular-object scripts should be PascalCase.
- `instance-objects` created inside of functions or directly in the file should use camelCase.
- PascalCase for class names and any `static readonly` properties they have (i.e. Dog.Species).
- Use PascalCase for the enum name and keys. (i.e. `enum NodeEnvs { Dev = 'development'}`)
```typescript
// UserRepo.ts

// camelCase cause dynamic object
const dbCaller = initializeDatabaseLibrary();

function findById(id: number): Promise<IUser> {
  dbCaller.query()...
}

function findByName(name: string): Promise<IUser> {
  dbCaller.query()...
}

export default {
  findById,
  findByName,
} as const;


// UserService.ts

// PascalCase
import UserRepo from './UserRepo.ts'; 

// Immutable so use UPPER_SNAKE_CASE
const ERRS = {
   Foo: 'foo',
   Bar: 'bar',
} as const;

function login() {
  ...do stuff
}

...
```

### Types <a name="naming-types"></a>
- Prepend interfaces with an 'I' (i.e. `interface IUser { name: string; email: string; }`)
- There's no standard naming convention for type-aliases. However, I like to use PascalCase for utility-types and PascalCase prepended with a `T` for standard type-aliases.
```ts
  type TISOString = `${string}Z`; // standard type-alias
  type ExtractKeys<T extends object> = keyof T; // utility-type alias
```
<br/>


## Comments <a name="comments"></a>
- Separate files into region as follows (although this could be overkill for files with only one region, use your own discretion):
```ts
/******************************************************************************
                                RegionName (i.e. Constants)
******************************************************************************/
```
- Separate regions into sections by a `// **** "Section Name" (i.e. Shared Functions)  **** //`.
- Use `/** Comment */` above each function declaration ALWAYS. This will help the eyes when scrolling through large files. The first word in the comment should be capitalized and the sentence should end with a period.
- Use `//` for comments inside of functions. The first word in the comment should be capitalized.
- Capitalize the first letter in a comment and use a '.' at the end of complete sentences.
```typescript
/**
 * Function declaration comment.
 */
function foo() {
  // Init
  const bar = (arg: string) => arg.trim(),
    blah = 'etc';
  // Return
  return (bar(arg) + bar(arg) + bar(arg));
}
```
- If you need to put comments in an `if else` block put them above the `if` and `else` keywords:
```typescript
// blah
if (something) {
   do_something...
// foo
} else {
   do_something else...
}
```

- Don't put spaces within functions generally, but there can be exceptions like between dom elements or hooks elements in React functions. Use `//` comments to separate chunks of logic within functions. Use one space with a `/** */` comment to separate functions.
```typescript
/**
 * Some function
 */
function doThis() {
   // Some logic
   if (this) {
     console.log('dude');
   }
   // Some more logic
   ...do other stuff blah blah blah
   // Return
   return retVal;
}

/**
 * Some other function
 */
 function doThat() {
   // Some other logic
   for (const item of arr) {
      ...hello
   }
   // Last comment
   if (cool) { return 'yeah'; }
}
```

- If you have a really long function inside of another really long function (i.e. React Hook in a JSX element) you can separate them using `// ** blah ** //`.
<br/>


## Imports <a name="imports"></a>
- Try to group together similarly related imports (i.e. Service Layer and Repository Layer in an express server).
- Be generous with spacing.
- Put libraries at the top and your code below.
- Try to put code imported from the same folder towards the bottom.
- For imports that extend past the character limit (I use 80), give it a new line above and below but keep it just below the other related imports.
```
import express from 'express';
import insertUrlParams from 'inserturlparams';

import UserRepo from '@src/repos/UserRepo';
import DogRepo from '@src/repos/DogRepo';

import {
 horseDogCowPigBlah,
 horseDogCowPigBlahhhhhh,
 horseDogHelllllloooooPigBlahhhhhh,
} from '@src/repos/FarmAnimalRepo';
 

import helpers from './helpers';
```


## Example Scripts <a name="example-scripts"></a>
- Now that we've gone over the main points, let's look at some example scripts.

- A modular-object script:
```typescript
// MailUtil.ts
import logger from 'jet-logger';
import nodemailer, { SendMailOptions, Transporter } from 'nodemailer';


/******************************************************************************
                             Constants
******************************************************************************/

const SUPPORT_STAFF_EMAIL = 'do_not_reply@example.com';


/******************************************************************************
                               Types
******************************************************************************/

type TMailer = Transporter<SMTPTransport.SentMessageInfo>;


/******************************************************************************
                               Run (Setup)
******************************************************************************/

let mailer: TMailer | null = null;

(async () => {
  try {
    const transporter = nodemailer.createTransport({ ...settings });
    await transporter.verify();
    mailer = transporter;
  } catch (err) {
    console.error(err);
  }
})();


/******************************************************************************
                               Functions
******************************************************************************/

/**
 * Send an email anywhere.
 */
function sendMail(to: string, from: string, subject: string, body: string): Promise<void> {
   await mailer.send({to, from, subject, body});
}

/**
 * Send an email to your application's support staff.
 */
function sendSupportStaffEmail(from, subject, body): Promise<void> {
   await mailer.send({to: SUPPORT_STAFF_EMAIL, from, subject, body});
}


/******************************************************************************
                               Export default
******************************************************************************/

export default {
   sendMail,
   sendSupportStaffEmail,
} as const;
```

- An inventory script
```.tsx
// shared-buttons.tsx

/******************************************************************************
                               Components
******************************************************************************/

/**
 * Close a html dialog box.
 */
export function CloseBtn() {
    return (
        <button css={{ color: 'grey' }}>
         Close
        </button>
    );
}

/**
 * Cancel editing a html form.
 */
export function CancelBtn() {
    return (
        <button css={{ color: 'red' }}>
         Cancel
        </button>
    );
} 
```

- A declaration script:
```typescript
// EnvVars.ts

export default {
    port: process.env.PORT,
    host: process.env.Host,
    databaseUsername: process.env.DB_USERNAME,
    ...etc,
} as const;
```

- A linear script:
```typescript
// server.ts
import express from 'express';


/******************************************************************************
                                 Run (Setup)
******************************************************************************/

const app = express(); 

app.use(middleware1);
app.use(middleware2);

doSomething();
doSomethingElse();


/******************************************************************************
                               Export default
******************************************************************************/

export default app;
```
<br/>


## Misc Style (Don't need to mention things covered by the linter) <a name="misc-style"></a> 
- Wrap boolean statements in parenthesis to make them more readable (i.e `(((isFoo && isBar) || isBar) ? retThis : retThat)`)
- Use optional chaining whenever possible. Don't do `foo && foo.bar` do `foo?.bar`.
- Use null coalescing `??` whenever possible. Don't do `(str || '') do `(str ?? '')`.
- For boolean statements, put the variable to the left of the constant, not the other way around:
```
// Don't do
if (5 === value) {

// Do do
if (value === 5) {
```
- For Typescript, specify a return type if you are using the function elsewhere in your code. However, always specifying a return type when your function is just getting passed to a library could be overkill (i.e. a router function passed to an express route). Another exception could be JSX function where it's obvious a JSX.Elements is what's getting returned.
- For if statements that are really long, put each boolean statement on it's own line, and put the boolean operator and the end of each statement. For nested boolean statements, use indentation:
```typescript
  if (
    data?.foo.trim() &&
    data?.bar && (
      role !== ADMIN || 
      data?.id !== 3 || 
      name !== ''
    )
  ) {
     ...doSomething
  }
```
- When passing object-literals as parameters to function calls, put the first curly brace on the same line as the previous parameter, as following parameters on the same line as the last curly brace:
```typescript
// Good
fooBar('hello', {
  name: 'steve',
  age: 13,
}, 'how\'s it going?');

// Bad (I see this too much)
fooBar(
  'hello',
  {
    name: 'steve',
    age: 13,
  },
  'how\'s it going?'
);

function fooBar(beforeMsg: string, person: IPerson, afterMsg: string): void {
  ..do stuff
}
```
<br/>


## Testing <a name="testing"></a>

### General Notes <a name="testing-general-notes"></a>
- Anything that changes based on user interaction should be unit-tested.
- All phases of development should include unit-tests.
- Developers should write their own unit-tests.
- Integration tests should test any user interaction that involves talking to the back-end.
- Integration tests may be overkill for startups especially in the early stages.
- Integration tests should be done by a dedicated integration tester who's fluent with the framework in a separate repository.
- Another good reasons for tests are they make code more readable.
- Errors in integration tests should be rare as unit-tests should weed out most of them.

### Structuring BDD style tests <a name="testing-bdd-style"></a>
- Declare all your variables (except constants) in the `beforeEach`/`beforeAll` callbacks, even ones that don't require asynchronous-initialization. This makes your code cleaner so that everything is declared and initialized in the same place.
- Static constants should go outside of the top level `describe` hook and should go in the `Constants` region like with other scripts. This saves the test runner from having the reinitialize them everytime.
- The tests should should go in a new region between the `Setup` and `Functions` regions.
```ts
import supertest, { TestAgent } from 'supertest';
import { IUser } from '@src/modes/User';
import UserRepo from '@src/repos/UserRepo';


/******************************************************************************
                              Constants
******************************************************************************/

const FOO_BAR = 'asdfasdf';


/******************************************************************************
                               Tests
******************************************************************************/

describe(() => {

  // Declare here
  let testUser: IUser,
    apiCaller: TestAgent;

  // Initialize here
  beforeEach(async () => {
    testUser = User.new();
    await UserRepo.save(testUser);
    apiCaller = supertest.agent();
  });

  describe('Fetch User API', () => {

    it('should return a status of 200 and a user object if the request was ' +
      'successful', async () => {
      const resp = await apiCaller.get(`api/users/fetch/${testUser.id}`);
      expect(resp.status).toBe(200);
      expect(resp.body.user).toEqual(testUser);
    });

    it('should return a status of 404 if the user was not found', async () => {
      const resp = await apiCaller.get(`api/users/fetch/${12341234}`);
      expect(resp.status).toBe(404);
    })
  });
});


/******************************************************************************
                               Functions
******************************************************************************/

/**
 * Send an email anywhere.
 */
function _someHelperFn(): void {
   ...do stuff
}
```
