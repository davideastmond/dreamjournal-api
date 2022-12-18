import dayjs from "dayjs";
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

export const initiatePasswordRecoveryRequestValidator = (): any[] => {
  return [
    body("email").isEmail(),
    body("dateOfBirth").custom((value: string) => {
      // Use dayjs to check for a valid date
      const dateData = dayjs(value);
      return dateData.isValid();
    }),
  ];
};

export const recoveryRequestValidator = (): any[] => {
  return [body("encryptedToken").exists()];
};

export const recoveryRequestCompleterValidator = (): any[] => {
  return [
    body("encryptedToken").exists().isString(),
    body("acceptanceToken").exists().isString(),
    body("plainTextPassword")
      .exists()
      .isString()
      .custom((val: string) => {
        // We can check password value
        if (
          RegExp(/^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{8,}$/).test(
            val
          )
        ) {
          return true;
        }
        throw new Error("Password does not meet complexity requirements");
      }),
  ];
};
