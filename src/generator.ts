import { NParseResult, UserConfig, AAC } from "./interface";

const fillBlank = (len: number): string => {
  let result = "";
  for (let i = 0; i < len; i++) {
    result += " ";
  }
  return result;
};

const generator = (
  input: NParseResult.Result | NParseResult.TransactionResult,
  mode: "beancount",
  config: Partial<UserConfig>
): string | NParseResult.Error => {
  if (mode !== "beancount") {
    return { error: "OUTPUT_MODE_NOT_SUPPORT_YET" };
  }

  const { indent = 2, lineLength = 60 } = config;

  let result: string = "";

  if (input.directive === "comment") {
    result += "; " + input.data;
  }

  if (
    input.directive === "open" ||
    input.directive === "close" ||
    input.directive === "commodity"
  ) {
    result += `${input.date} ${input.directive} ${input.data}`;
  }

  if (
    input.directive === "note" ||
    input.directive === "event" ||
    input.directive === "option" ||
    input.directive === "pad"
  ) {
    let key: string = Object.keys(input.data)[0];
    let value: string = input.data[key];
    key = input.directive === "pad" ? key : `"${key}"`;
    value = input.directive === "pad" ? value : `"${value}"`;
    result += `${input.date} ${input.directive} ${key} ${value}`;
  }

  if (input.directive === "price") {
    result += `${input.date} ${input.directive} ${input.data.from} ${input.data.rate} ${input.data.to}`;
  }

  if (input.directive === "balance") {
    const aac = input.data[0];
    result += `${input.date} ${input.directive} ${aac.account} ${aac.amount} ${aac.currency}`;
  }

  if (input.directive === "transaction") {
    result += `${input.date} ${input.completed ? "*" : "!"}`;
    result += ` "${input.payee || ""}"`;
    result += ` "${input.narration}"`;
    result += `${input.tags.length ? " #" : ""}${input.tags.join(" #")}`;
    result += `${input.links.length ? " ^" : ""}${input.links.join(" ^")}`;

    input.data.forEach((aac: AAC) => {
      result += "\n";
      result += fillBlank(indent);
      result += aac.account;
      result += fillBlank(
        lineLength -
          indent -
          aac.account.length -
          ((aac.amount > 0 ? "+" : "") + String(aac.amount.toFixed(2))).length -
          1 -
          aac.currency.length
      );

      result += aac.amount > 0 ? "+" : "";
      result += aac.amount.toFixed(2);
      result += " ";
      result += aac.currency;
    });
  }

  return result;
};

export { generator as generate };
