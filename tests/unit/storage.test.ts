// @vitest-environment happy-dom
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  clearTicks, getMyList, getNote, getReaction, getTicks, readDisliked, readMyList, setNote, setOnMyList, setReaction,
  setTick, subscribe,
} from '../../src/lib/storage';

beforeEach(() => localStorage.clear());

describe('storage', () => {
  it('My list: add puts newest first, no duplicates, remove', () => {
    setOnMyList('a', true);
    setOnMyList('b', true);
    setOnMyList('a', true);
    expect(getMyList()).toEqual(['a', 'b']);
    expect(JSON.parse(localStorage.getItem('pp.mylist')!)).toEqual(['a', 'b']);
    setOnMyList('a', false);
    expect([...readMyList()]).toEqual(['b']);
  });

  it('reactions: like/dislike are exclusive per recipe; null clears', () => {
    setReaction('a', 'like');
    setReaction('a', 'dislike');
    setReaction('b', 'like');
    expect(getReaction('a')).toBe('dislike');
    expect([...readDisliked()]).toEqual(['a']);
    setReaction('a', null);
    expect(getReaction('a')).toBeNull();
    expect(JSON.parse(localStorage.getItem('pp.reactions')!)).toEqual({ b: 'like' });
  });

  it('notes: saved per recipe; empty text removes the entry', () => {
    setNote('a', 'Half the chilli');
    expect(getNote('a')).toBe('Half the chilli');
    setNote('a', '   ');
    expect(getNote('a')).toBe('');
    expect(JSON.parse(localStorage.getItem('pp.notes')!)).toEqual({});
  });

  it('ticks: per recipe, sorted, clear resets only that recipe', () => {
    setTick('a', 3, true);
    setTick('a', 0, true);
    setTick('a', 3, true);
    setTick('b', 1, true);
    expect(getTicks('a')).toEqual([0, 3]);
    setTick('a', 0, false);
    expect(getTicks('a')).toEqual([3]);
    clearTicks('a');
    expect(getTicks('a')).toEqual([]);
    expect(getTicks('b')).toEqual([1]);
  });

  it('survives corrupt or unexpected stored values', () => {
    localStorage.setItem('pp.mylist', '{not json');
    localStorage.setItem('pp.reactions', JSON.stringify({ a: 'love', b: 'like' }));
    localStorage.setItem('pp.ticks', JSON.stringify({ a: ['x', 2] }));
    localStorage.setItem('pp.notes', JSON.stringify([1, 2]));
    expect(getMyList()).toEqual([]);
    expect(getReaction('a')).toBeNull();
    expect(getReaction('b')).toBe('like');
    expect(getTicks('a')).toEqual([2]);
    expect(getNote('a')).toBe('');
  });

  it('notifies subscribers on every write and asks for persistent storage once', () => {
    const persist = vi.fn(() => Promise.resolve(true));
    Object.defineProperty(navigator, 'storage', { value: { persist }, configurable: true });
    const fn = vi.fn();
    const off = subscribe(fn);
    setOnMyList('a', true);
    setNote('a', 'x');
    off();
    setNote('a', 'y');
    expect(fn).toHaveBeenCalledTimes(2);
    expect(persist.mock.calls.length).toBeLessThanOrEqual(1);
  });
});
