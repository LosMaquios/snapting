export type IteratorFn<K, V> = (key: K, value: V) => void;

export function iterateMap(
  map: Map<any, any>,
  iterator: IteratorFn<any, any>,
) {
  for (const [key, value] of map) {
    iterator(key, value);
  }
}
