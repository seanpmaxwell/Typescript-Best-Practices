# Typescript-Best-Practices
Patterns and Best Practices for procedural Typescript/JavaScript development following the rule of 4 principle


## Files/Folder Organization

### 4 types of scripts (files)
- Declaration
- Modular
- Inventory
- Linear
 
### Organize file into 4 sections
- Variables
- Types
- Setup
- Functions (or Class)
<br/>Note that your file may not have all of these sections

### Script types explained 
- Declaration: exports one large declared item (i.e. a file called HttpStatusCodes.ts which exports a single enum containing all the http status codes.
- Modular: export default is an `object-literal` containing a bunch of closely related functions/variables (i.e. a file call UserRepo.ts which has a bunch of functions for handling database queries related to user objects).
- Inventory: for storing a large number of smaller declared items. (i.e. a file called types.ts which stores commonly shared types throughout your application)
- Linear: executes a series of commands (i.e. an file called setup-db.ts which executes a bunch of file system commands to initialize a database).


## Data Types
- Primitives, Functions, Objects, and Classes
- Functions are technicaly objects but are also callable and Classes are syntax sugar for using functions with `new`, but for all practical purposes we'll consider these our four datatypes cause of how we use them.

### Primitives
- null, undefined, boolean, number, string. Boolean(), Number(), String() are object counter parts used during coercian.

### Functions
- There are function declarations with `function fnName()` and arrow functions with `() => {}`. Function-declarations should be used directly in files, so they can be hoisted, and arrow functions should be used when creating functions inside of functions and jsx-elements.

### Objects
- Anything with key/value pairs is technically an object. However, we'll use the term `basic-object` to refer to an object returned from an object-literal or serialzed from somewhere (i.e. JSON.parse()) since they are just instances of the `Object()` class. Also note that in Javascript we can append as many properties as we want to a basic-object but in Typescript the keys are static once the object is instantiated, although the values can change unless we make it immutable. 

### Classes
- Classes are not really necessary anymore. The trend in javascript is to move away from classes and now use procedural/functional programming. Keep in mind that because of IO, certain features of classes could become available. For example, if `User` is a class, with properties (like `name` and `email`) and functions (like `toString()`) and we call `const john = new User()` and send that `john` variable through an IO request (like an api), `name` and `email` will be all that gets sent. Accordingly, on the receiving end (assuming it's still JavaScript) neither the functions nor the `_proto_` property are sent so `john instanceof User` and `john.toString()` won't work. We would have to call `new User(john)` again. Also keep in mind, for large projects it could get confusing as to whether the `john` variable somewhere is simply a basic-object or an actual instance of the User class. To avoid the overhead/confusion of working with classes, having a module-counterpart for data items described by an interface is usually a better alternative. 
- Modules are generally good enough to replace static functions. For dynamic-functions remember that `this` can be passed as the first param to a function and refers to the containing object.
```
// The User module in the User.ts 

interface IUser {
 name: string;
 email: string;
 toString: () => string;
}


// **** Functions **** //

/**
 * Create new user.
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
 * Convert object to a string.
 */
function toString(this: IUser): string {
  return (this.name + '' + this.email);
}

// OR as an alterative to above

function toStringAlt(user: IUser): string {
  return (user.name + ' ' + user.email);
}


// **** Export default **** //

export default {
  new: new_,
  from,
  toStringAlt,
} as const;
```
 
 
## Naming

### Files/Folders
- Folders: Generally use lowercase with hyphens. But can make exceptions for special situations (i.e. a folder in react holding Home.tsx, and Home.test.tsx could be uppercase `Home/`.
- Declaration scripts: file name should match declaration name. (i.e. if export default is `useSetState` file name should be `useSetState.ts`.
- Modular scripts: PascalCase.
- Inventory: lowercase with hyphens (shared-types.ts)
- Linear: lowercase with hyphens (setup-db.ts)
- Folders not meant to be committed as part of the final code, but may exists along other source folders, (i.e. a test folder) should start and end with a double underscore `__test-helpers__`

### Variables
- Static primitives should be declared at the top of files at the beginning of the "Variables" section and use UPPER_SNAKE_CASE (i.e. `const SALT_ROUNDS = 12`).
- Variables declared inside functions should be camelCase
- Boolean values should generally start with an 'is' (i.e. session.isLoggedIn)
- Use `one-var-scope` declarations for a group of closely related variables. This actually leads to a slight increase in performance during minification. DONT overuse it though. Keep only the closely related stuff together.
```typescript
// One block
const FOO_BAR = 'asdf',
 BLAH = 12,
 SOMETHING = 'asdf';

// Errors, don't merge this with above
const Errs = {
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
- Generally, objects initialized outside of functions and directly inside of files with object-literals should be immutable (i.e. an single large `export default {...etc}` inside of a Colors.ts file) and should be appended with `as const` so that they cannot be changed. Immutable objects and their keys and child keys should be PascalCase. This is useful for distinguishing dynamic and static data inside of functions.
- Most of the time, outside of functions, objects instantiated function calls or constructors (not object-literals) should be pascalCase. However, objects which represent data items like `new User()` could be CamelCase instead.
```typescript
// Login.test.tsx

// Data item object
const LocalUser1 = new User('asd', 'adsf');

// Non data-item object
const testerLib = new TestRunner();

testerLib.execute(...);

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
- Separate the major sections of scripts (variables/types/setup/functions,export default) by a `// **** "Section Name" **** //`.


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


// **** Setup **** //

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
```typescript
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


// **** Setup **** //

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


## Testing
Anything that changes based on user interaction should be unit-tested. All phases of development should include unit-tests. Developers should write their own unit-tests.- Integration tests should test any user interaction that involves talking to the back-end. Overkill for startups, should be done by a dedicated integration tester who's fluent with the framework in a separate repository. Makes code more readable. Errors in integration tests should be rare as unit-tests should weed out most of them.
