import dayjs from "dayjs";
import { UserModel } from "../../models/user/user.schema";
import { IUserDocument } from "../../models/user/user.types";

//
export class PasswordRecoveryAuthenticator {
  private email: string;
  private dateOfBirth: string;

  constructor(email: string, dateOfBirth: string) {
    this.email = email;
    this.dateOfBirth = dayjs(dateOfBirth).format("YYYY-MM-DD");
  }

  // Reconcile e-mail and date of birth
  public async validate(): Promise<IUserDocument> {
    return this.authenticateUser();
  }

  private async authenticateUser(): Promise<IUserDocument | null> {
    const users = await UserModel.find({ email: this.email });

    if (users.length === 0) return null;
    const [user] = users;
    if (dayjs(user.dateOfBirth).isSame(this.dateOfBirth, "day")) {
      return user;
    }
    return null;
  }
}
