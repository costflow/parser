export const PRESERVED_SYMBOLS: string[] = [
  "+",
  "-",
  ">",
  "|",
  "*",
  "!",
  "$",
  "@",
  "/",
  ";",
];

export const DIRECTIVES: string[] = [
  "open",
  "close",
  "comment",
  "commodity",
  "formula",
  "option",
  "event",
  "note",
  "price",
  "snap",
  "pad",
  "balance",
  "transaction",
  "set", // set accountMaps
];

export const DIRECTIVE_SHORTCUTS: Record<string, string> = {
  "//": "comment",
  ";": "comment",
  $: "snap",
  f: "formula",
  "!": "transaction",
  "*": "transaction",
};

export const DATE_SHORTCUTS: Record<string, number> = {
  dby: -2,
  ytd: -1,
  yesterday: -1,
  tmr: 1,
  tomorrow: 1,
  dat: 2,
};
