import { checkPassword, hashPassword } from "./crypto";

describe("crypto hashing tests", () => {
  test("hashes and checks string - expect true", async () => {
    const passwordString = "bacon";
    const hashedPassword = await hashPassword({ password: passwordString });
    await expect(
      checkPassword({ hashedPassword, plainTextPassword: passwordString })
    ).resolves.toBe(true);
  });
  test("hashes and checks string - expect false", async () => {
    const passwordString = "bacon";
    const hashedPassword = await hashPassword({ password: passwordString });
    await expect(
      checkPassword({ hashedPassword, plainTextPassword: "some other value" })
    ).resolves.toBe(false);
  });
});
