<template>
  <div
    class="player"
    v-show="playlist.length > 0"
  >
    <transition
      name="normal"
      @enter="enter"
      @after-enter="afterEnter"
      @leave="leave"
      @after-leave="afterLeave"
    >
      <div
        class="normal-player"
        v-show="fullScreen"
      >
        <div class="background">
          <img
            width="100%"
            height="100%"
            :src="currentSong.image"
          />
        </div>
        <div class="top">
          <div
            class="back"
            @click="back"
          >
            <i class="icon-back"></i>
          </div>
          <h1
            class="title"
            v-html="currentSong.name"
          ></h1>
          <h2
            class="subtitle"
            v-html="currentSong.singer"
          ></h2>
        </div>
        <div
          class="middle"
          @touchstart.prevent="middleTouchStart"
          @touchmove.prevent="middleTouchMove"
          @touchend="middleTouchEnd"
        >
          <div
            class="middle-l"
            ref="middleL"
          >
            <div
              class="cd-wrapper"
              ref="cdWrapper"
            >
              <div
                class="cd"
                ref="imageWrapper"
              >
                <img
                  ref="image"
                  :class="cdCls"
                  class="image"
                  :src="currentSong.image"
                />
              </div>
            </div>
            <div class="playing-lyric-wrapper">
              <div class="playing-lyric">{{ playingLyric }}</div>
            </div>
          </div>
          <scroll
            class="middle-r"
            ref="lyricList"
            :data="currentLyric && currentLyric.lines"
          >
            <div class="lyric-wrapper">
              <div v-if="currentLyric">
                <p
                  ref="lyricLine"
                  class="text"
                  :class="{'current': currentLineNum === index }"
                  v-for="(line, index) in currentLyric.lines"
                  :key="index"
                >
                  {{ line.txt }}
                </p>
              </div>
              <div
                class="pure-music"
                v-show="isPureMusic"
              >
                <p>{{ pureMusicLyric }}</p>
              </div>
            </div>
          </scroll>
        </div>
        <div class="bottom">
          <div class="dot-wrapper">
            <span
              class="dot"
              :class="{ 'active': currentShow === 'cd' }"
            ></span>
            <span
              class="dot"
              :class="{ 'active': currentShow === 'lyric' }"
            ></span>
          </div>
          <div class="progress-wrapper">
            <span class="time time-l">{{ format(currentTime) }}</span>
            <div class="progress-bar-wrapper">
              <progress-bar
                ref="progressBar"
                :percent="percent"
                @percentChange="onProgressBarChange"
                @percentChanging="onProgressBarChanging"
              ></progress-bar>
            </div>
            <span class="time time-r">{{ format(currentSong.duration) }}</span>
          </div>
          <div class="operators">
            <div
              class="icon i-left"
              @click="changeMode"
            >
              <i :class="iconMode"></i>
            </div>
            <div
              class="icon i-left"
              :class="disableCls"
            >
              <i
                @click="prev"
                class="icon-prev"
              ></i>
            </div>
            <div
              class="icon i-center"
              :class="disableCls"
            >
              <i
                class="needsclick"
                @click="togglePlaying"
                :class="playIcon"
              ></i>
            </div>
            <div
              class="icon i-right"
              :class="disableCls"
            >
              <i
                @click="next"
                class="icon-next"
              ></i>
            </div>
            <div class="icon i-right">
              <i
                @click="toggleFavorite(currentSong)"
                class="icon"
                :class="favoriteIcon"
              ></i>
            </div>
          </div>
        </div>
      </div>
    </transition>
    <transition name="mini">
      <div
        class="mini-player"
        v-show="!fullScreen"
        @click="open"
      >
        <div class="icon">
          <div
            class="imgWrapper"
            ref="miniWrapper"
          >
            <img
              ref="miniImage"
              :class="cdCls"
              width="40"
              height="40"
              :src="currentSong.image"
            />
          </div>
        </div>
        <div class="text">
          <h2
            class="name"
            v-html="currentSong.name"
          ></h2>
          <p
            class="desc"
            v-html="currentSong.singer"
          ></p>
        </div>
        <div class="control">
          <progress-circle
            :radius="radius"
            :percent="percent"
          >
            <i
              @click.stop="togglePlaying"
              class="icon-mini"
              :class="miniIcon"
            ></i>
          </progress-circle>
        </div>
        <div
          class="control"
          @click.stop="showPlaylist"
        >
          <i class="icon-playlist"></i>
        </div>
      </div>
    </transition>
    <playlist ref="playlist"></playlist>
    <audio
      ref="audio"
      :src="currentSong.url"
      @playing="ready"
      @error="error"
      @timeupdate="updateTime"
      @ended="end"
      @pause="paused"
    ></audio>
  </div>
