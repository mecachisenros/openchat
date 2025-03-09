<script lang="ts">
  import Form from "./Form.svelte";
  import type { Props as FormProps } from "./Form.svelte";
  import { useAuth } from "./auth.svelte";

  type Props = {
    chatId: string;
  };

  let { chatId }: Props = $props();

  const auth = useAuth();

  const handleSubmit: FormProps["handleSubmit"] = async (data) => {
    await fetch(`${import.meta.env.VITE_API_URL}/chat/${chatId}`, {
      method: "post",
      body: data,
      headers: {
        Authorization: `Bearer ${auth.accessToken}`,
      },
    });
  };
</script>

<Form {handleSubmit} />
