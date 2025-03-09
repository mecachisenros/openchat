import { getContext, setContext } from "svelte";

const SIDEBAR_CONTEXT_KEY = "sidebar";

export class SidebarState {
  #opened = $state(false);

  open() {
    this.#opened = true;
  }

  close() {
    this.#opened = false;
  }

  get isOpened() {
    return this.#opened;
  }
}

export function createSidebarContext() {
  return setContext(SIDEBAR_CONTEXT_KEY, new SidebarState());
}

export function useSidebar() {
  return getContext<ReturnType<typeof createSidebarContext>>(
    SIDEBAR_CONTEXT_KEY,
  );
}
