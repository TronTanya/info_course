/** Optional dependency — types only when `redis` is not installed locally. */
declare module "redis" {
  export function createClient(opts: { url: string }): {
    connect: () => Promise<void>;
    on: (event: string, listener: () => void) => void;
    incr: (key: string) => Promise<number>;
    pExpire: (key: string, ms: number) => Promise<boolean>;
  };
}
