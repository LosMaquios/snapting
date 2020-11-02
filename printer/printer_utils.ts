export const { toISOString } = Date.prototype;

export function getConstructorName<T extends object>(
  obj: T,
  defaultName: string,
) {
  return (
    obj.constructor.name ??
      defaultName
  );
}
