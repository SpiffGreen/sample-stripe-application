export {};

declare global {
  namespace Express {
    interface User {
      sub: number;
      email: string;
    }

    interface Request {
      user?: User | undefined;
    }
  }
}
