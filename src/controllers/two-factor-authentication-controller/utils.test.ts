import { isPhoneNumberValid } from "./utils";

describe("utils tests", () => {
  describe("phone number validation tests", () => {
    test("invalid phone number function returns false", () => {
      const mockCTN = "+z61734";
      expect(isPhoneNumberValid(mockCTN)).toBe(false);
    });
    test("valid phone number - north america - return true", () => {
      const mockCTN = "+19055554172";
      expect(isPhoneNumberValid(mockCTN)).toBe(true);
    });
    test("EU number is valid", () => {
      const mockCTN = "+4915203076254";
      expect(isPhoneNumberValid(mockCTN)).toBe(true);
    });
  });
});
