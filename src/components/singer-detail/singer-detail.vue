<template>
  <transition appear name="slide">
    <div class="singer-detail">123456</div>
  </transition>
</template>

<script type='text/ecmascript-6'>
import { mapGetters } from 'vuex'
import { getSingerDetail } from 'api/singer'
import { ERR_OK } from 'api/config'

export default {
  data() {
    return {
      songs: []
    }
  }
  computed: {
    ...mapGetters([
      'singer'
    ])
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
          console.log(res.data)
        }
      })
    }
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
.singer-detail
  position: fixed
  z-index: 100
  top: 0
  left: 0
  bottom: 0
  right: 0
  background: $color-background
</style>
