import { getContext, setContext } from "svelte";

const SEARCH_CONTEXT_KEY = "search";

export class SearchState {
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

export function createSearchContext() {
  return setContext(SEARCH_CONTEXT_KEY, new SearchState());
}

export function useSearch() {
  return getContext<ReturnType<typeof createSearchContext>>(SEARCH_CONTEXT_KEY);
}
