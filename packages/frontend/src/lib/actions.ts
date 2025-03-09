import type { Action } from "svelte/action";

export const clickOutside: Action<
  Element,
  undefined,
  { onoutsideclick: () => void }
> = (node) => {
  const handleClick = (event: Event) => {
    if (
      node &&
      !node.contains(event.target as Element) &&
      !event.defaultPrevented
    ) {
      node.dispatchEvent(new CustomEvent("outsideclick"));
    }
  };

  document.addEventListener("click", handleClick, true);

  return {
    destroy() {
      document.removeEventListener("click", handleClick, true);
    },
  };
};
