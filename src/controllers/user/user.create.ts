import { IUserDocument, IUserModel } from "../../models/user/user.types";
import { hashPassword } from "../../utils/crypto/crypto";

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
): Promise<IUserDocument> {
  const userDocument = await this.findOne({
    "email": email,
  });
  if (userDocument && userDocument.email === email) {
    throw new Error(`Email address ${email} already exists`);
  }
  const hashedPassword = await hashPassword({ password: plainTextPassword });
  return this.create({ email, firstName, lastName, hashedPassword });
}
