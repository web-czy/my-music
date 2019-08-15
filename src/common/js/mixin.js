import { mapGetters, mapMutations, mapActions } from 'vuex';
import { shuffle } from 'common/js/util';
import { playMode } from 'common/js/config';
import * as types from '../../store/mutation-types';

export const playlistMixin = {
  computed: {
    ...mapGetters(['playlist'])
  },
  mounted() {
    this.handlePlaylist(this.playlist);
  },
  // activated: keep-alive组件激活时调用
  activated() {
    this.handlePlaylist(this.playlist);
  },
  watch: {
    playlist(newVal) {
      this.handlePlaylist(newVal);
    }
  },
  methods: {
    handlePlaylist() {
      throw new Error('component must implement handlePlaylist method');
    }
  }
};

export const playerMixin = {
  computed: {
    iconMode() {
      return this.mode === playMode.sequence
        ? 'icon-sequence'
        : this.mode === playMode.loop
        ? 'icon-loop'
        : 'icon-random';
    },
    favoriteIcon() {
      return this.getFavoriteIcon(this.currentSong);
    },
    ...mapGetters([
      'playlist',
      'sequenceList',
      'mode',
      'currentSong',
      'favoriteList'
    ])
  },
  methods: {
    changeMode() {
      const mode = (this.mode + 1) % 3;
      this.setPlayMode(mode);
      let list = null;
      if (mode === playMode.random) {
        list = shuffle(this.sequenceList);
      } else {
        list = this.sequenceList;
      }
      this.resetCurrentIndex(list);
      this.setPlayList(list);
    },
    resetCurrentIndex(list) {
      let index = list.findIndex(item => {
        return item.id === this.currentSong.id;
      });
      this.setCurrentIndex(index);
    },
    getFavoriteIcon(song) {
      return this.isFavorite(song) ? 'icon-favorite' : 'icon-not-favorite';
    },
    toggleFavorite(song) {
      if (this.isFavorite(song)) {
        this.deleteFavoriteSong(song);
      } else {
        this.saveFavoriteSong(song);
      }
    },
    isFavorite(song) {
      let index = this.favoriteList.findIndex(item => {
        return song.id === item.id;
      });
      return index > -1;
    },
    ...mapMutations({
      setPlayingState: types.SET_PLAYING_STATE,
      setCurrentIndex: types.SET_CURRENT_INDEX,
      setPlayMode: types.SET_PLAY_MODE,
      setPlayList: types.SET_PLAYLIST
    }),
    ...mapActions(['deleteFavoriteSong', 'saveFavoriteSong'])
  }
};

export const searchMixin = {
  data() {
    return {
      query: '',
      refreshDelay: 120
    };
  },
  computed: {
    ...mapGetters(['searchHistory'])
  },
  methods: {
    blurInput() {
      this.$refs.searchBox.blur();
    },
    saveSearch() {
      this.saveSearchHistory(this.query);
    },
    onQueryChange(query) {
      // 处理带空格的情况
      this.query = query.trim();
    },
    addQuery(query) {
      this.$refs.searchBox.setQuery(query);
    },
    ...mapActions(['saveSearchHistory', 'deleteSearchHistory'])
  }
};
