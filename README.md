# Typescript-Best-Practices
Patterns and Best Practices for procedural Typescript development follow the rule of 4 principle


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
- Functions

### Script types explained 
- Declaration: exports one large declared item (i.e. a file called HttpStatusCodes.ts which exports a single enum containing all the http status codes.
- Modular: exports a single object containing a bunch of closely related functions (i.e. a file call UserRepo.ts which has a bunch of functions for handling database queries related to user objects).
- Inventory: for storing a large number of smaller declared items. (i.e. a file called types.ts which stores commonly shared types throughout your application)
- Linear: executes a series of commands (i.e. an file called setup-db.ts which executes a bunch of file system commands to initialize a database).
 
 
## Naming

### Files/Folders
- Folders: Generally use lowercase with hyphens. But can make exceptions for special situations (i.e. a folder in react holding Home.tsx, and Home.test.tsx could be uppercase `Home/`.
- Declaration scripts: file name should match declaration name. (i.e. if export default is `useSetState` file name should be `useSetState.ts`.
- Modular scripts: PascalCase.
- Inventory: lowercase with hyphens (shared-types.ts)
- Linear: lowercase with hyphens (setup-db.ts)

### Variables
- Static primitives should be declared at the top of files at the beginning of the "Variables" section and use UPPER_SNAKE_CASE (i.e. `const SALT_ROUNDS = 12`).
- Variables declared inside functions should be camelCase
- boolean values should start with an 'is' (i.e. session.isLoggedIn)

### Functions
- camelCase in almost all situations but for special exceptions like jsx elements can be PascalCase.
- use function declarations `function fnName()` for standalone functions so they can be hoisted and arrow functions `() => {}` for smaller functions declared inside of other functions.
- prepend helper functions (function declarations not meant to be used outside of their file) with an underscore (i.e. `function _helperFn() {}`)

### Objects
- Generally, objects created outside of functions should be immutable (i.e. an single large `export default {...etc}` inside of a Colors.ts file) and should be appended with `as const` so that they cannot be changed. Immutable objects and their keys and child keys should be PascalCase. This is useful for distinguishing dynamic and static data inside of functions.

### Enums
- Use PascalCase for the enum name and keys. (i.e. `enum NodeEnvs { Dev = 'development'}`)

### Types
- Prepend types with a 'T' (i.e. `type TMounseEvent = React.MouseEvent<HtmlButtonElement>;`) 

### Interfaces
- Prepend with an 'I' (i.e. `interface IUser { name: string; email: string; }`)


## Comments

- Use `/** Comment */` above each function declaration ALWAYS. This will help the eyes when scrolling through comments. Use `//` for comments inside of functions.

```typescript
/**
 * Method comments
 */
function foo() {
  const bar = (arg: string) => arg.trim(),
    blah = 'etc';
  // Return
  return (bar(arg) + bar(arg) + bar(arg));
}
```

- Separate the major sections of scripts (variables/types/setup/functions) by a `// **** "Section Name" **** //`. 


## Style
- Also wrap boolean statements in parenthesis to make them more readable (i.e `(((isFoo && isBar) || isBar) ? retThis : retThat)`
- Use optional chaining whenever possible. Don't do `foo && foo.bar` do `foo?.bar`.
- Use null coalescing `??` whenever possible. Don't do `(str || '') do `(str ?? '')`.

## Testing
Anything that changes based on user interaction should be unit-tested. All phases of development should include unit-tests. Developers should write their own unit-tests.- Integration tests should test any user interaction that involves talking to the back-end. Overkill for startups, should be done by a dedicated integration tester who's fluent with the framework in a separate repository. Makes code more readable. Errors in integration tests should be rare as unit-tests should weed out most of them.
