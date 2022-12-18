require("dotenv").config();
const jwt = require("jsonwebtoken");

import { IS_PRODUCTION } from "../../check-environment-variables";
export class JWTokenManager {
  private static readonly JWT_SECRET: string = IS_PRODUCTION
    ? process.env.PRODUCTION_JSON_SECRET
    : process.env.DEV_JSON_SECRET;

  private static readonly tokenAlgorithm: string = "HS256";
  public static async encode<T>(data: T): Promise<string> {
    return new Promise((resolve, reject) => {
      jwt.sign(
        data,
        JWTokenManager.JWT_SECRET,
        { algorithm: JWTokenManager.tokenAlgorithm },
        (err: any, token: string) => {
          if (err) {
            reject(new Error(err));
          }
          resolve(token);
        }
      );
    });
  }

  public static async decode<T>(token: string): Promise<T> {
    return new Promise((resolve, reject) => {
      jwt.verify(
        token,
        JWTokenManager.JWT_SECRET,
        { algorithm: JWTokenManager.tokenAlgorithm },
        (err: any, decodedObject: T) => {
          if (err) {
            reject({ type: "invalid", message: err.message });
          }
          resolve(decodedObject);
        }
      );
    });
  }
}
