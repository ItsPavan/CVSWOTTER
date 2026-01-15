import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'

const root = createRoot(document.getElementById('root'));

try {
  root.render(
    <StrictMode>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </StrictMode>,
  )
} catch (e) {
  root.render(
    <div style={{ color: 'red', padding: '20px', fontSize: '24px' }}>
      <h1>Application Crashed</h1>
      <pre>{e.message}</pre>
      <pre>{e.stack}</pre>
    </div>
  )
}

window.addEventListener('error', (event) => {
  document.body.innerHTML += `<div style="color: red; padding: 20px; z-index: 9999; position: fixed; top: 0; background: black;">
        <h1>Global Error</h1>
        <p>${event.message}</p>
    </div>`;
});
