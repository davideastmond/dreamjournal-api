export type TAuthCodeResponse = { token: string; authCode: string };

export type TTFAValidationResponse = {
  status: "error" | "ok" | string;
  isEnrollment: boolean;
  statusMessage: string;
  redirectPath?: string;
};

export type T2FADeEnrollResponse = {
  status: "error" | "ok" | string;
  twoFactorEnabled: boolean;
  statusMessage: string;
  redirectPath?: string;
};
