export {};

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface User {
      iss: string;
      sub: string;
      aud: string | string[];
      iat: number;
      exp: number;
      azp: string;
      scope: string;
    }
  }
}
