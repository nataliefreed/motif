export function reindex(list, key) {
  return list.reduce((acc, item) => {
      acc[item[key]] = item;
      return acc;
  }, {});
}

export function toDegrees(radians) {
  radians = radians > 0 ? radians : 2*Math.PI + radians; //add 2PI if negative
  return radians * 180 / Math.PI;
}

export function mapValue(value, start1, stop1, start2, stop2) {
  return start2 + (stop2 - start2) * ((value - start1) / (stop1 - start1));
}
