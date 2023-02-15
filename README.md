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
- Use these for managing objects that are generally instantiated many times throughout your application, and have both dynamic and static (that includes functions) properties. For example, `Promise` is a class cause we often make many promises when handling IO calls, and it has dynamic properties like `state` and `result` and functions like `all()` and `resolve()`. Another example, `jet-logger` (the logging tool that I use in NodeJS) is just a function that returns a basic-object because the logger it creates, while can theoretically be instantiated many times, is generally instantiated once and shared throughout the entire application.
- For IO data which has no functions or static properties, usually a basic-object + interface is enough to manage the item (i.e. a user record whose only properties are id, name, and email).
- Do not use classes for the layers of your application as they are typically not typically instatiated multiple times (i.e. UserRepo.ts module that stores functions for making db calls)
- If you do end up making a class for a database record, it's not typically necesasary to make a constructor call (instantiate) for your classes when working with IO data, as a basic-object represented by the class's interface can usually suffice. For example, if an ORM returns a basic-object with all the key/value pairs for user (even if it's not an `instanceof` User) often times that's good enough and we don't need to call `new User()` to work with the data.
- Because Typescript classes do not allow for multiple constructors, I usually make a constructor for the classes individual properties and a static `.from()` function to return the class's instance from an object in place of a copy constructor. Note that the param could be an instance of the class or just a basic object with all the required key/value pairs.
```
interface IUser {
 name: string;
 email: string;
}

class User implements IUser {

  public name: string;
  public email: string;

  /**
   * Constructor()
   */
  constructor(name: string, email?: string) {
    this.name = name;
    this.email = (email ?? '');
  }

  /**
   * Get user instance from object.
   */
  public static from(param: object): User {
    const p = param as IUser;
    return new User(p.name, p.email);
  }
}
```
- This should be standard practice whenever making a new class.
 
 
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

### Functions
- camelCase in most situtations but for special exceptions like jsx elements can be PascalCase.
- Name functions in a verb format: (i.e. don't say `name()` say `fetchName()`).
- Simple functions as part of objects just meant to return constants (but we use a function to insert a value) can also be PascalCase and don't necessarily need to be in a verb format. Example:
```
const Errors = {
   SomeError: 'foo',
   EmailNotFound(email: string) {
      return `We're sorry, but a user with the email "${email}" was not found.`;
   },
} as const;

// Note: Errors in an immutable basic-object because we create it with an object-literal and make it immutable with 'as const'.
```
- Prepend helper functions (function declarations not meant to be used outside of their file) with an underscore (i.e. `function _helperFn() {}`)

### Objects
- Generally, objects initialized outside of functions and directly inside of files with object-literals should be immutable (i.e. an single large `export default {...etc}` inside of a Colors.ts file) and should be appended with `as const` so that they cannot be changed. Immutable objects and their keys and child keys should be PascalCase. This is useful for distinguishing dynamic and static data inside of functions.
- Objects instantiated from classes or function calls should be pascalCase.

### Classes
- PascalCase for class names and static readonly variables (i.e. Dog.Species), and camelCase for instance-objects and class functions.  

### Enums
- Use PascalCase for the enum name and keys. (i.e. `enum NodeEnvs { Dev = 'development'}`)

### Types
- Prepend types with a 'T' (i.e. `type TMounseEvent = React.MouseEvent<HtmlButtonElement>;`) 

### Interfaces
- Used to define the key/value pairs in an object literal or the key/value pairs returned from an objects constructor.
- Prepend with an 'I' (i.e. `interface IUser { name: string; email: string; }`)


## Comments

- Use `/** Comment */` above each function declaration ALWAYS. This will help the eyes when scrolling through large files. 
- Use `//` for comments inside of functions.

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
```
import express from 'express';
import insertUrlParams from 'inserturlparams';

import UserRepo from '@src/repos/UserRepo';
import DogRepo from '@src/repos/DogRepo';

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


## Testing
Anything that changes based on user interaction should be unit-tested. All phases of development should include unit-tests. Developers should write their own unit-tests.- Integration tests should test any user interaction that involves talking to the back-end. Overkill for startups, should be done by a dedicated integration tester who's fluent with the framework in a separate repository. Makes code more readable. Errors in integration tests should be rare as unit-tests should weed out most of them.
