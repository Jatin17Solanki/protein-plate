import { useEffect } from 'preact/hooks';
import { onLinkClick, useRoute } from './lib/router';
import { Home } from './screens/Home';
import { Recipe } from './screens/Recipe';
import { MyRecipes } from './screens/MyRecipes';
import site from '../site.config.json';

export function App() {
  const route = useRoute();
  useEffect(() => {
    addEventListener('click', onLinkClick);
    return () => removeEventListener('click', onLinkClick);
  }, []);
  useEffect(() => {
    if (route.name === 'home') document.title = site.title;
  }, [route]);

  if (route.name === 'recipe') return <Recipe key={route.id} id={route.id} />;
  if (route.name === 'myRecipes') return <MyRecipes />;
  if (route.name === 'notFound') return <Recipe id={null} />;
  return <Home />;
}
