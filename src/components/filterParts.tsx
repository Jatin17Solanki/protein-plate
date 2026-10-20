import type { SortKey } from '../lib/home';

export function toggle<T>(list: T[], item: T): T[] {
  return list.includes(item) ? list.filter((x) => x !== item) : [...list, item];
}

export function SortOptions({ name, value, onChange }: { name: string; value: SortKey; onChange: (s: SortKey) => void }) {
  const opts: [SortKey, string][] = [['protein', 'Protein per portion, high to low'], ['kcal', 'Calories, low to high']];
  return (
    <div class="radio-list">
      {opts.map(([key, label]) => (
        <label key={key} class="radio-row">
          <input type="radio" name={name} checked={value === key} onChange={() => onChange(key)} />
          {label}
        </label>
      ))}
    </div>
  );
}
