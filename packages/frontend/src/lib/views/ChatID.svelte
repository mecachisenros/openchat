<script lang="ts">
  import { useZero, useQuery } from "../zero.svelte";
  import { marked } from "marked";
  import { useSidebar } from "../sidebar.svelte";

  type Message = {
    id: string;
    role: "user" | "assistant";
    chatId: string;
    content: string;
  };

  let { chatId } = $props();

  const zero = useZero();

  const sidebar = useSidebar();

  $effect(() => {
    sidebar.close();
  });

  const messageQuery = $derived.by(() => {
    return zero.current.query.message
      .where("chatId", "=", chatId)
      .orderBy("createdAt", "asc");
  });

  const messages = useQuery(() => messageQuery);

  const scrollToBottom = (node: HTMLElement) => {
    $effect(() => {
      if (messages?.current?.length) {
        node.scroll({ top: node.scrollHeight, behavior: "smooth" });
      }
    });
  };
</script>

{#snippet message(msg: Message)}
  <div
    class="prose prose-p:text-tkfg prose-strong:text-tkorange prose-headings:text-tkfg prose-code:text-tkgreenpale text-tkfg mx-auto max-w-2xl"
  >
    {#if msg.role == "user"}
      <div class="flex justify-end">
        <div
          class="bg-tkgreenpale text-tkblack max-w-96 rounded-lg rounded-br-none px-4 py-2"
        >
          {@html msg.content}
        </div>
      </div>
    {:else}
      <!-- {@html msg.content} -->
      {@html marked.parse(msg.content)}
    {/if}
  </div>
{/snippet}

{#snippet chatContainer()}
  <div
    use:scrollToBottom
    class="scrollbar absolute inset-0 space-y-6 overflow-y-auto px-4 pt-8 pb-32 lg:px-0"
  >
    {#each messages.current as msg}
      {@render message(msg)}
    {/each}
  </div>
{/snippet}

{@render chatContainer()}
