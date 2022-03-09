import { validationResult } from "express-validator";

export const validateRouteRequest = (req: any, res: any, next: any): any => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).send({ errors: errors.array() });
  }
  next();
};
