<template>
  <div class="hello">
    <h3>{{ title }}</h3>
    <small>Updates every ~ 10 minutes</small>
    <br />
    <br />
    <div class="container">
      <div class="input-group mb-3">
        <input :disabled="requesting" v-on:keydown.enter="check" type="text" class="form-control form-control-lg" placeholder="Enter your account (wallet address), rXXXXXX...." v-model="account">
        <div class="input-group-append">
          <button :disabled="requesting" @click="check" class="btn btn-warning" type="button">Check</button>
        </div>
      </div>
      <div v-if="error !== ''" class="alert alert-danger text-center">
        {{ error }}
      </div>
      <div v-if="results.gt" class="alert alert-primary text-center">
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
  data () {
    return {
      title: 'Check your index on the XRP Richlist',
      account: '',
      requesting: false,
      results: {},
      error: ''
    }
  },
  methods: {
    check () {
      var that = this
      this.results = {}
      this.error = ''
      var donereq = function () {
        setInterval(() => {
          that.requesting = false
        }, 1000)
      }
      if (this.account.trim().match(/^r[a-zA-Z0-9]{10,}$/)) {
        this.requesting = true
        window.fetch('https://xrpstats.xrptipbot.com/api/richlist-index/' + this.account).then((r) => {
          return r.json()
        }).then((r) => {
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
