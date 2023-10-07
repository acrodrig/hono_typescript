# Hono Typescript

Very simple Typescript Middleware for Hono. You can write TS at the back end have the 
middleware compile it just-in-time before it goes to the browser.

Used Deno emit for compilation and the Deno runtime for execution.

Only use for development. For production, you should bundle the transpiled files.


## Usage

Add the middleware to your Hono app, and it will compile any TS files on the fly. Example
below from Hono [samples](https://github.com/honojs/examples/blob/main/serve-static/src/index.ts). 
If there are Typescript files in the static folder they will be transpiled on the fly.

```typescript
import { Hono } from 'hono'
import { serveStatic } from "hono/middleware.ts"
import { transpiler } from "hono_typescript/mod.ts"

const app = new Hono()

// Add the transpiler middleware to the app
app.use("*", transpiler());


app.use('/static/*', serveStatic({ root: './' }))
app.use('/favicon.ico', serveStatic({ path: './favicon.ico' }))
app.get('/', (c) => c.text('This is Home! You can access: /static/hello.txt'))
```


## Notes

- The middleware will only transpile files that end in `.ts` or `.tsx`
- The middleware has a cache of the transpiled files so it will only transpile once
- Cache grows unbounded so only use for development
- Does not work yet for JSX/TSX
- Will watch [PR139](https://github.com/denoland/deno_emit/pull/139) from Deno [emit](https://github.com/denoland/deno_emit) to allow for JSX/TSX transpiling.


## License

MIT
