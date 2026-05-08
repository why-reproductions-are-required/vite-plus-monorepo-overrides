const port = Number(process.env.PORT ?? 3000);

console.log(`API listening on ${port}`);

export function createMessage(name: string): string {
  return `hello ${name}`;
}
