function getRandomInt(min, max) {
  // 获取min和max之间的数，并且包括min或max
  return Math.floor(Math.random() * (max - min + 1) + min);
}

// 打乱数组
export function shuffle(arr) {
  // 让_arr成为arr的副本
  let _arr = arr.slice();
  for (let i = 0; i < _arr.length; i++) {
    let j = getRandomInt(0, i);
    let t = _arr[i];
    _arr[i] = _arr[j];
    _arr[j] = t;
  }
  return _arr;
}

// 节流
export function debounce(func, delay) {
  let timer;

  return function(...args) {
    if (timer) {
      clearTimeout(timer);
    }
    timer = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
}
