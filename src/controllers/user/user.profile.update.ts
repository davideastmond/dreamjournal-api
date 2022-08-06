import { IUserDocument } from "../../models/user/user.types";
import dayjs from "dayjs";

export async function updateFirstNameLastNameDob(
  this: IUserDocument,
  data: { firstName: string; lastName: string; dateOfBirth: string | Date }
): Promise<IUserDocument> {
  this.firstName = data.firstName;
  this.lastName = data.lastName;

  const userDocumentWithDateOfBirth = updateDob({
    document: this,
    dobString: data.dateOfBirth as string,
  });
  return userDocumentWithDateOfBirth.save();
}

function updateDob({
  dobString,
  document,
}: {
  dobString: string;
  document: IUserDocument;
}) {
  const dob = dayjs(dobString as string);
  document.dateOfBirth = dob.toDate();
  return document;
}
