// Synonym groups for search (DESIGN §6: "dahi = curd, besan = gram flour…").
// Source of truth is data/ingredients.json from Track B (name + aliases); until it exists this stub covers the
// common Hindi/English pairs. Both are merged, so the stub can stay as a safety net.
const STUB: string[][] = [
  ['curd', 'dahi'],
  ['besan', 'gram flour', 'chickpea flour'],
  ['turmeric', 'haldi'],
  ['cumin', 'jeera'],
  ['peas', 'matar', 'green peas'],
  ['potato', 'aloo'],
  ['coriander', 'dhaniya', 'cilantro'],
  ['rajma', 'kidney beans'],
  ['chickpeas', 'chana', 'chole', 'kabuli chana'],
  ['paneer', 'cottage cheese'],
  ['soya', 'soy', 'soya chunks', 'nutrela'],
  ['onion', 'pyaz', 'pyaaz'],
  ['tomato', 'tamatar'],
  ['garlic', 'lahsun', 'lasun', 'lasooni'],
  ['ginger', 'adrak'],
  ['spinach', 'palak'],
  ['capsicum', 'bell pepper', 'shimla mirch'],
  ['carom seeds', 'ajwain'],
  ['mint', 'pudina'],
  ['yogurt', 'yoghurt'],
  ['moong', 'mung'],
  ['masoor', 'red lentils'],
  ['toor', 'arhar', 'pigeon peas'],
  ['urad', 'black gram'],
];

interface DictEntry {
  id?: string;
  name?: string;
  aliases?: string[];
}

const files = import.meta.glob<DictEntry[] | { ingredients?: DictEntry[] }>('../../data/ingredients.json', {
  eager: true,
  import: 'default',
});

/** Turns dictionary entries into synonym groups: [name, id as words, ...aliases]. */
export function groupsFromDictionary(entries: DictEntry[]): string[][] {
  return entries
    .map((e) => [e.name, e.id?.replace(/_/g, ' '), ...(Array.isArray(e.aliases) ? e.aliases : [])])
    .map((g) => [...new Set(g.filter((x): x is string => typeof x === 'string' && x.trim() !== '').map((x) => x.toLowerCase().trim()))])
    .filter((g) => g.length > 1);
}

function dictionaryGroups(): string[][] {
  const data = Object.values(files)[0];
  const entries = Array.isArray(data) ? data : Array.isArray(data?.ingredients) ? data.ingredients : [];
  return groupsFromDictionary(entries);
}

export const synonymGroups: string[][] = [...dictionaryGroups(), ...STUB];
