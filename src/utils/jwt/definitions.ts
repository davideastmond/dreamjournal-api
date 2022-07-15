export type TTokenizedObject = { email: string; iat: number; exp: number };

export type TTokenSession = {
  _id: string;
  email: string;
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
      type: "invalid";
      message?: string;
    };

export type TExpirationStatus = "expired" | "active" | "grace";
