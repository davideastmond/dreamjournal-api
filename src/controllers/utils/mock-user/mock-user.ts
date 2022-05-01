import { UserModel } from "../../../models/user/user.schema";
import { IUserDocument } from "../../../models/user/user.types";

export async function getMockUser(): Promise<IUserDocument> {
  return UserModel.createUniqueUser({
    firstName: "fn",
    lastName: "ln",
    email: "email@email.com",
    plainTextPassword: "pwd123",
  });
}