</template>

<script type="text/ecmascript-6">
import { mapGetters, mapMutations, mapActions } from 'vuex'
import * as types from '../../store/mutation-types'
import animations from 'create-keyframe-animation'
import { prefixStyle } from 'common/js/dom'
import ProgressBar from 'base/progress-bar/progress-bar'
import ProgressCircle from 'base/progress-circle/progress-circle'
import { playMode } from 'common/js/config'
import Lyric from 'lyric-parser'
import Scroll from 'base/scroll/scroll'
import { playerMixin } from 'common/js/mixin'
import Playlist from 'components/playlist/playlist'

const transform = prefixStyle('transform')
const transitionDuration = prefixStyle('transitionDuration')

const timeExp = /\[(\d{2}):(\d{2}).(\d{2})\]/g

export default {
  mixins: [playerMixin],
  data() {
    return {
      songReady: false,
      currentTime: 0,
      radius: 32,
      currentLyric: null,
      // 当前歌词所在行
      currentLineNum: 0,
      // 歌词与歌手头像切换
      currentShow: 'cd',
      playingLyric: '',
      isPureMusic: false,
      pureMusicLyric: ''
    }
  },
  computed: {
    cdCls() {
      return this.playing ? 'play' : ''
    },
    playIcon() {
      return this.playing ? 'icon-pause' : 'icon-play'
    },
    miniIcon() {
      return this.playing ? 'icon-pause-mini' : 'icon-play-mini'
    },
    disableCls() {
      return this.songReady ? '' : 'disable'
    },
    percent() {
      return this.currentTime / this.currentSong.duration
    },
    ...mapGetters([
      'currentIndex',
      'fullScreen',
      'playing'
    ])
  },
  created() {
    // 在created里边定义的原因是它并不需要添加getter和setter
    this.touch = {}
  },
  methods: {
    back() {
      this.setFullScreen(false)
    },
    open() {
      this.setFullScreen(true)
    },
    enter(el, done) {
      const { x, y, scale } = this._getPosAndScale()

      let animation = {
        0: {
          transform: `translate3d(${x}px,${y}px,0) scale(${scale})`
        },
        60: {
          transform: `translate3d(0,0,0) scale(1.1)`
        },
        100: {
          transform: `translate3d(0,0,0) scale(1)`
        }
      }
      // 注册animation
      animations.registerAnimation({
        name: 'move',
        animation,
        presets: {
          duration: 400,
          easing: 'linear'
        }
      })
      // 运行animation,接收三个参数(初始dom，动画名，执行done[跳到afterEnter])
      animations.runAnimation(this.$refs.cdWrapper, 'move', done)
    },
    afterEnter() {
      animations.unregisterAnimation('move')
      this.$refs.cdWrapper.style.animation = ''
    },
    leave(el, done) {
      this.$refs.cdWrapper.style.transition = 'all 0.4s'
      const { x, y, scale } = this._getPosAndScale()
      this.$refs.cdWrapper.style[transform] = `translate3d(${x}px,${y}px,0) scale(${scale})`
      const timer = setTimeout(done, 400)
      this.$refs.cdWrapper.addEventListener('transitionend', () => {
        clearTimeout(timer)
        done()
      })
    },
    afterLeave() {
      this.$refs.cdWrapper.style.transition = ''
      this.$refs.cdWrapper.style[transform] = ''
    },
    togglePlaying() {
      if (!this.songReady) {
        return
      }
      this.setPlayingState(!this.playing)
      if (this.currentLyric && this.canLyricPlay) {
        this.currentLyric.togglePlay()
      }
    },
    end() {
      this.currentTime = 0
      if (this.mode === playMode.loop) {
        this.loop()
      } else {
        this.next()
      }
    },
    loop() {
      this.$refs.audio.currentTime = 0
      this.$refs.audio.play()
      this.setPlayingState(true)
      if (this.currentLyric) {
        this.currentLyric.seek(0)
      }
    },
    next() {
      if (!this.songReady) {
        return
      }
      // 如果歌曲列表只有一个，那么循环播放
      if (this.playlist.length === 1) {
        this.loop()
      } else {
        let index = this.currentIndex + 1
        if (index === this.playlist.length) {
          index = 0
        }
        this.setCurrentIndex(index)
        if (!this.playing) {
          this.togglePlaying()
        }
      }
    },
    prev() {
      if (!this.songReady) {
        return
      }
      if (this.playlist.length === 1) {
        this.loop()
      } else {
        let index = this.currentIndex - 1
        if (index === -1) {
          index = this.playlist.length - 1
        }
        this.setCurrentIndex(index)
        if (!this.playing) {
          this.togglePlaying()
        }
      }
    },
    ready() {
      clearTimeout(this.timer)
      // 监听 playing 这个事件可以确保慢网速或者快速切换歌曲导致的 DOM Exception
      this.songReady = true
      // 歌曲准备好了，歌词可以开始play了：this.canLyricPlay为true
      this.canLyricPlay = true
      this.savePlayHistory(this.currentSong)
      // 如果歌曲的播放晚于歌词的出现，播放的时候需要同步歌词
      if (this.currentLyric && !this.isPureMusic) {
        this.currentLyric.seek(this.currentTime * 1000)
      }
    },
    paused() {
      // 当audio为暂停状态，同步到vuex暂停，然后如果有歌词，歌词也暂停
      this.setPlayingState(false)
      if (this.currentLyric) {
        this.currentLyric.stop()
      }
    },
    error() {
      clearTimeout(this.timer)
      // 在歌曲地址出现错误或其他错误时，不会导致所有按钮不能点击
      this.songReady = true
    },
    updateTime(e) {
      this.currentTime = e.target.currentTime
    },
    format(interval) {
      interval = interval | 0
      const minute = interval / 60 | 0
      const second = this._pad(interval % 60)
      return `${minute}:${second}`
    },
    onProgressBarChanging(percent) {
      // 正在拖动进度条的时候，歌词和左下角显示的时间跟随一起同步更新
      this.currentTime = this.currentSong.duration * percent
      if (this.currentLyric) {
        this.currentLyric.seek(this.currentTime * 1000)
      }
    },
    onProgressBarChange(percent) {
      // 播放进度条拖动
      const currentTime = this.currentSong.duration * percent
      this.currentTime = this.$refs.audio.currentTime = currentTime
      if (this.currentLyric) {
        this.currentLyric.seek(currentTime * 1000)
      }
      if (!this.playing) {
        this.togglePlaying()
      }
    },
    getLyric() {
      this.currentSong.getLyric().then(lyric => {
        // 如果当前这首歌的歌词不等于现在获取到的这首歌的歌词，就返回
        if (this.currentSong.lyric !== lyric) {
          return
        }
        this.currentLyric = new Lyric(lyric, this.handleLyric)
        // 如果this.currentLyric.lines已经有了
        // 就把this.isPureMusic设置为false
        this.isPureMusic = !this.currentLyric.lines.length
        if (this.isPureMusic) {
          // 歌词lines数组没有加载出来时,就把lrc拆分成数组
          this.pureMusicLyric = this.currentLyric.lrc.replace(timeExp, '').trim()
          this.playingLyric = this.pureMusicLyric
        } else {
          if (this.playing && this.canLyricPlay) {
            // 这个时候有可能用户已经播放了歌曲，要切到对应位置
            this.currentLyric.seek(this.currentTime * 1000)
          }
        }
      }).catch(() => {
        this.currentLyric = null
        this.playingLyric = ''
        this.currentLineNum = 0
      })
    },
    handleLyric({ lineNum, txt }) {
      if (!this.$refs.lyricLine) {
        return
      }
      this.currentLineNum = lineNum
      if (lineNum > 5) {
        // 5行以后
        // 滚动到当前元素，往上偏移第5个的位置
        // 所以第五行是正在播放的文字，用当前播放的行减5就是第一行
        let lineEl = this.$refs.lyricLine[lineNum - 5]
        this.$refs.lyricList.scrollToElement(lineEl, 1000)
      } else {
        // 5行之内
        // 滚到顶部
        this.$refs.lyricList.scrollTo(0, 0, 1000)
      }
      this.playingLyric = txt
    },
    showPlaylist() {
      this.$refs.playlist.show()
    },
    middleTouchStart(e) {
      this.touch.initiated = true
      // 用来判断是否是一次移动
      this.touch.moved = false
      const touch = e.touches[0]
      this.touch.startX = touch.pageX
      this.touch.startY = touch.pageY
    },
    middleTouchMove(e) {
      if (!this.touch.initiated) {
        return
      }
      const touch = e.touches[0]
      // 当前位置减去初始位置
      const deltaX = touch.pageX - this.touch.startX
      const deltaY = touch.pageY - this.touch.startY
      // 如果竖向偏移大于横向偏移，说明这是个竖向滚动，所以return
      if (Math.abs(deltaY) > Math.abs(deltaX)) {
        return
      }
      if (!this.touch.moved) {
        this.touch.moved = true
      }
      // 如果当前显示的是cd，就让歌词在右边停着，否则就是负的屏幕宽度
      const left = this.currentShow === 'cd' ? 0 : -window.innerWidth
      // 歌词的初始位置是0,让他显示的时候，就是改变它的translate3d为负的屏幕宽度
      // 当left为0时左滑，deltaX为负值
      // 当left为负值，屏幕宽度时右滑，deltaX为正值
      // 不能小于屏幕宽度,最大不能超过0
      const offsetWidth = Math.min(
        0,
        Math.max(-window.innerWidth, left + deltaX)
      )
      this.touch.percent = Math.abs(offsetWidth / window.innerWidth)
      // 由于lyricList是一个vue组件(scroll),不能直接操作vue组件的dom，所以访问$el
      this.$refs.lyricList.$el.style[transform] = `translate3d(${offsetWidth}px, 0, 0)`
      this.$refs.lyricList.$el.style[transitionDuration] = 0
      this.$refs.middleL.style.opacity = 1 - this.touch.percent
      this.$refs.middleL.style[transitionDuration] = 0
    },
    middleTouchEnd() {
      // 如果没有进行move的步骤
      if (!this.touch.moved) {
        return
      }
      let offsetWidth
      let opacity
      if (this.currentShow === 'cd') {
        // 在当前cd显示的情况下，左滑，使歌词显示
        // 如果滑动的比例大于屏幕的10%
        if (this.touch.percent > 0.1) {
          // 使歌词显示
          offsetWidth = -window.innerWidth
          opacity = 0
          this.currentShow = 'lyric'
        } else {
          // 不变
          offsetWidth = 0
          opacity = 1
        }
      } else {
        // 右滑，percent小于0.9
        if (this.touch.percent < 0.9) {
          offsetWidth = 0
          this.currentShow = 'cd'
          opacity = 1
        } else {
          offsetWidth = -window.innerWidth
          opacity = 0
        }
      }
      const time = 300
      this.$refs.lyricList.$el.style[transform] = `translate3d(${offsetWidth}px, 0, 0)`
      this.$refs.lyricList.$el.style[transitionDuration] = `${time}ms`
      this.$refs.middleL.style.opacity = opacity
      this.$refs.middleL.style[transitionDuration] = `${time}ms`
      this.touch.initiated = false
    },
    _pad(num, n = 2) {
      let len = num.toString().length
      while (len < n) {
        num = '0' + num
        len++
      }
      return num
    },
    _getPosAndScale() {
      const targetWidth = 40 // 小头像宽度
      const paddingLeft = 40 // 小头像中心距左边框
      const paddingBottom = 30 // 小头像中心距下边框
      const paddingTop = 80 // 大头像中心距上边框
      const width = window.innerWidth * 0.8 // 大头像宽度是浏览器宽度的百分之80
      const scale = targetWidth / width // 缩小倍数
      const x = -(window.innerWidth / 2 - paddingLeft) // x轴偏移
      const y = window.innerHeight - paddingTop - width / 2 - paddingBottom // y轴偏移
      return {
        x,
        y,
        scale
      }
    },
    /**
     * 计算内层Image的transform，并同步到外层容器
     * @param wrapper
     * @param inner
     */
    syncWrapperTransform(wrapper, inner) {
      if (!this.$refs[wrapper]) {
        return
      }
      let imageWrapper = this.$refs[wrapper]
      let image = this.$refs[inner]
      let wTransform = getComputedStyle(imageWrapper)[transform]
      let iTransform = getComputedStyle(image)[transform]
      imageWrapper.style[transform] =
        wTransform === 'none'
          ? iTransform
          : iTransform.concat(' ', wTransform)
    },
    ...mapMutations({
      setFullScreen: types.SET_FULL_SCREEN
    }),
    ...mapActions([
      'savePlayHistory'
    ])
  },
  watch: {
    currentSong(newSong, oldSong) {
      if (!newSong.id || !newSong.url || newSong.id === oldSong.id) {
        return
      }
      this.songReady = false
      this.canLyricPlay = false
      if (this.currentLyric) {
        this.currentLyric.stop()
        // 重置为null
        this.currentLyric = null
        this.currentTime = 0
        this.playingLyric = ''
        this.currentLineNum = 0
      }
      this.$refs.audio.src = newSong.url
      // this.$refs.audio.play()
      // this.getLyric()
      // 异步操作是自己改动，不知道为什么非异步就会播放失败
      this.$nextTick(() => {
        this.$refs.audio.play()
        this.getLyric()
      })
      // 若歌曲 5s 未播放，则认为超时，修改状态确保可以切换歌曲。
      clearTimeout(this.timer)
      this.timer = setTimeout(() => {
        this.songReady = true
      }, 5000)
    },
    playing(newPlaying) {
      if (!this.songReady) {
        return
      }
      const audio = this.$refs.audio
      this.$nextTick(() => {
        newPlaying ? audio.play() : audio.pause()
      })
      // 如果已切换到暂停状态，设置最新歌手头像转动角度
      if (!newPlaying) {
        if (this.fullScreen) {
          this.syncWrapperTransform('imageWrapper', 'image')
        } else {
          this.syncWrapperTransform('miniWrapper', 'miniImage')
        }
      }
    },
    fullScreen(newVal) {
      // fullScreen,当新值为true也就是全屏显示播放器时
      // 歌词的scroll重新refresh()
      // 然后把最新的播放时间占比percent传给进度条组件progressBar
      if (newVal) {
        setTimeout(() => {
          this.$refs.lyricList.refresh()
          this.$refs.progressBar.setProgressOffset(this.percent)
        }, 20)
      }
    }
  },
  components: {
    ProgressBar,
    ProgressCircle,
    Scroll,
    Playlist
  }
}
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
@import '~common/stylus/variable'
@import '~common/stylus/mixin'

