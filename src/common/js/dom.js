export function addClass(el, className1) {
  if (hasClass(el, className1)) {
    return
  }
  let newClass = el.className.split(' ')
  newClass.push(className1)
  el.className = newClass.join(' ')
}

export function hasClass(el, className2) {
  let reg = new RegExp('(^|\\s)' + className2 + '(\\s|$)')
  return reg.test(el.className)
}
