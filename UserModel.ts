/**
 * This module is meant to handle User IO data items and demo proper naming 
 * conventions.
 */

/******************************************************************************
                              Constants
******************************************************************************/

// Because this is a "readonly" string primitive, we use "UPPER_SNAKE_CASE".
const INVALID_USER_ERROR = 'Not a valid user object';

// For "namespace" object-literals (i.e. "like the lookup table below") use 
// "PascalCase" for the variable name and "UPPER_SNAKE_CASE" for the keys. 
const UserRoles = {
  NONE: 0,
  BASIC: 1,
  ADMIN: 2,
} as const;

// Using a function so we always get fresh datetime objects. "GetDefaults" is
// "PascalCase" because its just meant to return a static object and not process
// any logic.
const GetDefaults = (): User => ({
  id: 0,
  name: '',
  role: UserRoles.NONE,
  created: new Date(),
});

/******************************************************************************
                                Types
******************************************************************************/

// "PascalCase" standard for type-aliases
type UserRoles = typeof UserRoles[keyof typeof UserRoles];

// "PascalCase" for types with acronyms in "ALL CAPS".
export type ISOString =
  `${number}-${number}-${number}T${number}:${number}:${number}.${number}Z`;

// "PascalCase" for utility-types
type ValueOf<T extends object> = T[keyof T];

// "PascalCase" for types. Prepending with an "I" to distinguish it from the 
// "User" namespace-object. `@entity "users"` means this describes the "users" database
// table

/**
 * @entity users
 */
interface User {
  id: number; // @PK
  name: string;
  role: UserRoles;
  createdAt: Date | ISOString; // @AC
}

/******************************************************************************
                                Functions
******************************************************************************/

/**
 * Because "new" is a built-in keyword, to create new "User" items, we pad the
 * name with "__". That way we can call "User.new()".
 */
function getNewUser(partial?: Partial<User>): User {
  // "camelCase" for variables declared in functions.
  const newUser = { ...GetDefaults(), ...partial };
  if (!isUser(newUser)) {
    throw new Error(INVALID_USER_ERROR);
  }
  return newUser;
}

/**
 * "camelCase" for standard function declarations. "prepending" with an "is" 
 * since this is a validator-function.
 */
function isUser(arg: unknown): arg is User {
  return (
    typeof arg === 'object' &&
    arg !== null &&
    'id' in arg && typeof arg.id === 'number' && 
    'name' in arg && typeof arg.name === 'string' && 
    'role' in arg && isValueOf(arg, UserRoles) &&
    'created' in arg && isValidDateOrISOString(arg)
  );
}

/**
 * Because these next two validator functions aren't specific to users they 
 * should probably go some kind of "src/utils/validators.ts" inventory-script
 * but I'm putting them here for demo purposes.
 */

/**
 * Follow convetions for generic-variable declaration which is typically 
 * just a single letter (i.e. "T").
 */
function isValueOf<T extends object>(
  value: unknown,
  obj: T
): value is ValueOf<T> {
  return Object.values(obj).includes(value as ValueOf<T>);
}

/**
 * "camelCase" for standard function declarations.
 */
function isValidDateOrISOString(
  value: unknown
): value is Date | ISOString {
  // Case 1: Date object
  if (value instanceof Date) {
    return !Number.isNaN(value.getTime());
  }
  // Case 2: ISO-string
  if (typeof value === "string") {
    const date = new Date(value);
    return (
      !Number.isNaN(date.getTime()) &&
      date.toISOString() === value
    );
  }
  // Return
  return false;
}

/******************************************************************************
                                  Export
******************************************************************************/

// We will import the User module as "User" in other files (i.e. "User.new()"")
export default {
  new: getNewUser,
  isUser,
} as const;
