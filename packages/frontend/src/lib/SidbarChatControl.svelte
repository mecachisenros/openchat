<script lang="ts" module>
  export type Props = {
    chat: Chat;
    deleteChat: (chatId: string) => Promise<void>;
    updateChat: (chat: Chat) => Promise<void>;
  };
</script>

<script lang="ts">
  import { BotMessageSquare, Captions, X } from "lucide-svelte";
  import { Link } from "svelte-pilot";
  import type { Chat } from "@openchat/zero/schema";

  let { chat, deleteChat, updateChat }: Props = $props();

  let edit = $state(false);
  let newName = $state(chat.name);
  let inputEl = $state<HTMLInputElement>();

  $effect(() => {
    if (edit) {
      inputEl?.focus();
    }
  });
</script>

{#if edit}
  <div
    class="bg-tkgreenpale outline-tkgreen/10 focus-within:outline-tkgreen flex items-center rounded-md p-1 pl-3 outline-1 -outline-offset-1 focus-within:outline-2 focus-within:-outline-offset-2"
  >
    <input
      type="text"
      name="name"
      id="name"
      bind:this={inputEl}
      class="text-tkblack placeholder:text-tkbg/50 block min-w-0 grow bg-transparent py-1.5 pr-3 pl-1 text-base focus:outline-none sm:text-sm/6"
      bind:value={newName}
      onkeydown={(e) => {
        if (e.key === "Enter") {
          updateChat({
            id: chat.id,
            name: newName,
          } as Chat);
          edit = false;
        }
        if (e.key === "Escape") {
          edit = false;
        }
      }}
    />
  </div>
{:else}
  <Link
    to={`/chat/${chat.id}`}
    class="group/link text-tkgreenpale hover:bg-tkgreenpale hover:text-tkblack focus:outline-tkgreenpale flex items-center justify-between gap-x-3 rounded-md p-2 text-sm font-semibold focus:outline-2 focus:-outline-offset-2"
  >
    <button
      type="button"
      class="group/edit focus:outline-tkgreenpale group-hover/link:bg-tkbg hover:text-tkorange group-hover/link:text-tkgreenpale cursor-pointer rounded-md p-1 group-hover/link:z-10 focus:outline-2 focus:-outline-offset-2"
      onclick={() => {
        edit = true;
      }}
    >
      <BotMessageSquare class="size-5 group-hover/edit:hidden" />
      <Captions class="hidden size-5 group-hover/edit:block" />
    </button>

    <span class="flex-1 truncate">
      {chat?.name?.length ? chat.name : chat.id}
    </span>

    <button
      type="button"
      class="focus:outline-tkgreenpale group-hover/link:bg-tkbg hover:text-tkstraw group-hover/link:text-tkgreenpale cursor-pointer rounded-md p-1 group-hover/link:z-10 focus:outline-2 focus:-outline-offset-2"
      onclick={() => {
        deleteChat(chat.id);
      }}
    >
      <X class="size-5" />
    </button>
  </Link>
{/if}
