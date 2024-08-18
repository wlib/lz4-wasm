import { defineConfig } from "vite";

export default defineConfig({
  build: {
    target: "esnext"
  },
  esbuild: {
    jsxFactory: "h",
    jsxFragment: "JSXFragment",
    jsxInject: `import { h, JSXFragment } from "bruh/dom"`
  },
  optimizeDeps: {
    esbuildOptions: {
      target: "esnext"
    }
  }
})
