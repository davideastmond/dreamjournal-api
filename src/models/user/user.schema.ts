import { Schema, model } from "mongoose";
import { createUniqueUser } from "../../controllers/user/user.create";
import { getAllJournals } from "../../controllers/user/user.journals.find";
import { updateFirstNameLastNameDob } from "../../controllers/user/user.profile.update";
import { updateUserPassword } from "../../controllers/user/user.security.update";
import { SchemaOptionsWithPojoToMixed } from "../definitions";
import { IUser, IUserDocument, IUserModel } from "./user.types";

const userSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    hashedPassword: { type: String, required: true },
    journalIds: { type: Schema.Types.Mixed, required: true, default: {} },
    jwToken: { type: String, default: "" },
    dateOfBirth: { type: Date, default: null },
    security: {
      passwordRecovery: {
        token: String,
        createdAt: Date,
        expiresAt: Date,
        acceptanceToken: { type: String, default: null },
      },
    },
  },
  {
    timestamps: true,
    strict: false,
    typePojoToMixed: false,
  } as SchemaOptionsWithPojoToMixed
);

userSchema.methods.getAllJournals = getAllJournals;
userSchema.methods.updateUserPassword = updateUserPassword;
userSchema.methods.updateFirstNameLastNameDob = updateFirstNameLastNameDob;
userSchema.statics.createUniqueUser = createUniqueUser;

export default userSchema;
export const UserModel = model<IUserDocument, IUserModel>("user", userSchema);
