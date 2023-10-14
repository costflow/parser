export const PRESERVED_SYMBOLS = [
  "+",
  "-",
  ">",
  "|",
  "*",
  "!",
  "$",
  "@",
  "/",
  ";"
]

export const DIRECTIVES = [
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
  "transaction"
  // "set", // later: set account map?
]

export const DIRECTIVE_SHORTCUTS = {
  "//": "comment",
  ";": "comment",
  $: "snap",
  f: "formula",
  "!": "transaction",
  "*": "transaction"
}

export const DATE_SHORTCUTS = {
  dby: -2,
  ytd: -1,
  yesterday: -1,
  tmr: 1,
  tomorrow: 1,
  dat: 2
}
