// ---- Misc
type Primitive = string | number | boolean | bigint | symbol | null | undefined;

// ---- Plain Data Object
// `bigint` and `symbol` are excluded: `JSON.stringify()` throws on `bigint` and
// drops `symbol`. `undefined` is allowed for optional keys but is also dropped.
type PlainDataPrimitive = Exclude<Primitive, bigint | symbol>;
type PlainDataArray = (PlainDataPrimitive | Date | PlainDataObject | PlainDataArray)[];
type PlainDataObject = {
  [key: string]: PlainDataPrimitive | Date | PlainDataObject | PlainDataArray;
};
