<template>
  <div class="hello">
    <div class="pricing-header px-3 py-3 pt-md-5 pb-md-4 mx-auto text-center">
      <h1 class="display-4">Your Richlist Index</h1>
      <p class="lead">Updates every ~ 10 minutes</p>
    </div>

    <div class="container">
      <div class="input-group mb-3">
        <input :disabled="requesting" v-on:keydown.enter="check" type="text" class="form-control form-control-lg" placeholder="Enter your account (wallet address), rXXXXXX...." v-model="account">
        <div class="input-group-append">
          <button :disabled="requesting" @click="check" class="btn btn-warning" type="button">Check</button>
        </div>
      </div>
      <div class="progress-loading" v-if="requesting && progress > 0">
        <div class="progress">
          <div class="progress-bar progress-bar-striped progress-bar-animated" role="progressbar" style="width: 0%" :style="'width: ' + progress + '%'"></div>
        </div>
        <br />&nbsp;
      </div>
      <div v-if="error !== ''" class="alert alert-danger text-center">
        {{ error }}
      </div>
      <div v-if="!requesting && results.gt" class="alert alert-primary text-center">
        <h1>You are <b>#{{ results.gt.count + 1 }}</b> 🎉</h1>
        There are <b>{{ results.gt.count }}</b> account(s) with more XRP<span v-if="results.eq.count > 1">,
          <b>{{ results.eq.count - 1 }}</b> account(s) with the exact same amount of XRP</span>
        and
        <b>{{ results.lt.count }}</b> account(s) with less XRP.
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'RichListIndex',
  props: [ 'address' ],
  data () {
    return {
      account: '',
      requesting: false,
      results: {},
      error: '',
      progress: 0
    }
  },
  mounted () {
    if (this.$route.params.address) {
      this.account = this.$route.params.address
      this.progress = 0
      this.check()
    }
  },
  watch: {
    '$route.params.address': function (r) {
      this.account = r
      this.progress = 0
      this.results = {}
      this.requesting = false
      this.error = ''
      if (this.account) {
        this.check()
      }
    }
  },
  methods: {
    check () {
      var interval
      var that = this
      this.results = {}
      this.error = ''
      var donereq = function () {
        setInterval(() => {
          clearInterval(interval)
          that.requesting = false
          that.progress = 0
        }, 1000)
      }
      if (this.account.trim().match(/^r[a-zA-Z0-9]{10,}$/)) {
        this.requesting = true
        window.fetch('https://xrpstats.xrptipbot.com/api/richlist-index/' + this.account).then((r) => {
          return r.json()
        }).then((r) => {
          interval = setInterval(() => {
            if (that.progress < 90) {
              that.progress += 4
            } else {
              clearInterval(interval)
            }
          }, 50)
          that.$router.push({ path: '/rich-index/' + that.account, params: { address: that.account } })
          console.log(r)
          donereq()
          if (r.error) {
            that.error = r.message
          }
          that.results = r
        }).catch((e) => {
          donereq()
          that.error = e
        })
      } else {
        // not ok
        that.error = 'Invalid wallet address'
      }
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
