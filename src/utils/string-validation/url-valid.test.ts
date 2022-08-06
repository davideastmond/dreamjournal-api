import { isURLValid } from "./url-valid";

describe("Url validation tests", () => {
  test("returns true for valid url", () => {
    const input = "https://www.zombo.com";
    const res = isURLValid(input);
    expect(res).toBe(true);
  });
  test("returns false for invalid url", () => {
    const input = "https://.com tester";
    const res = isURLValid(input);
    expect(res).toBe(false);
  });
});
