import _ from "lodash";
_.templateSettings.interpolate = /{{([\s\S]+?)}}/g;

interface Variables {
  amount?: number | "";
  pre?: string;
}

export const compileFormula = (input: string, data: Variables) => {
  const compiled = _.template(input);
  return compiled(data);
};
