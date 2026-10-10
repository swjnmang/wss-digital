import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
// Globales Stylesheet zuerst laden, damit die CSS-Module der Seiten es gezielt überschreiben können
import './main.css'
import App from './App'

const root = document.getElementById('root') as HTMLElement

createRoot(root).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
)
