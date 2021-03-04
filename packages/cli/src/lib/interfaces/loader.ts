export interface Loader {
  list(options?: unknown): string[] | Promise<string[]>;

  read(
    name?: string,
    options?: unknown,
  ): string | undefined | Promise<string | undefined>;

  readAnyOf(
    names: string[],
    options?: unknown,
  ): string | undefined | Promise<string | undefined>;

  write(data: unknown, options?: unknown): boolean | Promise<boolean>;
}
