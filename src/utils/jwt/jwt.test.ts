import { JWTokenManager } from "./jwt"
describe("JWToken class tests", ()=> {
  test("properly returns a token", async()=> {
    const testEmail = "test@example.com"
    const token = await JWTokenManager.signToken(testEmail)
    expect(token).toBeDefined();
    expect(typeof token).toBe("string")
  })
  test("gets proper tokenized object", async()=> {
    const testEmail = "test@example.com"
    const token = await JWTokenManager.signToken(testEmail);

    const tokenizedObject = await JWTokenManager.verifyToken(token);
    expect(tokenizedObject).toHaveProperty("email")
    expect(tokenizedObject).toHaveProperty("exp")
    expect(tokenizedObject).toHaveProperty("iat")
    expect(tokenizedObject.email).toBe("test@example.com");
  })
  test("expect error when token is invalid", async()=> {
    const badToken = "soknlasdf";
    await expect(()=> JWTokenManager.verifyToken(badToken)).rejects.toThrow()
  })
})
