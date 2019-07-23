<template>
  <transition appear name="slide">
    <music-list :bg-image="bgImage" :songs="songs" :title="title"></music-list>
  </transition>
</template>

<script type='text/ecmascript-6'>
import { mapGetters } from 'vuex'
import { getSingerDetail } from 'api/singer'
import { ERR_OK } from 'api/config'
import { createSong, isValidMusic, processSongsUrl } from 'common/js/song'
import MusicList from 'components/music-list/music-list'

export default {
  data() {
    return {
      songs: []
    }
  },
  computed: {
    ...mapGetters([
      'singer'
    ]),
    bgImage() {
      return this.singer.avatar
    },
    title() {
      return this.singer.name
    }
  },
  created() {
    this._getDetail()
    // console.log(this.singer)
  },
  methods: {
    _getDetail() {
      // 如果直接在歌手详情页刷新了，vuex里边的singer就是个空对象
      // 所以需要回退到歌手列表的路由页面，重新进入（边界处理例子）
      if (!this.singer.id) {
        this.$router.push('/singer')
        return
      }
      getSingerDetail(this.singer.id).then((res) => {
        if (res.code === ERR_OK) {
          processSongsUrl(this._normalizeSongs(res.data.list)).then((songs) => {
            this.songs = songs
          })
        }
      })
    },
    _normalizeSongs(list) {
      let ret = []
      list.forEach((item) => {
        let { musicData } = item
        if (isValidMusic(musicData)) {
          ret.push(createSong(musicData))
        }
      })
      return ret
    }
  },
  components: {
    MusicList
  }
}
</script>

<style scoped lang='stylus' rel='stylesheet/stylus'>
@import '~common/stylus/variable'
@import '~common/stylus/mixin'

.slide-enter-active, .slide-leave-active
  transition: all 0.3s
.slide-enter, .slide-leave-to
  transform: translate3d(100%, 0, 0)
</style>
