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
- Modular: exports a single object containing a bunch of closely related functions (i.e. a file call UserRepo.ts which has a bunch of functions for handling database queries related to user objects).
- Inventory: for storing a large number of smaller declared items. (i.e. a file called types.ts which stores commonly shared types throughout your application)
- Linear: executes a series of commands (i.e. an file called setup-db.ts which executes a bunch of file system commands to initialize a database).


## Data Types
- Primitives, Functions, Objects, and Classes
- Functions are technicaly objects but are also callable and Classes are syntax sugar for using functions with `new`, but for all practical purposes we'll consider these our four datatypes cause of how we use them.

### Primitives
- null, undefined, boolean, number, string. Boolean(), Number(), String() are object counter parts used during coercian.

### Functions
- There are function declarations with `function fnName()` and arrow functions with `const () => {}`.

### Objects
- Anything with key/value pairs is technically an object. However, we'll use the term `basic-object` to refer to an object returned from an object-literal or serialzed from somewhere (i.e. JSON.parse()) since they are just instances of the `Object()` class. 

### Classes
- Use these for managing data that has both dynamic and static properties (i.e. a Dog object returned from a database query that has both `name` and `Species` properties). Don't use classes for your application layers as an immutable basic-object itself is usually sufficient. Always protect your class with an interface. It's not typically necesasary to instantiate your classes when working with dynamic data, as a basic-object represented by the class's interface can usually suffice. For example, if an ORM returns a basic-object with all the key/value pairs for user (even if it's not an `instanceof` User) often times that's good enough and we don't need to call `new User()` to work with the data. Conversely, many times even an interface itself is enough and we don't even need create a class for the data if all the values are dynamic (i.e a user object whose only props are id, name, email).
 
 
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
- Use function declarations `function fnName()` for standalone functions so they can be hoisted and arrow functions `() => {}` for smaller functions declared inside of other functions.
- Prepend helper functions (function declarations not meant to be used outside of their file) with an underscore (i.e. `function _helperFn() {}`)

### Objects
- Generally, objects initialized outside of functions and directly inside of files with object-literals should be immutable (i.e. an single large `export default {...etc}` inside of a Colors.ts file) and should be appended with `as const` so that they cannot be changed. Immutable objects and their keys and child keys should be PascalCase. This is useful for distinguishing dynamic and static data inside of functions.
- Objects instantiated from classes or function calls should be pascalCase.

### Classes
- PascalCase for class names, static members (vars and functions), and camelCase for instance-object variables and dynamic members.  

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

## Misc Style
- Use a semicolon at the end of statements. 
- Wrap boolean statements in parenthesis to make them more readable (i.e `(((isFoo && isBar) || isBar) ? retThis : retThat)`
- Use optional chaining whenever possible. Don't do `foo && foo.bar` do `foo?.bar`.
- Use null coalescing `??` whenever possible. Don't do `(str || '') do `(str ?? '')`.
- Specify a return type if you are using the function elsewhere in your code. However, always specifying a return type when your function is just getting passed to a library could be overkill (i.e. a router function passed to an express route). Another exception could be JSX function where it's obvious a JSX.Elements is what's getting returned.

## Testing
Anything that changes based on user interaction should be unit-tested. All phases of development should include unit-tests. Developers should write their own unit-tests.- Integration tests should test any user interaction that involves talking to the back-end. Overkill for startups, should be done by a dedicated integration tester who's fluent with the framework in a separate repository. Makes code more readable. Errors in integration tests should be rare as unit-tests should weed out most of them.
