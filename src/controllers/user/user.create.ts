import { IUserDocument, IUserModel } from "../../models/user/user.types";
import { hashPassword } from "../../utils/crypto/crypto";
import dayjs from "dayjs";
export async function createUniqueUser(
  this: IUserModel,
  {
    email,
    firstName,
    lastName,
    plainTextPassword,
    dateOfBirth,
  }: {
    email: string;
    firstName: string;
    lastName: string;
    plainTextPassword: string;
    dateOfBirth: string;
  }
): Promise<IUserDocument> {
  const userDocument = await this.findOne({
    "email": email,
  });
  if (userDocument && userDocument.email === email) {
    throw new Error(`User with email address: ${email} already exists`);
  }
  const hashedPassword = await hashPassword({ password: plainTextPassword });

  const dob = dayjs(dateOfBirth);
  const newUser = await this.create({
    email,
    firstName,
    lastName,
    hashedPassword,
    dateOfBirth: dob,
  });
  return newUser;
}
