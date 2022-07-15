import { getUserId } from "./get-id";
describe("get-id tests", () => {
  test("returns id from response object", () => {
    const dummyResponseObject = {
      locals: {
        session: {
          _id: "testSession",
        },
      },
    };
    const res = getUserId(dummyResponseObject as any);
    expect(res).toBe("testSession");
  });
  test("return null from response object", () => {
    const dummyResponseObject = {
      locals: {
        session: {
          _id: null as any,
        },
      },
    };
    const res = getUserId(dummyResponseObject as any);
    expect(res).toBeNull();
  });
});
