import * as jwt from "jsonwebtoken";

export function verify_token(token: string, key: string): string | undefined {
  try {
    const res = jwt.verify(token, key);
    if (res) {
      if (typeof res === "object") {
        return JSON.stringify(res);
      } else {
        return res;
      }
    } else {
      return undefined;
    }
  } catch (e) {
    console.log(e);
    return undefined;
  }
}

export function undef(value: any): boolean {
  return [undefined, null, NaN].includes(value);
}
