import { useEffect } from 'preact/hooks';
import { onLinkClick, useRoute } from './lib/router';
import { Home } from './screens/Home';
import { Recipe } from './screens/Recipe';
import { MyRecipes } from './screens/MyRecipes';
import { Toast } from './components/Toast';
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

  const screen =
    route.name === 'recipe' ? <Recipe key={route.id} id={route.id} />
    : route.name === 'myRecipes' ? <MyRecipes />
    : route.name === 'notFound' ? <Recipe id={null} />
    : <Home />;
  return (
    <>
      {screen}
      <Toast />
    </>
  );
}
