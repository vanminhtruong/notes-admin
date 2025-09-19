import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@/styles/global.css'
import { RouterProvider } from 'react-router-dom'
import router from '@routes/index'
import { Provider } from 'react-redux'
import { store } from '@store/index'
import './i18n'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <RouterProvider router={router} />
    </Provider>
  </StrictMode>,
)
