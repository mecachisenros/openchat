<script lang="ts">
  import type { Snippet } from "svelte";
  import { Auth, createAuthContext } from "./auth.svelte";
  import { LogIn } from "lucide-svelte";

  let { children }: { children: Snippet } = $props();

  const auth = new Auth();

  createAuthContext(auth);
</script>

{#await auth.authenticate()}
  <!-- Initiating... -->
{:then resolvedAuth}
  {#if !resolvedAuth?.loggedIn}
    <div
      class="prose prose-a:text-tkgreenpale prose-headings:text-tkgreenpale text-tkfg mx-auto flex h-svh w-full flex-col items-center justify-center space-y-10 text-center"
    >
      <img class="h-8 w-auto" src="/openchat.svg" alt="OpenChat" />
      <h1>OpenChat</h1>

      <button
        type="button"
        class="text-tkblack bg-tkorange hover:bg-tkgreenpale focus:outline-tkstraw flex items-center rounded-md px-4 py-2 focus:outline-2 focus:-outline-offset-2"
        onclick={() => {
          auth.login();
        }}
      >
        <LogIn class="-ml-2 size-6" />
        <span class="flex items-center">
          <span class="ml-2 text-sm/6 font-semibold" aria-hidden="true">
            Sign up / Sign in
          </span>
        </span>
      </button>

      <div>
        <p>
          A demo chat app demonstrating <a href="https://zero.rocicorp.dev/"
            >Zero</a
          >'s sync capabilities.
        </p>
        <p>
          <em>Zero is the future, seriously, check it out.</em>
        </p>
      </div>
    </div>
  {:else}
    {@render children()}
  {/if}
{/await}
