import { IUserModel, TSecureUser } from "../../models/user/user.types";
import { hashPassword } from "../../utils/crypto/crypto";
import { convertToSecureUser } from "./utils";

export async function createUniqueUser(
  this: IUserModel,
  {
    email,
    firstName,
    lastName,
    plainTextPassword,
  }: {
    email: string;
    firstName: string;
    lastName: string;
    plainTextPassword: string;
  }
): Promise<TSecureUser> {
  const userDocument = await this.findOne({
    "email": email,
  });
  if (userDocument && userDocument.email === email) {
    throw new Error(`User with email address: ${email} already exists`);
  }
  const hashedPassword = await hashPassword({ password: plainTextPassword });
  const newUser = await this.create({
    email,
    firstName,
    lastName,
    hashedPassword,
  });
  return convertToSecureUser(newUser);
}
