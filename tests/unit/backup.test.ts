// @vitest-environment happy-dom
import { beforeEach, describe, expect, it } from 'vitest';
import {
  backupFileName, cleanData, conflicts, currentData, makeBackup, merge, parseBackup, summarize, type BackupData,
} from '../../src/lib/backup';
import { getTheme, setNote, setOnMyList, setReaction, writeAll } from '../../src/lib/storage';

const data = (o: Partial<BackupData>): BackupData => ({ mylist: [], reactions: {}, notes: {}, ticks: {}, theme: null, hintDismissed: false, ...o });

beforeEach(() => {
  localStorage.clear();
  document.documentElement.removeAttribute('data-theme');
});

describe('backup round trip', () => {
  it('reads every pp.* key and parses its own output', () => {
    setOnMyList('a', true);
    setReaction('b', 'dislike');
    setNote('a', 'hi');
    localStorage.setItem('pp.theme', 'dark');
    const file = makeBackup(currentData(), new Date('2026-10-20T10:00:00Z'));
    expect(file).toMatchObject({ kind: 'protein-plate-backup', version: 1, exported_at: '2026-10-20T10:00:00.000Z' });
    expect(parseBackup(JSON.stringify(file))).toEqual(data({ mylist: ['a'], reactions: { b: 'dislike' }, notes: { a: 'hi' }, theme: 'dark' }));
    expect(backupFileName(new Date('2026-10-20T10:00:00Z'))).toBe('protein-plate-backup-2026-10-20.json');
  });

  it('rejects files that are not backups, with a readable reason', () => {
    expect(() => parseBackup('nope')).toThrow(/isn't valid JSON/);
    expect(() => parseBackup('{"a":1}')).toThrow(/isn't a Protein Plate backup/);
    expect(() => parseBackup('{"kind":"protein-plate-backup","version":2,"data":{}}')).toThrow(/newer version/);
  });

  it('drops malformed entries', () => {
    expect(cleanData({ mylist: ['a', 'a', 3], reactions: { a: 'love', b: 'like' }, notes: { a: '', b: 'x' }, ticks: { a: ['x'], b: [1] }, theme: 'pink' }))
      .toEqual(data({ mylist: ['a'], reactions: { b: 'like' }, notes: { b: 'x' }, ticks: { b: [1] } }));
  });
});

describe('merge', () => {
  const mine = data({ mylist: ['a', 'b'], reactions: { a: 'like', c: 'like' }, notes: { a: 'mine' }, ticks: { a: [1] }, theme: 'dark' });
  const theirs = data({ mylist: ['b', 'z'], reactions: { a: 'dislike', d: 'dislike' }, notes: { a: 'theirs', e: 'new' }, ticks: { a: [2], f: [0] }, theme: 'light' });

  it('finds where both sides differ', () => {
    expect(conflicts(mine, theirs)).toEqual([{ kind: 'reaction', id: 'a' }, { kind: 'note', id: 'a' }]);
    expect(conflicts(mine, mine)).toEqual([]);
  });

  it('keeps mine on conflicts but fills gaps from the backup', () => {
    expect(merge(mine, theirs, 'mine')).toEqual({
      mylist: ['a', 'b', 'z'],
      reactions: { a: 'like', c: 'like', d: 'dislike' },
      notes: { a: 'mine', e: 'new' },
      ticks: { a: [1], f: [0] },
      theme: 'dark',
      hintDismissed: false,
    });
  });

  it('or takes the backup on conflicts', () => {
    const m = merge(mine, theirs, 'backup');
    expect(m.reactions.a).toBe('dislike');
    expect(m.notes.a).toBe('theirs');
  });

  it('writeAll stores everything and applies the theme', () => {
    writeAll(merge(data({}), theirs, 'backup'));
    expect(currentData()).toMatchObject({ mylist: ['b', 'z'], notes: { a: 'theirs', e: 'new' }, theme: 'light' });
    expect(getTheme()).toBe('light');
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
    expect(summarize(currentData())).toBe('2 on My list, 2 likes/dislikes, 2 notes');
  });
});
