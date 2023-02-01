# Typescript-Best-Practices
Patterns and Best Practices for procedural Typescript development follow the rule of 4 principle


## Files/Folder Organization

- 4 types of scripts (files)
 - Declaration
 - Modular
 - Inventory
 - Linear
 
- Organize file into 4 sections
 - Variables
 - Types
 - Setup
 - Functions
 
## Naming

- Files/Folders

- Variables
 - Static primitives should be declared at the top of files at the beginning of the "Variables" section and use UPPER_SNAKE_CASE.
 - Variables declared inside functions should be camel case
 - boolean values should start with an 'is' (i.e. session.isLoggedIn)
