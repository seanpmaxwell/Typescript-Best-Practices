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
      - [Dependency Injection](#dependency-injection)
      - [IO](#io)
      - [When to use Classes](#when-to-use-classes)
      - [Classes Summary](#classes-summary)
    - [Enums](#enums)
  - [Types](#types)
- [Naming](#naming)
  - [Files/Folders](#files-folders)
  - [Variables](#variables)
  - [Functions](#naming-functions)
  - [Objects](#naming-objects)
  - [Classes](#naming-classes)
  - [Enums](#naming-enums)
  - [Type Aliases](#naming-types)
  - [Interfaces](#naming-interfaces)
- [Comments](#comments)
- [Imports](#imports)
- [Example Scripts](#example-scripts)
- [Misc Style](#misc-style)
- [Testing](#testing)
<br/>


## 4 "Fundamental" Features <a name="4-fundamental-features"></a>
- `Primitives`, `Functions`, `Objects`, and `Types`
- <b>Primitives</b> - 5 original: `null`, `undefined`, `boolean`, `number`, `string`. Two new ones `symbol` and `bigint`. 
- <b>Functions</b> - 4 ways to create functions: function-declarations `function functionName() {}`, arrow-functions `() => {}`, placing them directly in object-literals (not counting arrows), and directly inside classes (not counting arrows).
- <b>Objects</b> - 3 ways to create objects: object-literals, calling functions with `new` (old), and classes (new).
- <b>Types</b> - 2 main ways to create types: types-aliases (`type`) and interfaces (`interface`). Note: there's also function overloading for function-declarations. 
- Note: Functions are technically objects too but for all practical purposes we'll consider them separate.
<br/>


## 4 types of scripts <a name="4-types-of-scripts"></a>
- <b>Declaration</b>: exports one large declared item (i.e. a file called HttpStatusCodes.ts which exports a single enum containing all the http status codes.
- <b>Modular</b>: In JavaScript, module is another term for file, so if we use a single object to represent the items available from that file, we'll call it a modular-script. The export default is an `object-literal` containing a bunch of closely related functions/variables (i.e. a file call UserRepo.ts which has a bunch of functions for handling database queries related to user objects, we refer to it as the _UserRepo_ module).
- <b>Inventory</b>: for storing a large number of smaller declared items. (i.e. a file called types.ts which stores commonly shared types throughout your application)
- <b>Linear</b>: executes a series of commands (i.e. a file called `setup-db.ts` which does a bunch of system commands to initialize a database).
<br/>


## Script (file) Organization <a name="script-organization"></a>
- Because of how hoisting works in JavaScript, you should organize a file into these regions. Note that your file may not (and usually won't) have all of them:
  - Variables
  - Types
  - Run (Special Note: execute any logic that you need to here. Outside of linear scripts you usually shouldn't need this region, but if you do keep it short).
  - Functions
  - Classes (only very small ones, large classes should go in a separate file).
- Some special notes about organization:
  - Only constant/readonly variables (primitive and object values) should go directly in files in the `Variables` region (except maybe in linear scripts).
  - If you are writing a linear script, it might make more sense to group your code by the task they are doing instead of by the fundamental-feature. Still, if you decide to create some function-declarations in the same script, place your function-declarations in another region at the bottom of the file below the <b>Run</b>.
  - Always put the `export default` at the very bottom of every file. This makes your default export easier to keep track of and apply any wrappers it may need.
- Organzation overview
  - Project (application or library)
  - Directory
  - File (aka module)
  - Region
  - Section
<br/>


## 4 fundamental features in detail and when/how you should use them. <a name="4-fundamental-features-in-detail"></a>

### Primitives <a name="primitives"></a>
- To repeat: the 5 original are: `null`, `undefined`, `boolean`, `number`, `string` and the two new ones added recently are `symbol` and `bigint`.
- `symbol` is not nearly as prevalent as the others but is useful for creating unique keys on objects used in libraries. Since libraries in objects are passed around a lot, with symbols we don't have to worry about our key/value pairs getting overridden. 
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
- Functions can be be placed directly in object literals. I usually do it this way for longer multi-line functions but will use an arrow function for short functions. Note that for `direct-in-object-literal` functions The `this` keyword will refer to properties on the containing object. Although if you need to use the `this` keyword you should probably be using a class instead, see the classes section on when to use classes vs object-literals.
```
const objLiteral = {
  helloPre: 'hello ',
  sayHello(name: string) {
    console.log(this.helloPre + name);
  },
  sayHelloAlt: (name: string) + console.log(...) // Can also use an arrow function but the `this` keyword won't refer to the parent-object literal. 
}
```
- You can create functions inside of classes which allows you to do access modifiers:
```
class Dog {
  public barkAlt: () => console.log() // Like with-object literals can also do arrow-functions.
  public bark() {
    console.log('woof woof');
  }
}
```

### Objects (basic-objects, object-literals, classes, and enums) <a name="objects"></a>
- _Objects_ are just lists of key/value pairs and they all inherit from the parent `Object` class. We'll use the term <b>basic-object</b> to refer to objects which inherit directly from this class and no other.
- `object-literals`, `classes`, and `enums` are templates for initializing objects in TypeScript/JavaScript (although enums only exist in TypeScript). The third way (in old-school JavaScript) would be to call function with `new` but this is considered obsolete next to classes and leads to more complex code when doing inheritance. `instance-objects` are objects created from classes or calling functions with `new`. 
- Just to point out, symbols have single key/value pair and functions also have key/values pairs and inherit from the `Function` class which in turn inherits from the `Object` class. Due to how we use these features though, we'll consider objects, functions, and symbols separate datatypes. Also note that in Javascript objects are dynamic (we can append as many properties as we want) but in Typescript the keys are static by default once the object is instantiated.

#### Object-literals <a name="object-literals"></a>
- `object-literals` are a what's created from doing key/value pairs lists with curly-braces (ie `{ name: 'john' }`) and are a convenient, shorthand way of creating basic-objects. They make it easy to both organize code and pass data around.
- When we use `export default { func1, func2, etc} as const` at the bottom of modular-script, we are essentially using object-literals to organize our code.
- We should use object-literals over classes for organizing code for reasons mentioned in the next section. 

#### Classes <a name="classes"></a>
- **Overview:** The trend in JavaScript nowadays is to move away from classes to organize our code and switch to procedural/functional programming. This means the backbone of our applications are simpler and we don't have to worry about <b>dependency-injection</b>. Also, another situation where it may be a good idea to avoid classes is when working with IO data. There are some scenarios however where it could still make sense to use classes and we'll cover them.
- **Dependency-Injection:** <a name="dependency-injection"></a> Dependency-injection is what we mean when we're trying to use the same instance of an object in several places. If we use classes for organizing the backbone of our code (such as is the case in strictly object-oriented languages like Java), then we need to make sure we use the same instance of that class everywhere. Otherwise, we end up creating unnecessary instances or the internal state between the different instances could get out of sync. To avoid this using classes, we'd have to go through the hassle of marking every function `public static` and using it directly on the class itself OR make sure to instantiate the class before we export it (i.e. `export default new UserServiceLayer()`).
- **I/O Data:** <a name="io"></a> Using classes for IO calls could get a little messy. Reason for this is when retrieving objects from an IO call, our key/value pairs are what gets transferred in an IO call, but not the functions themselves. In order to use the functions we'd have to pass all our data-instances through a constructor or declare the functions static and use them directly from our Class (i.e. do `public static toString()` in the `User` class and call User.toString("some data item") or call `new User()` for every data item). It'd be better just to leave the data-item as a basic-object and describe it with an `interface`. If you need static-values and/or functions specific for that data-item, just wrap them in a readonly object-literal (append with `as const`).<br/>
What I usually do is a create a modular-script for that data item (i.e. User.ts) and in there I'll have the interface  and an `export default`, which is an object-literal that holds all the functions related to it (i.e. `new()` and `isValid()`). I like my data to just "be" things not "do" things.<br/>
Using a modular-script to handle data:
```
import User, { IUser } from 'models/User';

async function foo(): Promise<void> {
  const resp = await someIoCall();
  if (User.isValid(resp.data)) {
     const user: IUser = resp.data;
     ...some other stuff
  }
}
```
- **When to use classes** <a name="when-to-use-classes"></a> Suppose there's a situation where you have some non-IO dynamic-data and functions closely tied together and you want to call functions specifically for that data (i.e. a data-structure). For example, take the `new Map()` object. It has it's own internal state which is a group of key value pairs, and it provides you with all kinds of handy functions `get(), set(), keys(), length etc` to update and access the key/value pairs. It'd be pretty inconvenient (and possibly dangerous if the state is external) to constantly have to do `const mapData = Map.new(); Map.set(mapData, 'key', 'value'), Map.get(mapData, 'key');`.

**Classes Summary** <a name="classes-summary"></a>
- When to use classes:
  - Data-Structures
  - Whenever you have a set on no IO data initialized multiple times tightly couple with some functions (you feel tempted to use the `new` keyword). 
- When not use classes:
  - Organizing code
  - IO data

#### Enums <a name="enums"></a>
Enums are somewhat controversial, I've heard a lot of developers say they do and don't like them. I like enums because they can save use code because when we use them as a type. When we do the type for that variable will be restricted to any value on that enum. We can also use an enum's value to index that enum and get the string value of the key. I'll leave it to you to decide whether to use them or not.
```typescript
enum Scopes {
  Public,
  Private
}

function printScope(scope: Scopes) {
  console.log(Scopes[scope]); // => "Public" or "Private"
}
```


### Types (type-aliases and interfaces) <a name="types"></a>
- Use interfaces (`interface`) by default for describing simple structured key/value pair lists. Note that interfaces can be used to describe objects and classes. 
- Use type-aliases (`type`) for everything else.
<br/>


## Naming <a name="naming"></a>

### Files/Folders <a name="files-folders"></a>
- Folders: Generally use lowercase with hyphens. But can make exceptions for special situations (i.e. a folder in react holding Home.tsx, and Home.test.tsx could be uppercase `Home/`.
- Declaration scripts: file name should match declaration name. (i.e. if export default is `useSetState` file name should be `useSetState.ts`.
- Modular scripts: PascalCase.
- Inventory: lowercase with hyphens (shared-types.ts)
- Linear: lowercase with hyphens (setup-db.ts)
- Folders not meant to be committed as part of the final code, but may exists along other source folders, (i.e. a test folder) should start and end with a double underscore `__test-helpers__`

### Variables <a name="variables"></a>
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

### Functions <a name="naming-functions"></a>
- camelCase in most situtations but for special exceptions like jsx elements can be PascalCase.
- Generally, you should name functions in a verb format: (i.e. don't say `name()` say `fetchName()` for an IO call).
- Simple functions as part of object-literals just meant to return constants don't necessarily need to be in a verb format. Example:
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

### Objects <a name="naming-objects"></a>
- Generally, objects initialized outside of functions and directly inside of files with object-literals should be immutable (i.e. an single large `export default {...etc}` inside of a Colors.ts file) and should be appended with `as const` so that they cannot be changed. As mentioned in the <b>Variables</b> section, simple static objects/arrays can be UPPER_SNAKE_CASE. However, large objects which are the `export default` of Declaration or Modular scripts should be PascalCase. 
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

### Types Aliases <a name="naming-types"></a>
- Prepend type aliases with a 'T' (i.e. `type TMouseEvent = React.MouseEvent<HtmlButtonElement>;`)

### Interfaces <a name="naming-interfaces"></a>
- Prepend with an 'I' (i.e. `interface IUser { name: string; email: string; }`)
<br/>


## Comments <a name="comments"></a>
- Seprate files into region as follows (although this could be overkill for files with only one region, use your own discretion):
```ts
/******************************************************************************
                                RegionName (i.e. Variables)
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

- A modular script:
```typescript
// MailUtil.ts

import nodemailer, { SendMailOptions, Transporter } from 'nodemailer';


/******************************************************************************
                               Variables
******************************************************************************/

const SUPPORT_STAFF_EMAIL = 'do_not_reply@example.com';

let mailer; TTransport | null = null;


/******************************************************************************
                               Types
******************************************************************************/

type TTransport = Transporter<SMTPTransport.SentMessageInfo>;


/******************************************************************************
                               Run (Setup)
******************************************************************************/

const transporter = nodemailer
 .createTransport({ ...settings })
 .transporter
 .verify((err, success) => {
   if (success) {
     mailer = transporter;
   }
 });
 

/******************************************************************************
                               Functions
******************************************************************************/

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


/******************************************************************************
                               Export default
******************************************************************************/

export default {
   sendMail,
   sendSupportStaffEmail,
}
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
                                  Variables
******************************************************************************/

const app = express(); 


/******************************************************************************
                                 Run (Setup)
******************************************************************************/

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
- Anything that changes based on user interaction should be unit-tested.
- All phases of development should include unit-tests.
- Developers should write their own unit-tests.
- Integration tests should test any user interaction that involves talking to the back-end.
- Integration tests may be overkill for startups especially in the early stages.
- Integration tests should be done by a dedicated integration tester who's fluent with the framework in a separate repository.
- Another good reasons for tests are they make code more readable.
- Errors in integration tests should be rare as unit-tests should weed out most of them.
