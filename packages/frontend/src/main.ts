import { mount } from "svelte";
import { ClientApp } from "svelte-pilot";
import "./app.css";

import { router } from "./lib/router";

router.start(() =>
  mount(ClientApp, {
    props: { router },
    target: document.getElementById("app") as HTMLElement,
  }),
);
