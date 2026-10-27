export const parse = schema => (req, res, next) => {
  try {req.input = schema.parse(req.body);next();}
  catch (error) {next(error);}
};
