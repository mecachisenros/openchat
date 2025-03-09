import { issuer } from "@openauthjs/openauth";
import { CodeUI } from "@openauthjs/openauth/ui/code";
import { CodeProvider } from "@openauthjs/openauth/provider/code";
import { MemoryStorage } from "@openauthjs/openauth/storage/memory";
import type { Theme } from "@openauthjs/openauth/ui/theme";
import { subjects } from "./subjects";
import { getOrCreateUserByEmail } from "@openchat/db";
// import { sendEmail } from "@openchat/mailer";

export const THEME: Theme = {
  title: "OpenChat",
  favicon: "http://localhost:5173/openchat.svg",
  radius: "md",
  logo: "http://localhost:5137/openchat.png",
  background: "#24283b",
  primary: "#b4f9f8",
};

export const auth = issuer({
  subjects,
  storage: MemoryStorage(),
  // Remove after setting custom domain
  allow: async () => true,
  providers: {
    code: CodeProvider(
      CodeUI({
        sendCode: async (claims, code) => {
          // sendEmail(claims.email, code);
          console.log(claims, code);
        },
      }),
    ),
  },
  success: async (ctx, value) => {
    if (value.provider === "code") {
      const userId = await getOrCreateUserByEmail(value.claims.email);

      if (!userId) {
        throw new Error("Failed to create user");
      }

      return ctx.subject(
        "user",
        {
          id: userId,
        },
        {
          subject: userId,
        },
      );
    }
    throw new Error("Invalid provider");
  },
  theme: THEME,
});
