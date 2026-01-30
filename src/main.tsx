import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { ErrorBoundary } from "./components/ErrorBoundary";

import { HelmetProvider } from 'react-helmet-async';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Global Chunk Load Error Handler
window.addEventListener('error', (e) => {
  // Check specifically for Vite/Rollup chunk load errors
  if (/Loading chunk [\d]+ failed/.test(e.message) || /Failed to fetch dynamically imported module/.test(e.message)) {
    e.preventDefault();
    console.warn("Chunk load failed, reloading page...");
    window.location.reload();
  }
});

if (!supabaseUrl || !supabaseAnonKey) {
  createRoot(document.getElementById("root")!).render(
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontFamily: 'system-ui, sans-serif', backgroundColor: '#f9f9f9', padding: '20px' }}>
      <div style={{ maxWidth: '500px', backgroundColor: 'white', padding: '30px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
        <h1 style={{ color: '#dc2626', marginTop: 0 }}>Configuration Missing</h1>
        <p style={{ color: '#4b5563', lineHeight: '1.5' }}>
          This application requires Supabase connection details to function.
        </p>
        <p style={{ color: '#4b5563', lineHeight: '1.5' }}>
          Please create a <code>.env</code> file in the project root with the following keys:
        </p>
        <pre style={{ backgroundColor: '#1f2937', color: '#f3f4f6', padding: '15px', borderRadius: '6px', overflowX: 'auto', fontSize: '14px' }}>
VITE_SUPABASE_URL=YOUR_URL
VITE_SUPABASE_ANON_KEY=YOUR_KEY</pre>
        <button onClick={() => window.location.reload()} style={{ marginTop: '20px', padding: '10px 20px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '14px' }}>
          Reload Page
        </button>
      </div>
    </div>
  );
} else {
  createRoot(document.getElementById("root")!).render(
    <HelmetProvider>
        <ErrorBoundary>
            <App />
        </ErrorBoundary>
    </HelmetProvider>
  );
}
