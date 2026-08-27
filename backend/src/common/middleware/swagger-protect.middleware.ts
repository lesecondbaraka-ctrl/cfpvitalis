import { NextFunction, Request, Response } from 'express';

export function swaggerProtect(req: Request, res: Response, next: NextFunction) {
  const swaggerToken = process.env.SWAGGER_TOKEN;
  if (!swaggerToken) return next(); // no token configured, leave public (fallback)

  const provided = req.headers['x-swagger-token'];
  if (!provided) {
    res.status(403).send('Forbidden - Swagger protected. Header x-swagger-token requis.');
    return;
  }
  if (Array.isArray(provided)) {
    if (provided[0] !== swaggerToken) {
      res.status(403).send('Forbidden - Swagger protected');
      return;
    }
  } else if (provided !== swaggerToken) {
    res.status(403).send('Forbidden - Swagger protected');
    return;
  }
  next();
}
