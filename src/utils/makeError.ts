export function makeError(message: string, status: number) {
  const error = new Error(message);
  (error as any).status = status;
  return error;
}
