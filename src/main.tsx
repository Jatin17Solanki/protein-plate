import { render } from 'preact';
import '../design/tokens.css';
import './styles/app.css';
import { App } from './app';

render(<App />, document.getElementById('app')!);
