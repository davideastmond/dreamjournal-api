import { IUserDocument } from "../../models/user/user.types";
import { hashPassword } from "../../utils/crypto/crypto";

export async function updateUserPassword(
  this: IUserDocument,
  plainTextPassword: string
): Promise<void> {
  const pwdHash = await hashPassword({ password: plainTextPassword });
  this.hashedPassword = pwdHash;
  await this.save();
}
