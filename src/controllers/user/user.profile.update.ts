import { IUserDocument } from "../../models/user/user.types";

export async function updateFirstNameLastName(
  this: IUserDocument,
  data: { firstName: string; lastName: string }
): Promise<IUserDocument> {
  this.firstName = data.firstName;
  this.lastName = data.lastName;
  return this.save();
}
