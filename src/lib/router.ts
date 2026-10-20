// Tiny history router. Paths are relative to the site base (import.meta.env.BASE_URL, e.g. /protein-plate/).
// GitHub Pages serves 404.html (a copy of index.html) for deep links until A6 builds static /r/<id>/ pages.
import { useEffect, useState } from 'preact/hooks';

const BASE = import.meta.env.BASE_URL;

export type Route = { name: 'home' } | { name: 'recipe'; id: string } | { name: 'notFound' };

export function parse(pathname: string, base = BASE): Route {
  if (`${pathname}/` === base) return { name: 'home' };
  const path = pathname.startsWith(base) ? pathname.slice(base.length) : pathname.replace(/^\//, '');
  const clean = path.replace(/\/+$/, '');
  if (clean === '' || clean === 'index.html') return { name: 'home' };
  const m = clean.match(/^r\/([a-z0-9-]+)$/);
  return m ? { name: 'recipe', id: m[1] } : { name: 'notFound' };
}

export const href = {
  home: () => BASE,
  recipe: (id: string) => `${BASE}r/${id}/`,
};

export function navigate(url: string) {
  history.pushState(null, '', url);
  dispatchEvent(new PopStateEvent('popstate'));
  scrollTo(0, 0);
}

/** Intercepts same-origin <a> clicks inside the app so navigation doesn't reload the page. */
export function onLinkClick(e: MouseEvent) {
  if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
  const a = (e.target as Element).closest('a');
  if (!a || a.target || a.origin !== location.origin || !a.pathname.startsWith(BASE)) return;
  e.preventDefault();
  navigate(a.pathname + a.search);
}

export function useRoute(): Route {
  const [route, setRoute] = useState(() => parse(location.pathname));
  useEffect(() => {
    const update = () => setRoute(parse(location.pathname));
    addEventListener('popstate', update);
    return () => removeEventListener('popstate', update);
  }, []);
  return route;
}
