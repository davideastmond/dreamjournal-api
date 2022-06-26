export const validateTitle = ({
  title,
  onFail,
  onSuccess,
}: {
  title: string;
  onFail: () => void;
  onSuccess: () => void;
}) => {
  if (!title || title.length < 3) {
    onFail();
    return;
  }
  onSuccess();
};

test("onFail callback is called", () => {
  const mockFail = jest.fn();
  validateTitle({
    title: "",
    onFail: mockFail,
    onSuccess: () => {
      console.log("Success");
    },
  });
  expect(mockFail).toHaveBeenCalled();
});
