import { createClient } from "@openauthjs/openauth/client";
import { getContext, setContext } from "svelte";
import { SvelteURLSearchParams } from "svelte/reactivity";

export const AUTH_CONTEXT_KEY = "auth";
const AUTH_ACCESS_TOKEN_KEY = "auth_access_token";
const AUTH_REFRESH_TOKEN_KEY = "auth_refresh_token";

export const AUTH_ISSUER_URL = import.meta.env.VITE_AUTH_URL;
export const AUTH_API_URL = import.meta.env.VITE_API_URL;

const client = createClient({
  clientID: "frontend",
  issuer: AUTH_ISSUER_URL,
});

export class Auth {
  #userId = $state<string>();
  #loggedIn = $derived(!!this.#userId);
  #query = new SvelteURLSearchParams(location.search);
  #code = $derived(this.#query.get("code"));
  #state = $derived(this.#query.get("state"));

  constructor() {
    $effect(() => {
      if (this.#code && this.#state) {
        this.#callback(this.#code, this.#state);
      }

      this.authenticate();
    });
  }

  get userId() {
    return this.#userId;
  }

  get loggedIn() {
    return this.#loggedIn;
  }

  get accessToken(): string | null {
    return localStorage.getItem(AUTH_ACCESS_TOKEN_KEY) || null;
  }

  set accessToken(token: string) {
    localStorage.setItem(AUTH_ACCESS_TOKEN_KEY, token);
  }

  get refreshToken(): string | null {
    return localStorage.getItem(AUTH_REFRESH_TOKEN_KEY) || null;
  }

  set refreshToken(token: string) {
    localStorage.setItem(AUTH_REFRESH_TOKEN_KEY, token);
  }

  async login() {
    const { url } = await client.authorize(location.origin, "code");
    location.href = url;
  }

  async logout() {
    localStorage.removeItem(AUTH_ACCESS_TOKEN_KEY);
    localStorage.removeItem(AUTH_REFRESH_TOKEN_KEY);
    window.location.href = "/";
  }

  async #callback(code: string, state: string) {
    if (code && state) {
      const exchange = await client.exchange(code, location.origin);

      if (exchange.err) {
        console.log("exchange err", exchange.err);
      }

      if (!exchange.err) {
        this.accessToken = exchange.tokens.access;
        this.refreshToken = exchange.tokens.refresh;
        window.location.href = "/";
      }
    }
  }

  async #refreshTokens() {
    if (!this.refreshToken) {
      return;
    }

    if (!this.accessToken) {
      return;
    }

    const next = await client.refresh(this.refreshToken, {
      access: this.accessToken,
    });

    if (next.err) {
      console.log(next.err);
    }

    if (!next.err) {
      if (next.tokens) {
        this.accessToken = next.tokens.access;
        this.refreshToken = next.tokens.refresh;
      }
    }
  }

  async authenticate() {
    await this.#refreshTokens();

    if (!this.accessToken) {
      return;
    }

    const response = await fetch(`${AUTH_API_URL}/user`, {
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
      },
    });

    if (response.ok) {
      this.#userId = await response.text();
    } else {
      this.#userId = undefined;
    }
    return this;
  }
}

export function createAuthContext(auth: Auth) {
  return setContext<Auth>(AUTH_CONTEXT_KEY, auth);
}

export function useAuth() {
  return getContext<Auth>(AUTH_CONTEXT_KEY);
}
