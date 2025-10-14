import { StrictMode, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Enhanced dark theme application
const initializeDarkTheme = () => {
  // Force dark theme on document and body
  document.documentElement.classList.add('dark');
  document.body.classList.add('dark');
  
  // Set dark theme attributes
  document.documentElement.setAttribute('data-theme', 'dark');
  document.body.style.backgroundColor = 'rgb(17, 24, 39)'; // gray-900
  document.body.style.color = 'rgb(243, 244, 246)'; // gray-100
  
  // Apply dark theme to meta theme-color
  let metaThemeColor = document.querySelector('meta[name=theme-color]');
  if (!metaThemeColor) {
    metaThemeColor = document.createElement('meta');
    metaThemeColor.setAttribute('name', 'theme-color');
    document.getElementsByTagName('head')[0].appendChild(metaThemeColor);
  }
  metaThemeColor.setAttribute('content', '#111827');
};

// Initialize immediately
initializeDarkTheme();

// Re-apply on DOM changes (for dynamic content)
const observer = new MutationObserver(() => {
  if (!document.documentElement.classList.contains('dark')) {
    initializeDarkTheme();
  }
});

observer.observe(document.documentElement, {
  attributes: true,
  attributeFilter: ['class']
});

const AppWrapper = () => {
  useEffect(() => {
    // Ensure dark theme persists
    initializeDarkTheme();
    
    // Re-check every second to maintain dark theme
    const interval = setInterval(initializeDarkTheme, 1000);
    
    return () => {
      clearInterval(interval);
      observer.disconnect();
    };
  }, []);

  return <App />;
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppWrapper />
  </StrictMode>,
)
