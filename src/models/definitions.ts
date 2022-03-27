import { SchemaOptions } from "mongoose";
export interface SchemaOptionsWithPojoToMixed extends SchemaOptions {
  typePojoToMixed: boolean;
}
