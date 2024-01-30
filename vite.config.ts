import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import postcssConfig from './postcss.config'
import { crx, ManifestV3Export } from '@crxjs/vite-plugin'
import manifest from './src/manifest'
import { viteStaticCopy } from 'vite-plugin-static-copy'

const SRC = resolve(__dirname, 'src')

// noinspection JSUnusedGlobalSymbols
export default defineConfig({
  build: {
    emptyOutDir: true,
    outDir: resolve(__dirname, 'dist'),
    rollupOptions: {
      input: {
        bg: resolve(SRC, 'bg', 'index.ts'),
        popup: resolve(SRC, 'popup', 'index.html'),
      },
      output: {
        entryFileNames: (chunkInfo): string => `src/${chunkInfo.name}/index.js`,
      },
      treeshake: {
        moduleSideEffects: 'no-external',
        preset: 'recommended',
        propertyReadSideEffects: false,
        tryCatchDeoptimization: false,
      },
    },
  },
  css: {
    postcss: postcssConfig,
  },
  plugins: [
    react(),
    crx({ manifest: manifest as ManifestV3Export }),
    viteStaticCopy({
      targets: [{ src: 'src/_locales/*', dest: '_locales' }],
    }),
  ],
  publicDir: resolve(__dirname, 'public'),
  resolve: {
    alias: {
      '@': SRC,
    },
  },
})
