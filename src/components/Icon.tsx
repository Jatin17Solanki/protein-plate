import type { DishType } from '../lib/home';

// UI icons: Lucide-style, 24 grid, 2 px stroke (DESIGN §2).
const UI = {
  search: <><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></>,
  filters: <><path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12" /><circle cx="16" cy="6" r="2" /><circle cx="10" cy="12" r="2" /><circle cx="18" cy="18" r="2" /></>,
  plus: <path d="M12 5v14M5 12h14" />,
  bookmark: <path d="M6 3h12v18l-6-4-6 4z" />,
  back: <path d="M15 5l-7 7 7 7" />,
  x: <path d="M6 6l12 12M18 6L6 18" />,
  pencil: <path d="M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16zM13.5 6.5l4 4" />,
  share: <path d="M12 3v12M7 8l5-5 5 5M5 13v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6" />,
  thumbsUp: <path d="M7 10v11H4V10zM7 10l4-7a2.5 2.5 0 0 1 3 3l-1 4h5.5a2 2 0 0 1 2 2.4l-1.4 7A2 2 0 0 1 17.1 21H7" />,
  thumbsDown: <path d="M17 14V3h3v11zM17 14l-4 7a2.5 2.5 0 0 1-3-3l1-4H5.5a2 2 0 0 1-2-2.4l1.4-7A2 2 0 0 1 6.9 3H17" />,
  reset: <><path d="M3 12a9 9 0 1 0 3-6.7L3 8" /><path d="M3 3v5h5" /></>,
  info: <><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8h.01" /></>,
};

/** Filled variants: bookmark when on My list, play for Watch video. */
export function FilledIcon({ name, size = 20 }: { name: 'bookmark' | 'play'; size?: number }) {
  return (
    <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linejoin="round">
      <path d={name === 'bookmark' ? 'M6 3h12v18l-6-4-6 4z' : 'M7 4.5v15l13-7.5z'} />
    </svg>
  );
}

export function UiIcon({ name, size = 20, strokeWidth = 2 }: { name: keyof typeof UI; size?: number; strokeWidth?: number }) {
  return (
    <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width={strokeWidth} stroke-linecap="round" stroke-linejoin="round">
      {UI[name]}
    </svg>
  );
}

export function MenuIcon({ size = 20 }: { size?: number }) {
  return (
    <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <circle cx="5" cy="12" r="1.8" /><circle cx="12" cy="12" r="1.8" /><circle cx="19" cy="12" r="1.8" />
    </svg>
  );
}

// Dish-type icons: outline, 1.4 px stroke. First nine from design/mockups; chaat, paratha, dessert, sauce drawn to match.
const BOWL = 'M4 12h16a8 8 0 0 1-16 0zM8 8c0-2 2-2 2-4M13 8c0-2 2-2 2-4';
export const DISH_ICON: Record<DishType, string> = {
  sandwich_toast: 'M4 18L12 5l8 13zM7 14h10',
  salad_bowl: 'M4 12h16a8 8 0 0 1-16 0zM9 12c0-3 1-5 3-6M15 12c0-2-1-4-3-6',
  wrap_roll_taco: 'M5 17L17 5l2 2L7 19zM9 9l6 6',
  kebab_tikki_cutlet: 'M3 21L21 3M6.5 15a2.5 2.5 0 1 0 5 0a2.5 2.5 0 1 0-5 0M12 9.5a2.5 2.5 0 1 0 5 0a2.5 2.5 0 1 0-5 0',
  chilla_pancake_omelette: 'M4 14c0-3 4-5 8-5s8 2 8 5-4 5-8 5-8-2-8-5zM8 13h8',
  curry_sabzi: 'M5 10h14v6a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4zM3 10h18M9 6c0-1 1-1 1-2M14 6c0-1 1-1 1-2',
  rice_pulao_biryani: 'M4 12h16a8 8 0 0 1-16 0zM8 10l1-2M12 10V7M16 10l-1-2',
  pasta_noodles: 'M4 12h16a8 8 0 0 1-16 0zM9 12V4M13 12V3',
  pizza: 'M12 21L3 6a14 14 0 0 1 18 0zM10 9.5a1 1 0 1 0 0.01 0M14 12.5a1 1 0 1 0 0.01 0',
  chaat: 'M3 11h18l-4 8H7zM8.5 8a1 1 0 1 0 0.01 0M12 6a1 1 0 1 0 0.01 0M15.5 8a1 1 0 1 0 0.01 0',
  paratha: 'M4 12a8 8 0 1 0 16 0a8 8 0 1 0-16 0M8 10c2.5-1.5 5.5-1.5 8 0M8 14c2.5 1.5 5.5 1.5 8 0',
  dessert: 'M5 11h14l-2 9H7zM5 11a7 5 0 0 1 14 0M12 3v3',
  sauce_dip: 'M10 3h4v4l2 3v10a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1V10l2-3zM8 14h8',
};

export function DishIcon({ type, size }: { type: DishType | null; size: number }) {
  return (
    <svg aria-hidden="true" class="dish-icon" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">
      <path d={type ? DISH_ICON[type] : BOWL} />
    </svg>
  );
}