.player
  .normal-player
    position: fixed
    left: 0
    right: 0
    top: 0
    bottom: 0
    z-index: 150
    background: $color-background
    .background
      position: absolute
      left: 0
      top: 0
      width: 100%
      height: 100%
      z-index: -1
      opacity: 0.6
      filter: blur(20px)
    .top
      position: relative
      margin-bottom: 25px
      .back
        position: absolute
        top: 0
        left: 6px
        z-index: 50
        .icon-back
          display: block
          padding: 9px
          font-size: $font-size-large-x
          color: $color-theme
          transform: rotate(-90deg)
      .title
        width: 70%
        margin: 0 auto
        line-height: 40px
        text-align: center
        no-wrap()
        font-size: $font-size-large
        color: $color-text
      .subtitle
        line-height: 20px
        text-align: center
        font-size: $font-size-medium
        color: $color-text
    .middle
      position: fixed
      width: 100%
      top: 80px
      bottom: 170px
      white-space: nowrap
      font-size: 0
      .middle-l
        display: inline-block
        vertical-align: top
        position: relative
        width: 100%
        height: 0
        padding-top: 80%
        .cd-wrapper
          position: absolute
          left: 10%
          top: 0
          width: 80%
          box-sizing: border-box
          height: 100%
          .cd
            width: 100%
            height: 100%
            border-radius: 50%
            .image
              position: absolute
              left: 0
              top: 0
              width: 100%
              height: 100%
              box-sizing: border-box
              border-radius: 50%
              border: 10px solid rgba(255, 255, 255, 0.1)
            .play
              animation: rotate 20s linear infinite
        .playing-lyric-wrapper
          width: 80%
          margin: 30px auto 0 auto
          overflow: hidden
          text-align: center
          .playing-lyric
            height: 20px
            line-height: 20px
            font-size: $font-size-medium
            color: $color-text-l
      .middle-r
        display: inline-block
        vertical-align: top
        width: 100%
        height: 100%
        overflow: hidden
        .lyric-wrapper
          width: 80%
          margin: 0 auto
          overflow: hidden
          text-align: center
          .text
            line-height: 32px
            color: $color-text-l
            font-size: $font-size-medium
            &.current
              color: $color-text
          .pure-music
            padding-top: 50%
            line-height: 32px
            color: $color-text-l
            font-size: $font-size-medium
    .bottom
      position: absolute
      bottom: 50px
      width: 100%
      .dot-wrapper
        text-align: center
        font-size: 0
        .dot
          display: inline-block
          vertical-align: middle
          margin: 0 4px
          width: 8px
          height: 8px
          border-radius: 50%
          background: $color-text-l
          &.active
            width: 20px
            border-radius: 5px
            background: $color-text-ll
      .progress-wrapper
        display: flex
        align-items: center
        width: 80%
        margin: 0px auto
        padding: 10px 0
        .time
          color: $color-text
          font-size: $font-size-small
          flex: 0 0 30px
          line-height: 30px
          width: 30px
          &.time-l
            text-align: left
          &.time-r
            text-align: right
        .progress-bar-wrapper
          flex: 1
      .operators
        display: flex
        align-items: center
        .icon
          flex: 1
          color: $color-theme
          &.disable
            color: $color-theme-d
          i
            font-size: 30px
        .i-left
          text-align: right
        .i-center
          padding: 0 20px
          text-align: center
          i
            font-size: 40px
        .i-right
          text-align: left
        .icon-favorite
          color: $color-sub-theme
    &.normal-enter-active, &.normal-leave-active
      transition: all 0.4s
      .top, .bottom
        transition: all 0.4s cubic-bezier(0.86, 0.18, 0.82, 1.32)
    &.normal-enter, &.normal-leave-to
      opacity: 0
      .top
        transform: translate3d(0, -100px, 0)
      .bottom
        transform: translate3d(0, 100px, 0)
  .mini-player
    display: flex
    align-items: center
    position: fixed
    left: 0
    bottom: 0
    z-index: 180
    width: 100%
    height: 60px
    background: $color-highlight-background
    &.mini-enter-active, &.mini-leave-active
      transition: all 0.4s
    &.mini-enter, &.mini-leave-to
      opacity: 0
    .icon
      flex: 0 0 40px
      width: 40px
      height: 40px
      padding: 0 10px 0 20px
      .imgWrapper
        height: 100%
        width: 100%
        img
          border-radius: 50%
          &.play
            animation: rotate 10s linear infinite
          &.pause
            animation-play-state: paused
    .text
      display: flex
      flex-direction: column
      justify-content: center
      flex: 1
      line-height: 20px
      overflow: hidden
      .name
        margin-bottom: 2px
        no-wrap()
        font-size: $font-size-medium
        color: $color-text
      .desc
        no-wrap()
        font-size: $font-size-small
        color: $color-text-d
    .control
      flex: 0 0 30px
      width: 30px
      padding: 0 10px
      .icon-play-mini, .icon-pause-mini, .icon-playlist
        font-size: 30px
        color: $color-theme-d
      .icon-mini
        font-size: 32px
        position: absolute
        left: 0
        top: 0
@keyframes rotate
  0%
    transform: rotate(0)
  100%
    transform: rotate(360deg)
</style>
