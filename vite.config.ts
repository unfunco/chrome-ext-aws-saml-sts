import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
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
  plugins: [
    react(),
    crx({ manifest: manifest as ManifestV3Export }),
    viteStaticCopy({
      targets: [{ src: 'src/_locales/*', dest: '_locales' }],
    }),
  ],
  publicDir: resolve(__dirname, 'public'),
  resolve: {
    alias: [
      {
        find: /^@aws-sdk\/xml-builder$/,
        replacement: resolve(__dirname, 'src/utilities/aws-sdk-xml-builder.ts'),
      },
      {
        find: '@',
        replacement: SRC,
      },
    ],
  },
})
