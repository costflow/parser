import dayjs from "dayjs";

const fillBlank = (len) => {
  let result = "";
  for (let i = 0; i < len; i++) {
    result += " ";
  }
  return result;
};

const generator = (input, mode, config) => {
  if (mode !== "beancount") {
    return { error: "OUTPUT_MODE_NOT_SUPPORT" };
  }

  const { indent = 2, lineLength = 60 } = config;

  let result = "";

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
    let key = Object.keys(input.data)[0];
    let value = input.data[key];
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
    let transaction = input;
    result += `${transaction.date} ${transaction.completed ? "*" : "!"}`;
    result += ` "${transaction.payee || ""}"`;
    result += ` "${transaction.narration}"`;
    result += `${transaction.tags.length ? " #" : ""}${transaction.tags.join(
      " #"
    )}`;
    result += `${transaction.links.length ? " ^" : ""}${transaction.links.join(
      " ^"
    )}`;

    if (config.insertTime === "metadata") {
      result += "\n";
      result += fillBlank(indent);
      const now = config.timezone
        ? dayjs(new Date(transaction.created_at)).tz(config.timezone)
        : dayjs(new Date(transaction.created_at));
      let dateTime = "";
      if (transaction.date !== now.format("YYYY-MM-DD")) {
        dateTime += now.format("YYYY-MM-DD HH:mm:ss");
      } else {
        dateTime += now.format("HH:mm:ss");
      }

      result += `time: "${dateTime}"`;
    }

    transaction.data.forEach((aac) => {
      result += "\n";
      result += fillBlank(indent);
      result += aac.account;
      let blanks =
        lineLength -
        indent -
        (aac.account ? aac.account.length : 0) -
        ((aac.amount > 0 ? "+" : "") + String(aac.amount.toFixed(2))).length -
        1 -
        aac.currency.length;

      blanks = blanks > 0 ? blanks : 1;
      result += fillBlank(blanks);

      result += aac.amount > 0 ? "+" : "";
      result += aac.amount.toFixed(2);
      result += " ";
      result += aac.currency;
    });
  }

  return result;
};

export { generator as generate };
