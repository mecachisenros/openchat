<script lang="ts">
  import { useAuth } from "../auth.svelte";

  const auth = useAuth();
</script>

<p>hello, {auth?.userId}</p>
