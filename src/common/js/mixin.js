import { mapGetters } from 'vuex';

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
