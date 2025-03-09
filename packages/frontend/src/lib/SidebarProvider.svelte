<script lang="ts">
  import {
    PanelRightClose,
    UserCog,
    MessageSquarePlus,
    Search as SearchIcon,
  } from "lucide-svelte";
  import { Link } from "svelte-pilot";
  import { useSidebar } from "./sidebar.svelte";
  import { useSearch } from "./search.svelte";
  import { useZero, useQuery } from "./zero.svelte";
  import { useRouter } from "./router";
  import { fade, fly } from "svelte/transition";
  import { clickOutside } from "./actions";
  import SidbarChatControl from "./SidbarChatControl.svelte";
  import type { Props as ChatControlProps } from "./SidbarChatControl.svelte";

  const sidebar = useSidebar();
  const search = useSearch();
  const router = useRouter();

  const zero = useZero();
  const chatQuery = zero.current.query.chat.orderBy("createdAt", "desc");

  const chats = useQuery(() => chatQuery);

  const deleteChat: ChatControlProps["deleteChat"] = async (chatId) => {
    await zero.current.mutate.chat.delete({ id: chatId });
    if (router?.current?.path === location.pathname) {
      router.push("/chat");
    }
  };

  const updateChat: ChatControlProps["updateChat"] = async (chat) => {
    await zero.current.mutate.chat.update(chat);
  };
</script>

{#snippet bottomLinks()}
  <div class="relative flex flex-col gap-6">
    <button
      type="button"
      class="text-tkfg hover:bg-tkgreenpale hover:text-tkblack group focus:outline-tkgreenpale flex items-center rounded-md p-1.5 focus:outline-2 focus:-outline-offset-2"
      onclick={() => {
        sidebar.close();
        search.open();
      }}
    >
      <SearchIcon class="size-6" />
      <div class="flex w-full items-center justify-between">
        <span class="ml-4 text-sm/6 font-semibold" aria-hidden="true">
          Search
        </span>
        <div class="flex">
          <kbd
            class="border-tkfg group-hover:bg-tkbg group-hover:text-tkfg mx-1 flex h-5 items-center justify-center rounded-sm border px-1"
          >
            ⌘
          </kbd>
          <kbd
            class="border-tkfg group-hover:bg-tkbg group-hover:text-tkfg mx-1 flex size-5 items-center justify-center rounded-sm border"
          >
            K
          </kbd>
        </div>
      </div>
    </button>

    <Link
      to="/chat"
      type="button"
      class="text-tkblack bg-tkorange hover:bg-tkgreenpale  focus:outline-tkstraw flex items-center rounded-md p-1.5 focus:outline-2 focus:-outline-offset-2"
    >
      <MessageSquarePlus class="size-6" />
      <span class="flex items-center">
        <span class="ml-4 text-sm/6 font-semibold" aria-hidden="true">
          New chat
        </span>
      </span>
    </Link>

    <div class="flex w-full justify-between">
      <Link
        to="/profile"
        type="button"
        class="text-tkfg hover:bg-tkgreenpale hover:text-tkblack focus:outline-tkgreenpale flex w-full items-center rounded-md p-1.5 focus:outline-2 focus:-outline-offset-2"
      >
        <UserCog class="size-6" />
        <span class="flex items-center">
          <span class="ml-4 text-sm/6 font-semibold" aria-hidden="true">
            Profile
          </span>
        </span>
      </Link>

      <button
        type="button"
        class="text-tkfg px-2.5 lg:hidden"
        onclick={() => sidebar.close()}
      >
        <span class="sr-only">Close sidebar</span>
        <PanelRightClose class="size-6" />
      </button>
    </div>
  </div>
{/snippet}

<div class="relative overflow-hidden">
  <div
    class={[
      sidebar.isOpened ? "fixed" : "hidden",
      "bg-tkblack/80 inset-0 z-40",
    ]}
    aria-hidden="true"
    transition:fade={{ duration: 150 }}
  ></div>

  <div
    class={[
      "bg-tkbg inset-y-0 right-0 z-50 transition-all lg:fixed lg:flex lg:w-72",
      sidebar.isOpened ? "fixed flex" : "hidden",
    ]}
    use:clickOutside
    onoutsideclick={() => {
      sidebar.close();
    }}
  >
    <div class="border-tkgreenpale w-full border-l">
      <div class="mx-auto flex h-svh flex-col justify-between px-4">
        <div class="flex h-16 flex-none shrink-0 items-center">
          <img class="h-8 w-auto" src="/openchat.svg" alt="OpenChat" />
        </div>

        <ul role="list" class="flex-1 space-y-2 overflow-y-auto">
          {#each chats.current as chat (chat)}
            <li class="relative">
              <SidbarChatControl {chat} {updateChat} {deleteChat} />
            </li>
          {/each}
        </ul>

        <div class="order-last mt-6 mb-4">
          {@render bottomLinks()}
        </div>
      </div>
    </div>
  </div>
</div>
