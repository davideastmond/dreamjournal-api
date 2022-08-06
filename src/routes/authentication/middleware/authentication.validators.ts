import { body } from "express-validator";

export const registrationValidator = (): any[] => {
  return [
    body("email").not().isEmpty().isEmail().trim().escape(),
    body("password").not().isEmpty(),
    body("firstName").not().isEmpty().trim().escape(),
    body("lastName").not().isEmpty().trim().escape(),
    body("dateOfBirth").not().isEmpty(),
  ];
};

export const loginAuthenticationValidator = (): any[] => {
  return [
    body("email").not().isEmpty().trim().escape(),
    body("password").not().isEmpty(),
  ];
};

export const TFAVerifyValidator = (): any[] => {
  return [
    body("userId").exists().not().isEmpty(),
    body("authCode").exists().not().isEmpty(),
    body("tfaToken").exists().not().isEmpty(),
    body("isEnrolling").exists().isBoolean(),
  ];
};
