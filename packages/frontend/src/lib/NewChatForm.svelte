<script lang="ts">
  import Form from "./Form.svelte";
  import type { Props as FormProps } from "./Form.svelte";
  import { useAuth } from "./auth.svelte";
  import { useRouter } from "./router";
  import { useSidebar } from "./sidebar.svelte";

  const auth = useAuth();

  const router = useRouter();
  const sidebar = useSidebar();

  router.on("update", () => {
    sidebar.close();
  });

  const handleSubmit: FormProps["handleSubmit"] = async (data) => {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/chat`, {
      method: "post",
      body: data,
      headers: {
        Authorization: `Bearer ${auth.accessToken}`,
      },
    });

    const payload = (await res.json()) as { chatId: string };

    router.push(`/chat/${payload.chatId}`);
  };
</script>

<Form {handleSubmit} />
