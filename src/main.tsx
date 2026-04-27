import { createRoot } from 'react-dom/client'
import './index.css'
import { BrowserRouter } from 'react-router'
import { TRPCProvider } from './providers/trpc'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <TRPCProvider>
      <App />
    </TRPCProvider>
  </BrowserRouter>
)
