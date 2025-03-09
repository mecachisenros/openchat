import { getContext } from "svelte";
import { CTX_ROUTER, Router } from "svelte-pilot";

export const router = new Router({
  base: "/",
  callLoadOnClient: true,
  routes: [
    {
      component: () => import("./views/AppLayout.svelte"),
      children: [
        {
          path: "/",
          beforeEnter: () => {
            return "/chat";
          },
        },
        {
          path: "/profile",
          component: () => import("./views/Profile.svelte"),
        },
        {
          component: () => import("./views/Chat.svelte"),
          children: [
            {
              path: "/chat",
            },
            {
              name: "form",
              component: () => import("./NewChatForm.svelte"),
            },
            [
              {
                path: "/chat/:chatId",
                component: () => import("./views/ChatID.svelte"),
                props: (route) => ({ chatId: route.params.string("chatId") }),
              },
              {
                name: "form",
                component: () => import("./ChatForm.svelte"),
                props: (route) => ({ chatId: route.params.string("chatId") }),
              },
            ],
          ],
        },
      ],
    },
  ],
});

export function useRouter() {
  return getContext<Router>(CTX_ROUTER);
}
