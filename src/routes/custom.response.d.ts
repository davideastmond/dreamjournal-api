declare namespace Express {
  export interface Response {
    locals: {
      session: {
        _id: string;
        email: string;
        createdAt: number;
        issued: number;
        expires: number;
        iat: number;
      };
    };
  }
}
