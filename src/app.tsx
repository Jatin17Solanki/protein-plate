import { useEffect } from 'preact/hooks';
import { onLinkClick, useRoute } from './lib/router';
import { Home } from './screens/Home';
import { RecipeStub } from './screens/RecipeStub';
import site from '../site.config.json';

export function App() {
  const route = useRoute();
  useEffect(() => {
    addEventListener('click', onLinkClick);
    return () => removeEventListener('click', onLinkClick);
  }, []);
  useEffect(() => {
    document.title = site.title;
  }, [route]);

  if (route.name === 'recipe') return <RecipeStub id={route.id} />;
  if (route.name === 'notFound') return <RecipeStub id={null} />;
  return <Home />;
}
