<template>
  <div class="singer-detail">123456</div>
</template>

<script type='text/ecmascript-6'>
export default {
  // created() {
  //   this._getDetail()
  // },
  // methods: {
  //   _getDetail() {
  //     if (!this.singer.id) {
  //       this.$router.push('/singer')
  //       return false
  //     }
  //   }
  // }
}
</script>

<style scoped lang='stylus' rel='stylesheet/stylus'>
@import '~common/stylus/variable'
@import '~common/stylus/mixin'

.singer-detail
  position: fixed
  z-index: 100
  top: 0
  left: 0
  bottom: 0
  right: 0
  background: $color-background
</style>
