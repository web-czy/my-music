export function addClass(el, className1) {
  if (hasClass(el, className1)) {
    return;
  }
  let newClass = el.className.split(' ');
  newClass.push(className1);
  el.className = newClass.join(' ');
}

export function hasClass(el, className2) {
  let reg = new RegExp('(^|\\s)' + className2 + '(\\s|$)');
  return reg.test(el.className);
}

export function getData(el, name, val) {
  const prefix = 'data-';
  name = prefix + name;
  if (val) {
    return el.setAttribute(name, val);
  } else {
    return el.getAttribute(name);
  }
}

let elementStyle = document.createElement('div').style;

let vendor = (() => {
  let transformNames = {
    webkit: 'webkitTransform',
    Moz: 'MozTransform',
    O: 'OTransform',
    ms: 'msTransform',
    standard: 'transform'
  };

  for (let key in transformNames) {
    // 返回当前浏览器供应商
    if (elementStyle[transformNames[key]] !== undefined) {
      return key;
    }
  }

  return false;
})();

export function prefixStyle(style) {
  if (vendor === false) {
    return false;
  }
  if (vendor === 'standard') {
    return 'style';
  }
  // 供应商名字 + style首字母大写 + style首字母之后的字段
  return vendor + style.charAt(0).toUpperCase() + style.substr(1);
}
