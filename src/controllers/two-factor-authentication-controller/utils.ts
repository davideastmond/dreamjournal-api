export function isPhoneNumberValid(ctn: string): boolean {
  const validCTNExpr = /^\+(?:[0-9] ?){6,14}[0-9]$/;
  return validCTNExpr.test(ctn);
}
