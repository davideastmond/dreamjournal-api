require("dotenv").config()

const jwt = require("jsonwebtoken")
import { IS_PRODUCTION } from "../../check-environment-variables";
import { TTokenizedObject } from './definitions';

export class JWTokenManager {
  private static readonly JWT_SECRET: string = IS_PRODUCTION ? process.env.PRODUCTION_JSON_SECRET : process.env.DEV_JSON_SECRET;

  public static async signToken(email: string): Promise<string> {
    return new Promise((resolve, reject) => {
      jwt.sign({ email }, JWTokenManager.JWT_SECRET, { expiresIn: 60 * 60 }, (err: any, token: string) => {
        if (err) {
          reject(new Error(err))
        }
        resolve(token)
      })
    })
  }

  public static async verifyToken(token: string): Promise<TTokenizedObject> {
    return new Promise((resolve, reject) => {
      jwt.verify(token, JWTokenManager.JWT_SECRET, (err: any, tokenizedObject: TTokenizedObject) => {
        if (err) {
          console.log(err)
          reject(new Error(`${err.name}: ${err.message}`))
        }
        resolve(tokenizedObject)
      })
    })
  }
}
