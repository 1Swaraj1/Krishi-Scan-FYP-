import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import { LanguageProvider } from "./context/LanguageContext";

ReactDOM.createRoot(document.getElementById('root')).render(
<BrowserRouter>
  <LanguageProvider>
    <App />
  </LanguageProvider>
</BrowserRouter>
)