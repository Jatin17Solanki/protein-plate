import { render } from 'preact';
import '../design/tokens.css';
import './styles/app.css';
import { App } from './app';
import { captureInstallPrompt } from './lib/install';

// Screens restore their own scroll (Home remembers where you were).
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

captureInstallPrompt();

render(<App />, document.getElementById('app')!);
