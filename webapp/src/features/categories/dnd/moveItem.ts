/**
 * moveItem utility
 * Reordena un array moviendo un item de una posición a otra.
 */
export function moveItem<T>(items: T[], fromIndex: number, toIndex: number): T[] {
  const result = [...items];
  const [removed] = result.splice(fromIndex, 1);
  result.splice(toIndex, 0, removed);
  return result;
}
