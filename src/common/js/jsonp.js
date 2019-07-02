import originJSONP from 'jsonp'

export default function jsonp(url, data, option) {
  // url要传纯净的url，&或者？后边的qurey，用data传进来，然后拼到一起
  url += (url.indexOf('?') < 0 ? '?' : '&') + param(data)

  return new Promise((resolve, reject) => {
    originJSONP(url, option, (err, res) => {
      if (!err) {
        resolve(res)
      } else {
        reject(err)
      }
    })
  })
}

function param(data) {
  let url = ''
  for (var k in data) {
    let value = data[k] !== undefined ? data[k] : ''
    url += `&${k}=${encodeURIComponent(value)}`
    // encodeURIComponent()编码
  }
  return url ? url.substring(1) : ''
  // 把第一个&删掉
}
