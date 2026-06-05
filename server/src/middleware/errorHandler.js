export function notFound(_req, res) {
  res.status(404).json({ message: 'Route not found' });
}

export function errorHandler(error, _req, res, _next) {
  console.error(error);

  if (error?.name === 'ZodError') {
    return res.status(400).json({
      message: 'Validation failed',
      errors: error.errors.map((issue) => ({ path: issue.path.join('.'), message: issue.message }))
    });
  }

  if (error?.code === 11000) {
    return res.status(409).json({ message: 'Duplicate record', fields: error.keyValue });
  }

  res.status(error.status || 500).json({ message: error.message || 'Internal server error' });
}
