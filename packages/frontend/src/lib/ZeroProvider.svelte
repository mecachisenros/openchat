<script lang="ts">
  import { useAuth } from "./auth.svelte";
  import { schema } from "../schema/zero";
  import type { Snippet } from "svelte";
  import type { Schema } from "../schema/zero";
  import { ZERO_URL } from "./zero.svelte";
  import { Z, createZeroContext } from "./zero.svelte";

  let { children }: { children: Snippet } = $props();

  const auth = useAuth();

  let zero = new Z<Schema>({
    server: ZERO_URL,
    schema,
    auth: auth.accessToken as string,
    userID: auth.userId as string,
  });

  zero.current.query.user
    .where("id", "=", auth.userId as string)
    .related("chats", (q) => q.related("messages"))
    .preload();

  createZeroContext(zero);
</script>

{@render children()}
