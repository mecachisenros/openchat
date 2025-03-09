import { Zero } from "@rocicorp/zero";
import type { ZeroOptions, Schema as ZSchema } from "@rocicorp/zero";
import type { Schema } from "../schema/zero";
import type { Query as ZeroQuery } from "@rocicorp/zero/advanced";
import { Query } from "zero-svelte";
import { getContext, setContext } from "svelte";

export const ZERO_CONTEXT_KEY = "zero";

export const ZERO_URL = import.meta.env.VITE_ZERO_URL;

export class Z<S extends ZSchema> {
  current: Zero<S> = $state(null!);

  constructor(options: ZeroOptions<S>) {
    this.#init(options);
  }

  #init(options: ZeroOptions<S>) {
    this.current = new Zero(options);
  }
}

export function createZeroContext(zero: Z<Schema>) {
  return setContext<Z<Schema>>(ZERO_CONTEXT_KEY, zero);
}

export function useZero() {
  return getContext<ReturnType<typeof createZeroContext>>(ZERO_CONTEXT_KEY);
}

export function useQuery<
  TSchema extends ZSchema,
  TTable extends keyof TSchema["tables"] & string,
  TReturn,
>(
  queryFactory: () => ZeroQuery<TSchema, TTable, TReturn>,
  enabled: boolean = true,
) {
  let query = $state<Query<TSchema, TTable, TReturn>>(
    new Query(queryFactory(), enabled),
  );

  $effect(() => {
    query = new Query(queryFactory(), enabled);
  });

  return new Proxy({} as Query<TSchema, TTable, TReturn>, {
    get(target, prop) {
      return query[prop as keyof typeof query];
    },
  });
}
