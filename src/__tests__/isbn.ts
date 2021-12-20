import { getISBN } from "utils/libraryUtils";

test("isbn invalid", () => {
  // check digit wrong
  const isbn1 = getISBN("123567890");
  expect(isbn1).toBeNull();
  // length wrong
  const isbn2 = getISBN("1235678901");
  expect(isbn2).toBeNull();
});

test("isbn 10 digits valid", () => {
  const isbn1 = getISBN("9876543210");
  expect(isbn1).toBe("9789876543217");
  // with X
  const isbn2 = getISBN("987654330X");
  expect(isbn2).toBe("9789876543309");
});
