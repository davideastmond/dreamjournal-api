export type TTokenizedObject = { email: string; iat: number; exp: number };

export type TTokenSession = {
  id: string;
  email: string;
  createdAt: number;
  issued: number;
  expires: number;
};

export type TPartialTokenSession = Omit<TTokenSession, "issued" | "expires">;

export type TEncodeResult = {
  token: string;
  expires: number;
  issued: number;
};

export type TDecodeResult =
  | {
      type: "valid";
      session: TTokenSession;
    }
  | {
      type: "integrity-error";
    }
  | {
      type: "invalid-token";
    };

export type ExpirationStatus = "expired" | "active" | "grace";
