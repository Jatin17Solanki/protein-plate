import type { Tile as TileData } from '../lib/home';
import { href } from '../lib/router';
import { DishIcon } from './Icon';

export function Tile({ tile }: { tile: TileData }) {
  const label = `${tile.title}, ${tile.protein === '—' ? 'protein unknown' : `${tile.protein} g protein`}, ${tile.meta}${tile.versions > 1 ? `, ${tile.versions} versions` : ''}${tile.uses ? `, uses ${tile.uses}` : ''}`;
  return (
    <a class="tile" href={href.recipe(tile.id)} data-tint={tile.tint} aria-label={label}>
      <div class="tile-top">
        <div class="tile-protein">
          <span class="num">{tile.protein}</span>
          {tile.protein !== '—' && <span class="unit">g</span>}
        </div>
        <DishIcon type={tile.dishType} size={40} />
      </div>
      <div class="tile-bottom">
        <div class="tile-name">{tile.title}</div>
        {tile.meta && <div class="tile-meta">{tile.meta}</div>}
        {tile.versions > 1 && <span class="tile-badge">{tile.versions} versions</span>}
        {tile.uses && <span class="uses-badge">uses {tile.uses}</span>}
      </div>
    </a>
  );
}
