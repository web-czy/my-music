import { playMode } from 'common/js/config';
import { loadSearch, loadPlay } from 'common/js/cache';

const state = {
  singer: {},
  playing: false, // 是否播放
  fullScreen: false, // 是否全屏
  playlist: [], // 播放列表
  sequenceList: [], // 顺序列表
  mode: playMode.sequence,
  currentIndex: -1,
  disc: {},
  topList: {},
  searchHistory: loadSearch(),
  playHistory: loadPlay()
};

export default state;
