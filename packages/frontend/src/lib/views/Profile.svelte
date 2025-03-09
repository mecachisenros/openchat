<script lang="ts">
  import { LogOut, PanelRightOpen } from "lucide-svelte";
  import { useAuth } from "../auth.svelte";
  import { useSidebar } from "../sidebar.svelte";
  import { useQuery, useZero } from "../zero.svelte";

  const auth = useAuth();
  const sidebar = useSidebar();
  const zero = useZero();

  $inspect(auth.userId);
  const userQuery = zero.current.query.user
    .where("id", "=", auth.userId as string)
    .one();

  const user = useQuery(() => userQuery);

  const name = $derived(user.current?.name);
  const email = $derived(user.current?.email);
</script>

<form class="mx-auto h-svh max-w-4xl overflow-y-auto px-4 pt-12">
  <div class="space-y-12">
    <div class="border-tkfg/10 border-b pb-12">
      <div class="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 md:grid-cols-2">
        <div class="">
          <label
            for="username"
            class="text-tkorange block text-sm/6 font-medium"
          >
            Name
          </label>

          <div class="mt-2">
            <div
              class="bg-tkgreenpale outline-tkgreen/10 focus-within:outline-tkgreen flex items-center rounded-md pl-3 outline-1 -outline-offset-1 focus-within:outline-2 focus-within:-outline-offset-2"
            >
              <input
                value={name}
                oninput={(
                  e: Event & { currentTarget: EventTarget & HTMLInputElement },
                ) => {
                  zero.current.mutate.user.update({
                    id: auth.userId as string,
                    name: e.currentTarget.value,
                  });
                }}
                type="text"
                name="name"
                id="name"
                class="text-tkblack placeholder:text-tkbg/50 block min-w-0 grow bg-transparent py-1.5 pr-3 pl-1 text-base focus:outline-none sm:text-sm/6"
                placeholder="Jane Smith"
              />
            </div>
          </div>
        </div>

        <div class="">
          <label
            for="username"
            class="text-tkorange block text-sm/6 font-medium"
          >
            Email
          </label>

          <div class="mt-2">
            <div
              class="bg-tkgreenpale outline-tkgreen/10 focus-within:outline-tkgreen flex items-center rounded-md pl-3 outline-1 -outline-offset-1 focus-within:outline-2 focus-within:-outline-offset-2"
            >
              <input
                disabled
                type="text"
                name="email"
                value={email}
                id="name"
                class="text-tkblack placeholder:text-tkbg/50 block min-w-0 grow bg-transparent py-1.5 pr-3 pl-1 text-base focus:outline-none sm:text-sm/6"
                placeholder="jane@thesmiths.com"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div class="mt-6 flex items-center justify-end gap-x-6">
    <button
      type="button"
      class="text-tkblack bg-tkorange hover:bg-tkgreenpale flex items-center rounded-md p-1.5 pr-3"
      onclick={auth.logout}
    >
      <LogOut class="size-6" />
      <span class="flex items-center">
        <span class="ml-4 text-sm/6 font-semibold" aria-hidden="true">
          Sign out
        </span>
      </span>
    </button>
  </div>

  <div class="absolute right-0 bottom-0 flex p-4">
    <button
      type="button"
      class="text-tkgreenpale lg:hidden"
      onclick={() => sidebar.open()}
    >
      <PanelRightOpen />
    </button>
  </div>
</form>
