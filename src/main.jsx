import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './styles.css';

// No StrictMode: the engine owns a WebGL singleton and StrictMode's
// double-mount in dev would build the scene twice.
createRoot(document.getElementById('root')).render(<App />);
