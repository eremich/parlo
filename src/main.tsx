import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Shell } from './shell/Shell'
import './styles/index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Shell />
  </StrictMode>,
)
