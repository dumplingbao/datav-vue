import type { ConfigEnv } from 'vite'
import { loadEnv, defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

import plainText from 'vite-plugin-plain-text'
import styleImport from 'vite-plugin-style-import'

import { resolve } from 'path'

function pathResolve(dir: string) {
  return resolve(process.cwd(), '.', dir)
}

// https://vitejs.dev/config/
export default ({ mode }: ConfigEnv) => {
  const dirRoot = process.cwd()

  const env = loadEnv(mode, dirRoot)

  return defineConfig({
    base: env.VITE_PUBLIC_PATH,
    plugins: [
      vue(),
      plainText(/\.hbs$/),
      styleImport({
        libs: [{
          libraryName: 'element-plus',
          esModule: true,
          ensureStyleFile: true,
          resolveStyle: name => {
            return `element-plus/packages/theme-chalk/src/${name.slice(3)}.scss`
          },
        }],
      }),
    ],
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `$--color-primary: #2483ff;`,
        },
      },
    },
    server: {
      host: '0.0.0.0',
      port: 9090,
    },
    resolve: {
      alias: {
        '@': pathResolve('./src'),
        'vue-i18n': pathResolve('./node_modules/vue-i18n/dist/vue-i18n.cjs.js'),
      },
    },
    define: {
      // setting vue-i18-next
      // Suppress warning
      __INTLIFY_PROD_DEVTOOLS__: false,
      __DEV__: process.env.NODE_ENV !== 'production',
    },
    optimizeDeps: {
      include: [
        'accounting',
        'axios',
        'axios-mock-adapter',
        'crypto-js',
        'dayjs',
        'echarts',
        'element-plus',
        'gsap',
        'html2canvas',
        'js-cookie',
        'lodash-es',
        'mockjs',
        'monaco-editor',
        'particles.vue3',
        'shortid',
        'vue',
        'vue-i18n',
        'vue-router',
        'vuex',
        'vuex-module-decorators',
      ],
      exclude: [],
    },
    build: {
      sourcemap: false,
      outDir: 'website',
      rollupOptions: {
        input: {
          main: resolve(__dirname, 'index.html'),
          share: resolve(__dirname, 'share/index.html'),
        },
      },
    },
    esbuild: {
    },
  })
}
