import storage from 'good-storage';

const SEARCH_KEY = '__search__';
const SEARCH_MAX_LENGTH = 15;

// 插入数组(数组, 值, 比较函数, 最大值)
function insertArray(arr, val, compare, maxLen) {
  const index = arr.findIndex(compare);
  if (index === 0) {
    return;
  }
  if (index > 0) {
    arr.splice(index, 1);
  }
  arr.unshift(val); // 插在第一个位置
  if (maxLen && arr.length > maxLen) {
    arr.pop(); // 删除数组最后一个元素
  }
}

function deleteFromArray(arr, compare) {
  const index = arr.findIndex(compare);
  if (index > -1) {
    arr.splice(index, 1);
  }
}

export function saveSearch(query) {
  // 当前列表,后边是如果取不到，返回的默认值
  let searches = storage.get(SEARCH_KEY, []);
  insertArray(
    searches,
    query,
    item => {
      return item === query;
    },
    SEARCH_MAX_LENGTH
  );
  storage.set(SEARCH_KEY, searches);
  return searches;
}

export function loadSearch() {
  return storage.get(SEARCH_KEY, []);
}

export function deleteSearch(query) {
  let searches = storage.get(SEARCH_KEY, []);
  deleteFromArray(searches, item => {
    return item === query;
  });
  storage.set(SEARCH_KEY, searches);
  return searches;
}

export function clearSearch() {
  storage.remove(SEARCH_KEY);
  return [];
}
