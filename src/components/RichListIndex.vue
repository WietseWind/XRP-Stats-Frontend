<template>
  <div class="hello">
    <div class="pricing-header px-3 py-3 pt-md-5 pb-md-4 mx-auto text-center">
      <h1 class="display-4">Your Richlist Index</h1>
      <p class="lead text-muted">Ledger data updates every ~ 10 minutes</p>
    </div>

    <p class="text-warning text-center">
      <b>Enter an wallet address, multiple addresses (space separated) or an amount (just the digits)</b>
    </p>

    <div class="container">
      <div class="input-group mb-3">
        <input :disabled="requesting" v-on:keydown.enter="pushRoute" type="text" class="form-control form-control-lg" placeholder="Enter your account (wallet address), rXXXXXX...." v-model="account">
        <div class="input-group-append">
          <button :disabled="requesting" @click="pushRoute" class="btn btn-warning" type="button">Check</button>
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
      <div class="alert alert-danger text-center" v-if="!requesting && results.gt && results.accounts.length > 0">
        Please don't flaunt your position as it makes you a possible target for people with ill intentions!
      </div>
      <div v-if="!requesting && results.gt" class="alert alert-primary text-center">
        <div class="progress" style="height: 25px;">
          <div class="progress-bar text-center" role="progressbar" style="width: 0%; max-width: 94%; min-width: 6%;" :style="'width: ' + (results.gt.percentage * 100) + '%'"><b class="d-none d-sm-block">~{{ Math.round(results.gt.percentage * 100) }}&percnt;</b></div>
          <div class="progress-bar text-center progress-overflow bg-warning" role="progressbar" style="width: 0%" :style="'width: ' + ((1 - results.gt.percentage - results.lt.percentage) * 100) + '%'">
            <div id="progress-me"></div>
          </div>
          <div class="progress-bar text-center bg-success" role="progressbar" style="width: 0%; max-width: 94%; min-width: 6%;" :style="'width: ' + (results.lt.percentage * 100) + '%'"><b class="d-none d-sm-block">&nbsp;&nbsp;~{{ Math.round(results.lt.percentage * 100) }}&percnt;</b></div>
        </div>
        <br />
        <h1>
          <span v-if="results.accounts.length > 0">You are</span>
          <span v-if="results.accounts.length < 1">{{ parseInt(results.query).toLocaleString(undefined) }} XRP is </span>
          <b>#{{ results.gt.count + 1 }}</b> 🎉
        </h1>
        There are <b>{{ results.gt.count }}</b> account(s) with more XRP<span v-if="results.eq.count > 1">,
          <b>{{ results.eq.count - 1 }}</b> account(s) with the exact same amount of XRP</span>
        and
        <b>{{ results.lt.count }}</b> account(s) with less XRP.
        <br />
        <span class="text-muted" v-if="results.accounts.length > 0">
          <small>
            &dash;
            Results from: <b>{{ m(results.accounts[0].__lastUpdate) }}</b>
          </small>
        </span>
        <br />
      </div>
      <div v-if="history.length > 1" class="text-center text-muted">
        <h6>History</h6>
        <ul class="list-unstyled text-center">
          <a class="media" @click="account = h; pushRoute()" v-for="h in history" v-bind:key="h" v-if="h !== account">
            <small>{{ h }}</small>
          </a>
        </ul>
        <br />&nbsp;
      </div>
    </div>
  </div>
</template>

<script>
import Vue from 'vue'
import VueLocalForage from 'vue-localforage'
const moment = require('moment')
const timezone = require('moment-timezone')

Vue.use(VueLocalForage)

export default {
  name: 'RichListIndex',
  props: [ 'address' ],
  data () {
    return {
      account: '',
      requesting: false,
      results: {},
      error: '',
      progress: 0,
      history: []
    }
  },
  mounted () {
    if (this.$route.params.address) {
      this.account = this.$route.params.address
      this.progress = 0
      this.check()
    }
    this.$getItem('history').then((r) => {
      if (typeof r !== 'undefined' && r !== null && r.length > 0) {
        r.forEach((d) => {
          if (typeof d === 'string' && d.match(/^r/)) {
            this.history.unshift(d)
          }
        })
      }
    })
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
    m (m) {
      var d = timezone(m)
      return d.tz(moment.tz.guess()).fromNow()
    },
    pushRoute () {
      if (this.account.trim()) {
        this.$router.push({ path: '/rich-index/' + this.account, params: { address: this.account } })
      }
    },
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
      if (this.account.trim().match(/^r[a-zA-Z0-9, ]{10,}$/) || this.account.trim().match(/^[0-9]+$/)) {
        this.requesting = true
        window.fetch('https://ledger.exposed/api/richlist-index/' + this.account).then((r) => {
          return r.json()
        }).then((r) => {
          interval = setInterval(() => {
            if (that.progress < 90) {
              that.progress += 4
            } else {
              clearInterval(interval)
            }
          }, 50)
          console.log(r)
          donereq()
          if (r.error) {
            that.error = r.message
          } else {
            that.$getItem('history').then((r) => {
              var existing = []
              if (r !== null) {
                existing = r
              }
              if (existing.indexOf(that.account) < 0 && that.account.trim().match(/^r/)) {
                existing.unshift(that.account)
                if (existing.length > 10) {
                  existing = existing.slice(0, 10)
                }
                that.history = existing
                that.$setItem('history', existing)
              }
            })
          }
          that.results = r
        }).catch((e) => {
          donereq()
          that.error = e
        })
      } else {
        // not ok
        that.error = 'Invalid value, please enter one or more wallet addresses or an amount (only integers)'
      }
    }
  }
}
</script>

<style lang="scss" scoped>
  a {
    cursor: pointer;
    &:hover {
      text-decoration: underline !important;
    }
    &.media {
      small {
        margin: 0 auto 0 auto;
      }
    }
  }
  .progress-overflow { overflow: visible; }
  #progress-me {
    width: 12px;
    height: 12px;
    margin: 0 auto 0 auto;
    display: inline-block;
    overflow: visible;
    &::after {
      display: block;
      position: absolute;
      content: '😎';
      margin-top: -1.25em;
      margin-left: -0.3em;
      font-size: 3.3em;
      line-height: 2.9em;
    }
  }
</style>
