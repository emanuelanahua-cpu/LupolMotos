export const parse = schema => (req, res, next) => {
  req.input = schema.parse(req.body);
  next();
};
