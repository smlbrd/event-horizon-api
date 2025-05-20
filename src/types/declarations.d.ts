declare module '*.json' {
  const value: any;
  export default value;
}

declare module 'express-serve-static-core' {
  interface Request {
    user?: { username: string; role: string };
  }
}
