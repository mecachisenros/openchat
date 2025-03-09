# OpenChat

A demo chat app demonstrating [Zero](https://zero.rocicorp.dev/)'s sync capabilities.

### Requirements
- node
- docker
- pnpm
- [groq](https://groq.com/) api key, you can get a dev one [here](https://console.groq.com/keys)

### Instructions to run locally

From the root of the directory:

Install dependencies
```
pnpm i
```

Start the database with docker (wait for it to be ready)

```
pnpm db:up
```

In a second terminal, push the schema

```
pnpm db:init
```

Add your groq api key to the `.env` located at `packages/backend/.env`

Now we are ready to start the app

```
pnpm dev
```

You should be able to access the frontend at `http://localhost:5137`.

There's an api and auth server running at `http://localhost:3000`.

And lastly Zero cache is accessible at `http://localhost:4848`.

When signing in, check the terminal running the app, a pin code will be generated and printed to the console.

The frontend is a [Svelte](https://svelte.dev/) single page application, auth provided by [OpenAuth](https://openauth.js.org/), and the API is served by [Hono](https://hono.dev/).

