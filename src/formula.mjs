import _ from "lodash";
_.templateSettings.interpolate = /{{([\s\S]+?)}}/g;

export const compileFormula = (input, data) => {
  if (!input) return;
  const compiled = _.template(input);
  return compiled(data);
};
