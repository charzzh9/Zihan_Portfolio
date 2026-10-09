import React, { lazy, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './styles.css';

const StudioScene = lazy(() => import('./StudioScene.jsx'));
const studio = new URLSearchParams(window.location.search).has('studio');

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {studio ? <Suspense fallback={null}><StudioScene /></Suspense> : <App />}
  </React.StrictMode>,
);
