import { recipes } from './lib/catalog';
import site from '../site.config.json';

// A1 placeholder: proves the build + deploy pipeline. Replaced by the Home grid in A2.
export function App() {
  const complete = recipes.filter((r) => r.status === 'complete').length;
  return (
    <main class="placeholder">
      <h1 class="logo">
        protein<span>/</span>plate
      </h1>
      <p class="count">
        <span class="num">{recipes.length}</span> {recipes.length === 1 ? 'recipe' : 'recipes'} in the catalog
      </p>
      {recipes.length > 0 && <p class="meta">{complete} complete · {recipes.length - complete} need details</p>}
      <p class="meta">The full site is on its way.</p>
      <p class="meta">
        <a href={`https://github.com/${site.owner}/${site.repo}`}>Source on GitHub</a>
      </p>
    </main>
  );
}
