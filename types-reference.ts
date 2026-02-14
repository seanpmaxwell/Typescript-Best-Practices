// -- Misc -- //
type Primitive = string | number | boolean | bigint | symbol | null | undefined;


// -- Plain Data Object -- //

type PlainDataArray = (Primitive | Date | PlainDataObject  | PlainDataArray)[];

type PlainDataObject = {
  [key: string]: Primitive | Date | PlainDataObject | PlainDataArray;
};
