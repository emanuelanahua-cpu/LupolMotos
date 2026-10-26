export const parse = schema => (req, res, next) => {
  try {
    req.input = schema.parse(req.body);
    next();
  } catch (error) {
    if (error.errors && error.errors.length > 0) {
      const messages = error.errors.map(err => `${err.field}: ${err.message}`);
      return res.status(400).json({
        success: false,
        errors: messages
      });
    }
    return res.status(400).json({ success: false, error: 'Error de validación' });
  }
};
