import jsonp from 'common/js/jsonp'
import { commonParams, options } from './config'

export function getSingerList() {
  const url = 'https://c.y.qq.com/v8/fcg-bin/v8.fcg'
  const data = Object.assign({}, commonParams, {
    platform: 'yqq',
    needNewCode: 0,
    channel: 'singer',
    page: 'list',
    // 三个all代表查看所有歌手
    key: 'all_all_all',
    //  代表这次请求查多少个数据
    pagesize: 100,
    // 代表查第几页数据
    pagenum: 1,
    hostUin: 0
  })

  return jsonp(url, data, options)
}
