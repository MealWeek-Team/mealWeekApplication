import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { GoogleOAuthProvider } from '@react-oauth/google'
import './index.css'
import App from './App.tsx'
import { AuthProvider } from './auth/AuthProvider.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
      <GoogleOAuthProvider clientId={import.meta.env.GOOGLE_CLIENT_ID || ''}>
          <BrowserRouter>
              <AuthProvider>
                  <App />
              </AuthProvider>
          </BrowserRouter>
      </GoogleOAuthProvider>
  </StrictMode>,
)