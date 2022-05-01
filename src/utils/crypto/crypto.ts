import bcrypt from "bcryptjs";

export async function hashPassword({
  password,
}: {
  password: string;
}): Promise<string> {
  if (!password || password.trim() === "")
    throw new Error("Password string not specified");
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function checkPassword({
  hashedPassword,
  plainTextPassword,
}: {
  hashedPassword: string;
  plainTextPassword: string;
}): Promise<boolean> {
  return bcrypt.compare(plainTextPassword, hashedPassword);
}
