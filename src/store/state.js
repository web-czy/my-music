import { playMode } from 'common/js/config';

const state = {
  singer: {},
  playing: false, // 是否播放
  fullScreen: false, // 是否全屏
  playlist: [], // 播放列表
  sequenceList: [], // 顺序列表
  mode: playMode.sequence,
  currentIndex: -1,
  disc: {}
};

export default state;
