export function reindex(list, key) {
  return list.reduce((acc, item) => {
      acc[item[key]] = item;
      return acc;
  }, {});
}