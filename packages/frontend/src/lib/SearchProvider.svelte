<script lang="ts">
  import { fade, fly, scale } from "svelte/transition";
  import { clickOutside } from "./actions";
  import { useZero, useQuery } from "./zero.svelte";
  import { Search } from "lucide-svelte";
  import { useSearch } from "./search.svelte";
  import { useRouter } from "./router";

  const zero = useZero();
  const search = useSearch();
  const router = useRouter();

  let term = $state("");

  const chatQuery = $derived.by(() => {
    return zero.current.query.chat.where("name", "ILIKE", `%${term}%`);
  });

  const chats = useQuery(() => chatQuery);

  let selectedIndex = $state(0);
  let selected = $derived(chats.current?.at(selectedIndex));
  let inputEl = $state<HTMLInputElement>();

  function isSelected(chatId: string) {
    return selected?.id === chatId;
  }

  $effect(() => {
    inputEl?.focus();
  });

  async function handleKeyNavigation(e: KeyboardEvent) {
    const currentTarget = e.currentTarget as HTMLUListElement;

    if (!currentTarget) {
      return;
    }

    const items = Array.from(currentTarget.querySelectorAll("li"));

    if (!items.length) {
      return;
    }

    const currentIndex = selected?.id
      ? items.findIndex((item) => item.dataset.chatid === selected?.id)
      : 0;

    if (
      e.key === "ArrowUp" ||
      e.key === "ArrowDown" ||
      (e.key === "n" && e.ctrlKey) ||
      (e.key === "p" && e.ctrlKey)
    ) {
      e.preventDefault();
      let nextIndex =
        currentIndex +
        (e.key === "ArrowUp" || (e.key === "p" && e.ctrlKey) ? -1 : 1);

      if (nextIndex === -1) {
        nextIndex = chats.current.length - 1;
      } else if (nextIndex === chats.current.length) {
        nextIndex = 0;
      }

      const currentItem = items.find(
        (item) => item.dataset.chatid === selected?.id,
      );

      currentItem?.scrollIntoView({ block: "center" });

      selectedIndex = nextIndex;
    } else if (e.key === "Enter" || e.key === "Space" || e.key === " ") {
      e.preventDefault();

      if (currentIndex >= 0) {
        selectedIndex = currentIndex;
      }

      search.close();
      router.push(`/chat/${selected?.id}`);
    } else if (e.key === "x" && e.ctrlKey) {
      e.preventDefault();

      if (selected?.id) {
        await zero.current.mutate.chat.delete({ id: selected.id });

        if (router?.current?.path === location.pathname) {
          router.push("/chat");
        }
      }
    } else if (e.key === "i" && e.ctrlKey) {
      search.close();
      router.push("/chat");
    }
  }

  function onCommand(e: KeyboardEvent) {
    if (e.key == "k" && e.metaKey) {
      e.preventDefault();
      search.open();
    }

    if (e.key === "Escape" && search.isOpened) {
      e.preventDefault();
      search.close();
    }
  }
</script>

<svelte:body onkeydown={onCommand} />

{#if search.isOpened}
  <div
    class="absolute inset-0 z-10 h-svh px-4 lg:px-0 lg:pr-72"
    role="dialog"
    aria-modal="true"
  >
    <div
      class="bg-tkbg/50 fixed inset-0 transition-opacity"
      aria-hidden="true"
      transition:fade={{ duration: 200 }}
    ></div>

    <div class="relative z-10 mx-auto h-full w-full max-w-2xl">
      <!-- svelte-ignore a11y_no_static_element_interactions -->
      <div
        transition:fly={{ duration: 150, x: 0.95 }}
        use:clickOutside
        onoutsideclick={() => {
          search.close();
        }}
        class="divide-tkgreenpale bg-tkblack absolute bottom-0 w-full transform divide-y overflow-hidden rounded-t-md transition-all"
        onkeydown={handleKeyNavigation}
      >
        {#if chats.current.length}
          <ul
            class="text-tkgreenpale max-h-72 overflow-y-auto text-sm"
            id="options"
            role="listbox"
          >
            {#each chats.current as chat, index}
              <li
                class={[
                  "cursor-default px-4 py-2 select-none",
                  isSelected(chat.id) && "bg-tkgreenpale text-tkblack",
                ]}
                id="option-{index}"
                data-chatId={chat.id}
                role="option"
                aria-selected={selected?.id === chat.id}
                tabindex="-1"
              >
                {chat.name}
              </li>
            {/each}
          </ul>
        {:else}
          <p class="p-4 text-sm text-gray-500">No chats found.</p>
        {/if}

        <div class="flex flex-row">
          <div class="flex w-full items-start">
            <Search
              class="text-tkgreenpale pointer-events-none ml-4 size-5 h-12 "
            />
            <input
              bind:this={inputEl}
              bind:value={term}
              type="text"
              class="text-tkfg placeholder:text-tkgreenpale/70 h-12 w-full pr-4 pl-4 text-base outline-hidden sm:text-sm"
              placeholder="Search..."
              role="combobox"
              aria-expanded="false"
              aria-controls="options"
            />
          </div>
        </div>

        <div class="text-tkfg hidden h-12 text-sm sm:block">
          <div class="flex flex-wrap items-center px-4 py-2.5">
            <kbd
              class="border-tkfg mx-1 flex h-5 items-center justify-center rounded-sm border px-1"
            >
              CTRL
            </kbd>
            <kbd
              class="border-tkfg mx-1 flex size-5 items-center justify-center rounded-sm border"
            >
              I
            </kbd>
            <span class="mx-1">new chat</span>
            <kbd
              class="border-tkfg mx-1 flex h-5 items-center justify-center rounded-sm border px-1"
            >
              CTRL
            </kbd>
            <kbd
              class="border-tkfg mx-1 flex h-5 items-center justify-center rounded-sm border px-1"
            >
              N/P
            </kbd>
            <span class="mx-1">navigate</span>
            <kbd
              class="border-tkfg mx-0.5 flex h-5 items-center justify-center rounded-sm border px-1"
            >
              CTRL
            </kbd>
            <kbd
              class="border-tkfg mx-0.5 flex size-5 items-center justify-center rounded-sm border px-1"
            >
              X
            </kbd>
            <span class="mx-1">delete</span>
          </div>
        </div>
      </div>
    </div>
  </div>
{/if}
