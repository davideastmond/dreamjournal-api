import { Schema, model, SchemaOptions } from "mongoose";
import { createUniqueUser } from "../../controllers/user/user.create";
import { IUser, IUserDocument, IUserModel } from "./user.types";

interface SchemaOptionsWithPojoToMixed extends SchemaOptions {
  typePojoToMixed: boolean;
}

const userSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    hashedPassword: { type: String, required: true },
    journalIds: { type: Schema.Types.Mixed, required: true, default: {} },
    jwToken: { type: String, default: "" },
  },
  {
    timestamps: true,
    strict: false,
    typePojoToMixed: false,
  } as SchemaOptionsWithPojoToMixed
);

userSchema.statics.createUniqueUser = createUniqueUser;

export default userSchema;
export const UserModel = model<IUserDocument, IUserModel>("user", userSchema);
