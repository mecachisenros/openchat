<script lang="ts">
  import { View } from "svelte-pilot";
  import AuthProvider from "../AuthProvider.svelte";
  import ZeroProvider from "../ZeroProvider.svelte";
  import SidebarProvider from "../SidebarProvider.svelte";
  import SearchProvider from "../SearchProvider.svelte";
  import { createSidebarContext } from "../sidebar.svelte";
  import { createSearchContext } from "../search.svelte";

  createSidebarContext();
  createSearchContext();
</script>

<div class="bg-tkbg">
  <svelte:boundary>
    <AuthProvider>
      <ZeroProvider>
        <div class="lg:pr-72">
          <main class="">
            <div class="mx-auto max-w-7xl px-4">
              <View />
              <SearchProvider />
            </div>
          </main>
        </div>

        <SidebarProvider />
      </ZeroProvider>
    </AuthProvider>
  </svelte:boundary>
</div>
