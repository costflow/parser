import _ from "lodash";
_.templateSettings.interpolate = /{{([\s\S]+?)}}/g;

interface Variables {
  amount?: number | "";
  pre?: string;
}

export const compileFormula = (input: string | null, data: Variables) => {
  if (!input) return;
  const compiled = _.template(input);
  return compiled(data);
};
