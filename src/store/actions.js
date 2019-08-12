import * as types from './mutation-types';
import { playMode } from 'common/js/config';
import { shuffle } from 'common/js/util';
import { saveSearch, deleteSearch, clearSearch } from 'common/js/cache';

function findIndex(list, song) {
  return list.findIndex(item => {
    return item.id === song.id;
  });
}

export const selectPlay = function({ commit, state }, { list, index }) {
  commit(types.SET_SEQUENCE_LIST, list);
  if (state.mode === playMode.random) {
    // 如果当前播放模式是随机
    let randomlist = shuffle(list);
    commit(types.SET_PLAYLIST, randomlist);
    let randomIndex = findIndex(randomlist, list[index]);
    commit(types.SET_CURRENT_INDEX, randomIndex);
  } else {
    // 正常
    commit(types.SET_PLAYLIST, list);
    commit(types.SET_CURRENT_INDEX, index);
  }
  commit(types.SET_FULL_SCREEN, true);
  commit(types.SET_PLAYING_STATE, true);
};

export const randomPlay = function({ commit }, { list }) {
  commit(types.SET_PLAY_MODE, playMode.random);
  commit(types.SET_SEQUENCE_LIST, list);
  let randomlist = shuffle(list);
  commit(types.SET_PLAYLIST, randomlist);
  commit(types.SET_CURRENT_INDEX, 0);
  commit(types.SET_FULL_SCREEN, true);
  commit(types.SET_PLAYING_STATE, true);
};

export const insertSong = function({ commit, state }, song) {
  // 插入当前列表
  let playlist = state.playlist.slice();
  let sequenceList = state.sequenceList.slice();
  let currentIndex = state.currentIndex;
  // 记录当前歌曲
  let currentSong = playlist[currentIndex];
  // 查找当前列表中是否有待插入的歌曲，并返回其索引
  let fpIndex = findIndex(playlist, song);
  // 因为是插入歌曲，所以索引+1
  currentIndex++;
  // 插入这首歌到当前索引位置，也就是正在播放歌曲的后面一个
  playlist.splice(currentIndex, 0, song);
  // 如果已经包含了这首歌
  if (fpIndex > -1) {
    // 由于新song已经插入
    // 如果当前插入的序号大于列表中的旧元素序号
    // 也就是旧的和song一样的参数在currentIndex前面
    if (currentIndex > fpIndex) {
      playlist.splice(fpIndex, 1);
      currentIndex--;
    } else {
      // 旧的和song一样的参数在currentIndex后面
      // fpIndex就要后移1位来删除
      playlist.splice(fpIndex + 1, 1);
    }
  }

  // 插入顺序列表
  let currentSIndex = findIndex(sequenceList, currentSong) + 1;
  let fsIndex = findIndex(sequenceList, song);
  sequenceList.splice(currentSIndex, 0, song);
  if (fsIndex > -1) {
    if (currentSIndex > fsIndex) {
      sequenceList.splice(fsIndex, 1);
    } else {
      sequenceList.splice(fsIndex + 1, 1);
    }
  }

  commit(types.SET_PLAYLIST, playlist);
  commit(types.SET_SEQUENCE_LIST, sequenceList);
  commit(types.SET_CURRENT_INDEX, currentIndex);
  commit(types.SET_FULL_SCREEN, true);
  commit(types.SET_PLAYING_STATE, true);
};

export const saveSearchHistory = function({ commit }, query) {
  commit(types.SET_SEARCH_HISTORY, saveSearch(query));
};

export const deleteSearchHistory = function({ commit }, query) {
  commit(types.SET_SEARCH_HISTORY, deleteSearch(query));
};

export const clearSearchHistory = function({ commit }) {
  commit(types.SET_SEARCH_HISTORY, clearSearch());
};

export const deleteSong = function({ commit, state }, song) {
  let playlist = state.playlist.slice();
  let sequenceList = state.sequenceList.slice();
  let currentIndex = state.currentIndex;
  // 从当前播放列表中删除
  let pIndex = findIndex(playlist, song);
  playlist.splice(pIndex, 1);
  // 从顺序播放列表中删除
  let sIndex = findIndex(sequenceList, song);
  sequenceList.splice(sIndex, 1);
  // 如果删除的歌曲在正在播放的歌曲前边，或当前播放歌曲是最后一个
  if (currentIndex > pIndex || currentIndex === playlist.length) {
    // 由于已经删除，length就少了一个，所以不用减1
    currentIndex--;
  }

  commit(types.SET_PLAYLIST, playlist);
  commit(types.SET_SEQUENCE_LIST, sequenceList);
  commit(types.SET_CURRENT_INDEX, currentIndex);

  // 如果播放列表为空，播放状态改为false
  const playingState = playlist.length > 0;
  commit(types.SET_PLAYING_STATE, playingState);
  commit(types.SET_PLAYING_STATE, playingState);
};

export const deleteSongList = function({ commit }) {
  commit(types.SET_PLAYLIST, []);
  commit(types.SET_SEQUENCE_LIST, []);
  commit(types.SET_CURRENT_INDEX, -1);
  commit(types.SET_PLAYING_STATE, false);
};
