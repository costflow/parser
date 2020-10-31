import _ from "lodash";
_.templateSettings.interpolate = /{{([\s\S]+?)}}/g;

interface Variables {
  amount?: number | "";
  pre?: string;
}

const render = (input: string, data: Variables) => {
  const compiled = _.template(input);
  return compiled(data);
};

export default {
  render,
};
