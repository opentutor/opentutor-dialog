/*
 * return a variable from process.env or throw an Error
 */
export default function requireEnv(name: string): string {
  const val = process.env[name];
  if (val) {
    return val;
  }
  throw new Error(
    `required env variable '${name}' is not defined. Make sure .env file exists in root and has ${name} set`
  );
}
