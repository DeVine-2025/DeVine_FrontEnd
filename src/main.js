import { jsx as _jsx } from "react/jsx-runtime";
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@styles/index.css';
import App from './App';
const rootElement = document.getElementById('root');
if (rootElement) {
    createRoot(rootElement).render(_jsx(StrictMode, { children: _jsx(App, {}) }));
}
