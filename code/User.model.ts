// ========================================================================= //
//                                   DOCS                                    //
// ========================================================================= //
// This module-object file is meant to handle User IO data items and demo
// proper naming conventions.

// ========================================================================= //
//                                 CONSTANTS                                 //
// ========================================================================= //

// Because this is a "readonly" string primitive, we use "UPPER_SNAKE_CASE".
const INVALID_USER_ERROR = 'Not a valid user object';

// For "namespace" object-literals (e.g. the lookup table below) use 
// "PascalCase" for the variable name and "UPPER_SNAKE_CASE" for the keys. 
const UserRoles = {
  NONE: 0,
  BASIC: 1,
  ADMIN: 2,
} as const;

// ========================================================================= //
//                                   TYPES                                   //
// ========================================================================= //

// "PascalCase" standard for type-aliases
type UserRoles = typeof UserRoles[keyof typeof UserRoles];

// "PascalCase" for types with acronyms in "ALL CAPS".
export type ISOString =
  `${number}-${number}-${number}T${number}:${number}:${number}.${number}Z`;

// "PascalCase" for utility-types
type ValueOf<T extends object> = T[keyof T];

/**
 * @entity users
 *
 * Note: prepending with `I` to distinguish the data-item from the "User" 
 * module-object. `@entity` lets us know it's a database table.
 */
interface IUser {
  id: number; // @PK
  name: string;
  role: UserRoles;
  createdAt: Date | ISOString; // @AC
}

// ========================================================================= //
//                                 FUNCTIONS                                 //
// ========================================================================= //

/**
 * `create` is a common factory-function name when creating from another object 
 * with known parameters.
 */
function create(partial?: Partial<IUser>): IUser {
  return { ...of(), ...partial };
}

/**
 * `of` is a common factory-function name when creating an instance from
 * one or more parameters.
 */
function of(name?: string, role?: UserRoles, createdAt?: Date | ISOString): IUser {
  return {
    id: 0, // @PK is assigned by the database on insert
    name: name ?? '--',
    role: role ?? UserRoles.NONE,
    createdAt: createdAt ? new Date(createdAt) : new Date(),
  };
}

/**
 * `from` is a common factory-function name when converting from another
 * object.
 */
function from(param: unknown): IUser {
  if (!is(param)) {
    throw new Error(INVALID_USER_ERROR);
  }
  return create(param);
}

/**
 * "camelCase" for standard function declarations. "prepending" with an "is" 
 * since this is a validator-function.
 */
function is(arg: unknown): arg is IUser {
  return (
    typeof arg === 'object' &&
    arg !== null &&
    'id' in arg && typeof arg.id === 'number' && 
    'name' in arg && typeof arg.name === 'string' && 
    'role' in arg && isValueOf(arg.role, UserRoles) &&
    'createdAt' in arg && isValidDateOrISOString(arg.createdAt)
  );
}

/**
 * Because these next two validator functions aren't specific to users they 
 * should probably go in some kind of "src/utils/validators.ts" inventory-file
 * but I'm putting them here for demo purposes.
 */

/**
 * Follow conventions for generic-variable declaration which is typically 
 * just a single letter (e.g. "T").
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

// ========================================================================= //
//                                  EXPORT                                   //
// ========================================================================= //

// We will import the User module-object as "User" in other files
// (e.g. import User from '@src/domains/users/User.model' and "User.create()")
export default {
  create,
  of,
  from,
  is,
} as const;
