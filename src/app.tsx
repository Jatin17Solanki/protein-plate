import { lazy, Suspense } from 'preact/compat';
import { useEffect } from 'preact/hooks';
import { onLinkClick, useRoute } from './lib/router';
import { Home } from './screens/Home';
import { Recipe } from './screens/Recipe';
import { MyRecipes } from './screens/MyRecipes';
import { Review } from './screens/Review';
import { Archive } from './screens/Archive';
import { Export } from './screens/Export';
import { Toast } from './components/Toast';
import { UpdatePrompt } from './components/UpdatePrompt';
import site from '../site.config.json';

// Add recipes carries the validator, schema, dictionary and prompt: loaded only when opened (precached for offline).
const AddRecipes = lazy(() => import('./screens/AddRecipes').then((m) => ({ default: m.AddRecipes })));

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
    : route.name === 'review' ? <Review />
    : route.name === 'archive' ? <Archive />
    : route.name === 'add' ? <Suspense fallback={<div class="my-page" />}><AddRecipes /></Suspense>
    : route.name === 'export' ? <Export />
    : route.name === 'notFound' ? <Recipe id={null} />
    : <Home />;
  return (
    <>
      {screen}
      <Toast />
      <UpdatePrompt />
    </>
  );
}
