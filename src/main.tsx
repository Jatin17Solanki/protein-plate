import { render } from 'preact';
import '../design/tokens.css';
import './styles/app.css';
import { App } from './app';

// Screens restore their own scroll (Home remembers where you were).
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

render(<App />, document.getElementById('app')!);
