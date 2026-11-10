import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { viteSingleFile } from 'vite-plugin-singlefile'

// 開発用の入口は src/index.html。
// build すると、リポジトリ直下の index.html（1ファイル）に出力される → そのまま GitHub Pages で公開される。
export default defineConfig({
  root: 'src',
  base: './',
  plugins: [react(), tailwindcss(), viteSingleFile()],
  build: { outDir: '..', emptyOutDir: false },
})
