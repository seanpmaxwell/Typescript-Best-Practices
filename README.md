# Typescript-Best-Practices
Patterns and Best Practices for procedural Typescript/JavaScript development following the rule of 4 principle


## Files/Folder Organization

### 4 types of scripts (files)
- <b>Declaration</b>: exports one large declared item (i.e. a file called HttpStatusCodes.ts which exports a single enum containing all the http status codes.
- <b>Modular</b>: export default is an `object-literal` containing a bunch of closely related functions/variables (i.e. a file call UserRepo.ts which has a bunch of functions for handling database queries related to user objects).
- <b>Inventory</b>: for storing a large number of smaller declared items. (i.e. a file called types.ts which stores commonly shared types throughout your application)
- <b>Linear</b>: executes a series of commands (i.e. a file called `setup-db.ts` which does a bunch of system commands to initialize a database).

### 4 "Fundamental" Types
- Primitives, Functions, Objects, and Classes
- Functions are technicaly objects but are also callable and classes are syntax sugar for calling functions with `new`, but for all practical purposes we'll consider these our four fundamental types cause of how we use them.
 
### Organize files into 4 sections (group them by the "fundamental" type)
- Because of how hoisting works in JavaScript, generally you should organize a file into these 4 sections (note that your file may not have all of them):
 - Variables
 - Types
 - Run (execute any logic that you need to)
 - Functions

- Some special notes about organization:
 - Only constant/readonly variables (primitive and object values) should go directly in files in the `Variables` section (except maybe in linear scripts).
 - If you have a any classes that are small enough and not shared that they don't warrant creating a separate file, put them in another section below the functions. Although with modular-programming we usually (but not always) don't need to create classes.
 - If you are writing a large linear-script (i.e. task-automation or initializing a server), it might make more since to group your code by the task they are doing instead of by the fundamental-type. Still, if you decide to create some function-declarations in this script, place your function-declarations in another section at the bottom which is declared after all logic has executed.
 - Always put the `export default` at the very bottom of every file. This makes your default export easier to keep track of and apply any wrappers it may need. 

### Primitives
- `null`, `undefined`, `boolean`, `number`, `string` are the 5 o.g. primitives. es6 has added some new ones like `symbol` but we should all at least be familiar with the original 5 and how coercion works. Coercion is when we try to call a function on a primtive and JavaScript (under the hood) wraps its object counterpart (`Boolean`, `Number`, or `String`) around it so we can make the function call since primitives by themselves don't have functions.

### Functions
- There are function-declarations made with `function fnName() {}` and arrow-functions made with `() => {}`. Function-declarations should be used directly in files (so that we can use hoisting) and arrow functions should be used when creating functions inside of other functions (i.e. a callback passed to a JSX element). You may have to make exceptions to this when working with certain libraries cause of how `this` works in each but generally this is how it should be done.
- When using arrow functions, only use parenthesis for the params if there are multiple params. Paranthesis are overkill if there is only one param:
```.ts
function ParentFn(param) {
   const childFn = val => ...do something with the val;
   const childFn2 = (val1, val2) => do something else;
   const badThing = (val) => ...do something else with the val;
   childFn(val);
}
```

### Objects
- Anything with key/value pairs is technically an object. However, we'll use the term `basic-object` to refer to an object returned from an object-literal since they are just instances of the `Object()` class. Also note that in Javascript we can append as many properties as we want to a basic-object but in Typescript the keys are static once the object is instantiated, although the values can change unless we make it immutable. 

### Classes
- As for classes, the trend in javascript is to move away from object-oriented and now use procedural/functional programming. A good reason is that when doing IO, working with classes could get a little messy. For example, if `User` is a class, with properties (like `name` and `email`) and functions (like `toString()`) and we call `const john = new User()` and send that `john` variable through an IO request (like an api), `name` and `email` will be all that gets sent. Accordingly, on the receiving end (assuming it's still JavaScript) neither the functions nor the `_proto_` property are sent so `john instanceof User` and `john.toString()` won't work. We would have to call `new User(john)` again. Also keep in mind, for large projects it could get confusing as to whether the `john` variable somewhere is simply a basic-object or an actual instance of the User class. To avoid the overhead and confusion of working with classes, having a module-counterpart to store data-item functions and describing the structure of the item with an interface is usually a better alternative (i.e. for users have a `User.ts` modular file and an `IUser` interface).
- For modules used to present IO data (i.e. users stored in a database) as opposed to static modules (UserService layer in a server) we'll refer to these as `Data-Modules`.
- A good standard practice for every new data-module is to implement `new()`, `from()`, and `isValid()` functions and give it a corresponding interface.
```typescript
// The User module in the User.ts 

interface IUser {
 name: string;
 email: string;
 toString: () => string;
}


// **** Functions **** //

/**
 * Create new user. Appending name with '_' cause new is a built in keyword.
 */
function new_(name: string, email?: string): IUser {
  return { 
    name,
    email: (email ?? ''),
    toString,
  };
}

/**
 * Create user from object.
 */
function from(param: object): IUser {
  const p = param as IUser;
  return new_(p.name, p.email);
}

/**
 * See if the param is a user.
 */
function isValid(param: unknown): param is IUser {
  return (
    !!arg &&
    typeof arg === 'object' &&
    'id' in arg &&
    'email' in arg
  );
}

/**
 * Convert object to a string.
 */
function toString(user: IUser): string {
  return (this.name + '' + this.email);
}


// **** Export default **** //

export default {
  new: new_,
  from,
  isValid,
  toString,
} as const;
```

 - Despite the trend though, there are a few scenarios where a class might make sense. Suppose there's a situation where you have non IO data with an internal state and you that you want to call functions on it in order to manipulate that state. For example, take the `new Map()` object. It has it's own internal state which is used to track a list of key value pairs, and it provides you with all kinds of handy functions `get(), set(), keys(), length etc` to manipulate and access that state. It'd be pretty inconvenient to constantly have to do `const someMap = Map.new(); Map.set(someMap, 'key', 'value'), Map.get(someMap, 'key');`. But definitely any object that is IO data or static should be made with `basic-objects` and do note that classes often tend to get overused.

 
## Naming

### Files/Folders
- Folders: Generally use lowercase with hyphens. But can make exceptions for special situations (i.e. a folder in react holding Home.tsx, and Home.test.tsx could be uppercase `Home/`.
- Declaration scripts: file name should match declaration name. (i.e. if export default is `useSetState` file name should be `useSetState.ts`.
- Modular scripts: PascalCase.
- Inventory: lowercase with hyphens (shared-types.ts)
- Linear: lowercase with hyphens (setup-db.ts)
- Folders not meant to be committed as part of the final code, but may exists along other source folders, (i.e. a test folder) should start and end with a double underscore `__test-helpers__`

### Variables
- Static primitives/arrays should be declared at the top of files at the beginning of the "Variables" section and use UPPER_SNAKE_CASE (i.e. `const SALT_ROUNDS = 12`).
- Simple arrays and objects (objects don't contain any nested objects) just meant to hold static data and marked with `as const` can also be UPPER_SNAKE_CASE.
- Variables declared inside functions should be camelCase, always.
- Boolean values should generally start with an 'is' (i.e. session.isLoggedIn)
- Use `one-var-scope` declarations for a group of closely related variables. This actually leads to a slight increase in performance during minification. DONT overuse it though. Keep only the closely related stuff together.
```typescript
// One block
const FOO_BAR = 'asdf',
 BLAH = 12,
 SOMETHING = 'asdf';

// Auth Paths
const AUTH_PATHS = [
  '/login',
  '/signup',
 ];

// Errors, don't merge this with above
const ERRS = {
   Foo: 'foo',
   Bar: 'bar',
} as const;
```

### Functions
- camelCase in most situtations but for special exceptions like jsx elements can be PascalCase.
- Generally, you should name functions in a verb format: (i.e. don't say `name()` say `fetchName()` or an IO call).
- Simple functions as part of objects just meant to return constants don't necessarily need to be in a verb format. Example:
```typescript
const Errors = {
   SomeError: 'foo',
   EmailNotFound(email: string) {
      return `We're sorry, but a user with the email "${email}" was not found.`;
   },
} as const;

// Note: Errors in an immutable basic-object because we create it with an object-literal and make it immutable with 'as const'.
```
- Prepend helper functions (function declarations not meant to be used outside of their file) with an underscore (i.e. `function _helperFn() {}`).
- For functions that return data, use the `get` word for non-io data and fetch for IO data (i.e. `user.getFullName()` and `UserRepo.fetchUser()`).

### Objects
- Generally, objects initialized outside of functions and directly inside of files with object-literals should be immutable (i.e. an single large `export default {...etc}` inside of a Colors.ts file) and should be appended with `as const` so that they cannot be changed. As mentioned in the <b>Variables</b> section, simple static objects/arrays can be UPPER_SNAKE_CASE. However, large objects which are the `export default` of Declaration or Modular scripts should be PascalCase. 
- Inside of functions, just like all other variables use camelCase.
- Outside of functions, objects returned from function calls or constructors (not object-literals) should be camelCase. However, objects which represent hardcoded data-items (like `User.new('name', 'email')`) in a testing environment could be PascalCase instead.
```typescript
// **** UserRepo.ts **** //

function findById(id: number): Promise<IUser> {
  db.doStuff()...
}

function findByName(name: string): Promise<IUser> {
  db.doStuff()...
}

export default {
  findById,
  findByName,
} as const;


// **** UserService.ts **** //

// PascalCase
import UserRepo from './UserRepo.ts'; 

// UPPER_SNAKE_CASE
const ERRS = {
   Foo: 'foo',
   Bar: 'bar',
} as const;

function login() {
  ...do stuff
}

...
```


### Classes
- PascalCase for class names and static readonly variables (i.e. Dog.Species), and camelCase for instance-objects and class functions.  

### Enums
- Use PascalCase for the enum name and keys. (i.e. `enum NodeEnvs { Dev = 'development'}`)

### Types
- Prepend types with a 'T' (i.e. `type TMouseEvent = React.MouseEvent<HtmlButtonElement>;`) 

### Interfaces
- Used to define the key/value pairs in an object literal or the key/value pairs returned from an objects constructor.
- Prepend with an 'I' (i.e. `interface IUser { name: string; email: string; }`)


## Comments

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
- Separate the major sections of scripts (variables/types/run/functions,export default) by a `// **** "Section Name" **** //`.
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

- Don't put spaces within functions generally, but there can be exception like between HTML elements in React functions. Use `//` comments to separate chunks of logic within functions. Use one space with a `/** */` comment to separate functions.

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

## Imports
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


## Example of Script
- Now that we've gone over the main points, let's look at some example scripts.

- A modular script:
```typescript
// MailUtil.ts

import nodemailer, { SendMailOptions, Transporter } from 'nodemailer';


// **** Variables **** //

const SUPPORT_STAFF_EMAIL = 'do_not_reply@example.com';

let mailer; TTransport | null = null;


// **** Types **** //

type TTransport = Transporter<SMTPTransport.SentMessageInfo>;


// **** Run **** //

const transporter = nodemailer
 .createTransport({ ...settings })
 .transporter
 .verify((err, success) => {
   if (success) {
     mailer = transporter;
   }
 });
 

// **** Functions **** //

/**
 * Send an email anywhere.
 */
function sendMail(to: string, from: string, subject: string, body: string): Promise<void> {
   await mailer?.send({to, from, subject, body});
}

/**
 * Send an email to your application's support staff.
 */
function sendSupportStaffEmail(from, subject, body): Promise<void> {
   await mailer?.send({to: SUPPORT_STAFF_EMAIL, from, subject, body});
}


// **** Export default **** //

export default {
   sendMail,
   sendSupportStaffEmail,
}
```

- An inventory script
```.tsx
// shared-buttons.tsx

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


// **** Variables **** //

const app = express(); 


// **** Run **** //

app.use(middleware1);
app.use(middleware2);

doSomething();
doSomethingElse();


// **** Export default **** //

export default app;
```


## Misc Style (Don't need to mention things covered by the linter)
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

## Testing
Anything that changes based on user interaction should be unit-tested. All phases of development should include unit-tests. Developers should write their own unit-tests.- Integration tests should test any user interaction that involves talking to the back-end. Overkill for startups, should be done by a dedicated integration tester who's fluent with the framework in a separate repository. Makes code more readable. Errors in integration tests should be rare as unit-tests should weed out most of them.
