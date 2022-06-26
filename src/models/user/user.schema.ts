import { Schema, model } from "mongoose";
import { createUniqueUser } from "../../controllers/user/user.create";
import { getAllJournals } from "../../controllers/user/user.journals.find";
import { updateFirstNameLastName } from "../../controllers/user/user.profile.update";
import {
  insertSecurityQuestionsForUser,
  updateUserPassword,
} from "../../controllers/user/user.security.update";
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
    security: {
      isSet: { type: Boolean, default: false },
      recoveryQuestions: {
        type: [
          {
            question: { id: { type: String }, prompt: { type: String } },
            answer: String,
          },
        ],
        default: [],
      },
      twoFactorAuthentication: {
        enabled: { type: Boolean, default: false },
        userCtn: { type: String, default: null },
        userCtnVerified: { type: Boolean, default: false },
        token: { type: String, default: null },
        tokenCreated: { type: Date, default: null },
        tokenExpires: { type: Date, default: null },
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
userSchema.methods.updateFirstNameLastName = updateFirstNameLastName;
userSchema.methods.insertSecurityQuestionsForUser =
  insertSecurityQuestionsForUser;
userSchema.statics.createUniqueUser = createUniqueUser;

export default userSchema;
export const UserModel = model<IUserDocument, IUserModel>("user", userSchema);
