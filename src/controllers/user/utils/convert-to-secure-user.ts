import { IUserDocument, TSecureUser } from "../../../models/user/user.types";

export function convertToSecureUser(user: IUserDocument): TSecureUser {
  return {
    _id: user._id.toString(),
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    journalIds: user.journalIds,
  };
}
