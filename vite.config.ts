import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

const reactPkg = path.resolve('./node_modules/react')
const reactDomPkg = path.resolve('./node_modules/react-dom')
const emotionReact = path.resolve('./node_modules/@emotion/react')
const emotionStyled = path.resolve('./node_modules/@emotion/styled')

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      'react': reactPkg,
      'react-dom': reactDomPkg,
      'react/jsx-runtime': `${reactPkg}/jsx-runtime`,
      'react/jsx-dev-runtime': `${reactPkg}/jsx-dev-runtime`,
      '@emotion/react': emotionReact,
      '@emotion/styled': emotionStyled,
    },
    dedupe: ['react', 'react-dom', 'react-router-dom', '@emotion/react', '@emotion/styled'],
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-dom/client',
      'react/jsx-runtime',
      'react-router-dom',
      '@mui/material',
      '@mui/icons-material',
      '@emotion/react',
      '@emotion/styled',
    ],
    force: true,
  },
})
