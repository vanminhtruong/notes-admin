import './App.css';
import './i18n';
import { RouterProvider } from 'react-router-dom';
import router from '@routes/index';

function App() {
  return <RouterProvider router={router} />;
}

export default App;
