<script lang="ts" module>
  export type Props = {
    handleSubmit: (data: FormData) => Promise<unknown>;
  };
</script>

<script lang="ts">
  import {
    PanelRightOpen,
    Forward,
    Check,
    ChevronsUpDown,
  } from "lucide-svelte";
  import { useSidebar } from "./sidebar.svelte";
  import { fade } from "svelte/transition";
  import { clickOutside } from "./actions";
  import { tick } from "svelte";

  let { handleSubmit }: Props = $props();

  const models = [
    "deepseek-r1-distill-llama-70b",
    "gemma2-9b-it",
    "gemma-7b-it",
    "llama-3.3-70b-versatile",
    "llama-3.1-8b-instant",
    "llama3-70b-8192",
    "llama3-8b-8192",
    "mixtral-8x7b-32768",
  ] as const;

  type Model = (typeof models)[number];

  class LocalStore<T> {
    current = $state<T>() as T;
    key = "";

    constructor(key: string, value: T) {
      this.key = key;
      this.current = value;

      const item = localStorage.getItem(key) as T;

      if (item) {
        this.current = item;
      }

      $effect(() => {
        localStorage.setItem(this.key, this.current);
      });
    }
  }

  let formEl = $state<HTMLFormElement>();
  let textareaEl = $state<HTMLTextAreaElement>();
  let modelListEl = $state<HTMLUListElement>();
  let modelPickerOpened = $state(false);
  let highlighetedModel = $state<string>();
  let selectedModel = new LocalStore<Model>("modelId", "llama3-8b-8192");

  function toggleModelPicker() {
    modelPickerOpened = !modelPickerOpened;
  }

  function isHighlighted(modelId: string) {
    return modelId === highlighetedModel;
  }

  $effect(() => {
    textareaEl?.focus();
  });

  const sidebar = useSidebar();

  async function handleMessage(e: Event) {
    e.preventDefault();

    const currentTarget = e.currentTarget as HTMLFormElement;

    if (!currentTarget) {
      return;
    }

    const data = new FormData(currentTarget);

    const message = data.get("message") as string;

    if (message.trim() === "") {
      return;
    }

    await handleSubmit(data);
  }

  function handleModelKeyNavigation(e: KeyboardEvent) {
    const currentTarget = e.currentTarget as HTMLUListElement;

    if (!currentTarget) {
      return;
    }

    const items = Array.from(currentTarget.querySelectorAll("li"));

    const currentIndex = items.findIndex(
      (item) => document.activeElement === item,
    );

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
        nextIndex = models.length - 1;
      } else if (nextIndex === models.length) {
        nextIndex = 0;
      }

      items[nextIndex]?.focus();
      highlighetedModel = models[nextIndex];
    } else if (e.key === "Enter" || e.key === "Space" || e.key === " ") {
      e.preventDefault();

      if (currentIndex >= 0) {
        selectedModel.current = models[currentIndex];
      }

      toggleModelPicker();
      textareaEl?.focus();
    } else if (e.key === "Escape") {
      e.preventDefault();

      toggleModelPicker();
      textareaEl?.focus();
    }
  }

  function onShiftEnter(e: KeyboardEvent) {
    if (e.key == "Enter" && e.shiftKey) {
      e.preventDefault();
      formEl?.requestSubmit();
      formEl?.reset();
      textareaEl?.focus();
    }
  }
</script>

{#snippet modelPicker()}
  <div class="mb-4 ml-4">
    <label id="listbox-label" for="model" class="sr-only">Change model</label>
    <input
      id="model"
      type="hidden"
      name="model"
      value={selectedModel.current}
    />

    <div
      class="relative max-w-60"
      use:clickOutside
      onoutsideclick={() => {
        modelPickerOpened = false;
      }}
    >
      <button
        type="button"
        class="text-tkblack focus:outline-tkgreen bg-tkgreen/40 grid cursor-default grid-cols-1 rounded-md px-3 py-1.5 text-left focus:outline-2 focus:-outline-offset-2 sm:text-sm/6"
        aria-haspopup="listbox"
        aria-expanded={modelPickerOpened}
        aria-labelledby="listbox-label"
        onclick={() => {
          toggleModelPicker();
          tick().then(() => modelListEl?.focus());
        }}
      >
        <span class="col-start-1 row-start-1 truncate pr-6">
          {selectedModel.current}
        </span>
        <ChevronsUpDown
          class="text-tkbg col-start-1 row-start-1 size-5 self-center justify-self-end sm:size-4"
        />
      </button>

      {#if modelPickerOpened}
        <ul
          class="bg-tkblack ring-tkblack/5 absolute bottom-12 z-10 origin-top-left rounded-md text-base shadow-lg focus:outline-hidden sm:text-sm"
          tabindex="0"
          role="listbox"
          aria-labelledby="listbox-label"
          aria-activedescendant="listbox-option-3"
          transition:fade={{ duration: 150 }}
          bind:this={modelListEl}
          onkeydown={handleModelKeyNavigation}
        >
          {#each models as modelId, index}
            <!-- svelte-ignore a11y_click_events_have_key_events -->
            <li
              class={[
                "relative cursor-default py-2 pr-4 pl-8 select-none first:rounded-t-md last:rounded-b-md",
                isHighlighted(modelId)
                  ? "bg-tkorange text-tkblack outline-none"
                  : "text-tkfg",
                "hover:bg-tkorange hover:text-tkblack hover:outline-none",
              ]}
              id="listbox-option-{index}"
              role="option"
              tabindex="0"
              aria-selected={modelId == selectedModel.current}
              onclick={() => {
                selectedModel.current = modelId;
                toggleModelPicker();
                textareaEl?.focus();
              }}
            >
              <span
                class:font-semibold={modelId == selectedModel.current}
                class:font-normal={modelId != selectedModel.current}
                class="block truncate"
              >
                {modelId}
              </span>

              {#if modelId == selectedModel.current}
                <span
                  class="text-tkgreenpale hover:text-tkbg absolute inset-y-0 left-0 flex items-center pl-1.5"
                >
                  <Check />
                </span>
              {/if}
            </li>
          {/each}
        </ul>
      {/if}
    </div>
  </div>
{/snippet}

<div class="absolute bottom-0 z-10 field-sizing-content w-full">
  <div
    class="bg-tkgreenpale mx-auto flex max-w-2xl flex-grow flex-col rounded-t-lg"
  >
    <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
    <form
      bind:this={formEl}
      class="relative flex"
      onkeydown={onShiftEnter}
      onsubmit={handleMessage}
    >
      <input type="hidden" name="role" value="user" />
      <div class="flex w-full flex-col">
        <textarea
          bind:this={textareaEl}
          id="message"
          name="message"
          placeholder="Type your message here..."
          class="text-tkblack field-sizing-content min-h-12 w-full resize-none overflow-hidden px-4 py-2 outline-none"
        ></textarea>

        {@render modelPicker()}
      </div>

      <div class="flex flex-col items-center justify-between p-4">
        <button
          type="submit"
          class=" bg-tkorange text-tkblack focus:outline-tkstraw rounded p-1 focus:outline-2"
        >
          <Forward />
        </button>

        <button
          type="button"
          class="text-tkblack lg:hidden"
          onclick={() => sidebar.open()}
        >
          <PanelRightOpen />
        </button>
      </div>
    </form>
  </div>
</div>
