import jsonp from 'common/js/jsonp';
import { commonParams, options } from './config';

export function getSingerList() {
  const url = 'https://c.y.qq.com/v8/fcg-bin/v8.fcg';
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
  });

  return jsonp(url, data, options);
}

export function getSingerDetail(singerId) {
  const url = 'https://c.y.qq.com/v8/fcg-bin/fcg_v8_singer_track_cp.fcg';

  const data = Object.assign({}, commonParams, {
    hostUin: 0,
    needNewCode: 0,
    platform: 'yqq',
    order: 'listen',
    begin: 0,
    num: 80,
    songstatus: 1,
    singermid: singerId
  });

  return jsonp(url, data, options);
}
