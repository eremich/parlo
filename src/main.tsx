import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Shell } from './shell/Shell'
import { ShotView } from './shell/ShotView'
import { SHOT } from './store/shell'
import './styles/index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {SHOT ? <ShotView /> : <Shell />}
  </StrictMode>,
)
