<template>
  <div class="hello">
    <div class="pricing-header px-3 py-3 pt-md-5 pb-md-4 mx-auto text-center">
      <h1 class="display-4">Your Richlist Index</h1>
      <p class="lead text-muted">Ledger data updates every ~ 10 minutes</p>
    </div>

    <p class="text-warning text-center">
      <b>Enter a wallet address, multiple addresses (space separated) or an amount (just the digits)</b>
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
      <div v-if="!requesting && results.gt && isExchange" class="alert alert-warning mb-3">
        <b>WARNING!</b> The account(s) listed below is/are likely <b>shared account(s)</b>, like an exchange or wallet service(s).
        <div class="mt-3">Many individual owners of XRP hold their tokens at an exchange or wallet service. The account balance reflects the total held at the entire exchange / wallet service rather than individual's holdings.</div>
        <ul class="list-unstyled pb-0 mb-0 mt-2">
          <span v-for="e in this.exchangeList" v-bind:key="e"><code class="badge bg-warning text-dark">{{ e }}</code>&nbsp;</span>
        </ul>
      </div>
      <div v-if="!requesting && results.gt" :class="{ exchange: isExchange }" class="alert alert-primary text-center">
        <div class="progress" style="height: 25px;">
          <div class="progress-bar text-center tooltipx" role="progressbar" style="width: 0%; max-width: 92%; min-width: 8%;" :style="'width: ' + Math.ceil(results.gt.percentage * 100) + '%'"><b class="d-none d-sm-block">~{{ Math.ceil(results.gt.percentage * 100) }}&percnt;&nbsp;&nbsp;</b><span class="tooltiptext" v-if="Math.ceil(results.gt.percentage * 100 <= 1)">{{ (results.gt.percentage * 100).toFixed(3) }}&percnt;</span></div>
          <div class="progress-bar text-center progress-overflow bg-warning" role="progressbar" style="width: 0%" :style="'width: ' + Math.floor((1 - results.gt.percentage - results.lt.percentage) * 100) + '%'">
            <div id="progress-me"></div>
          </div>
          <div class="progress-bar text-center bg-success tooltipx" role="progressbar" style="width: 0%; max-width: 92%; min-width: 8%;" :style="'width: ' + Math.floor(results.lt.percentage * 100) + '%'"><b class="d-none d-sm-block">&nbsp;&nbsp;~{{ Math.floor(results.lt.percentage * 100) }}&percnt;</b><span class="tooltiptext" v-if="Math.ceil(results.lt.percentage * 100 <= 1)">{{ (results.lt.percentage * 100).toFixed(3) }}&percnt;</span></div>
        </div>
        <br />
        <h1>
          <span v-if="results.accounts.length > 0">You are</span>
          <span v-if="results.accounts.length < 1">{{ parseInt(results.query).toLocaleString(undefined) }} XRP is </span>
          <b>#{{ results.gt.count + 1 }}</b> 🎉
        </h1>
        <b class="d-block d-sm-none" style="padding-bottom: 10px;">This means you are in the top ~{{ Math.ceil(results.gt.percentage * 100 * 100) / 100 }}&percnt;</b>
        There are <b>{{ results.gt.count }}</b> account(s) with <u>more</u> XRP<span v-if="results.eq.count > 1">,
          <b>{{ results.eq.count - 1 }}</b> account(s) with the <u>exact same</u> amount of XRP</span>
        and
        <b>{{ results.lt.count }}</b> account(s) with <u>less</u> XRP.
        <br />
        <hr />
        <!-- When looking at the total amount of XRP in account: -->
        <!-- <br /> -->
        <b>{{ results.lt.amount.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 }) }} XRP</b>
        <small class="text-primary">({{ parseFloat((results.lt.amountpct * 100).toFixed(6)).toLocaleString(undefined) }}&percnt;)</small>
        is in accounts with <u>less</u> XRP and <br />
        <b>{{ results.gt.amount.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 }) }} XRP</b>
        <small class="text-primary">({{ parseFloat((results.gt.amountpct * 100).toFixed(6)).toLocaleString(undefined) }}&percnt;)</small>
        is in accounts with <u>more</u> XRP.
        <br />
        <div class="progress" style="height: 17px; margin-top: 10px; margin-bottom: 12px;">
          <div class="progress-bar text-center bg-warning text-dark" role="progressbar" style="width: 0%; max-width: 90%; min-width: 10%;" :style="'width: ' + Math.ceil(results.lt.amountpct * 100) + '%'"><b class="d-none d-sm-block">&nbsp;&nbsp;{{ parseFloat((results.lt.amountpct * 100).toFixed(6)).toLocaleString(undefined) }}&percnt;</b></div>
          <div class="progress-bar text-center progress-overflow bg-warning" role="progressbar" style="width: 0%" :style="'width: ' + Math.floor((1 - results.gt.amountpct - results.lt.amountpct) * 100) + '%'">
            <!-- <div id="progress-me"></div> -->
          </div>
          <div class="progress-bar bg-dark text-center" role="progressbar" style="width: 0%; max-width: 90%; min-width: 10%;" :style="'width: ' + Math.floor(results.gt.amountpct * 100) + '%'"><b class="d-none d-sm-block">{{ parseFloat((results.gt.amountpct * 100).toFixed(6)).toLocaleString(undefined) }}&percnt;&nbsp;&nbsp;</b></div>
        </div>
        <span class="text-muted" v-if="results.accounts.length > 0">
          <small>
            &dash;
            Results from: <b>{{ m(results.accounts[0].__lastUpdate) }}</b>
          </small>
          <br />
        </span>
      </div>
      <div v-if="history.length > 0 && !(history.length === 1 && history[0] === account)" class="text-center text-muted">
        <h6>History</h6>
        <ul class="list-unstyled text-center">
          <a class="media" @click="account = h; pushRoute()" v-for="h in history" v-bind:key="h" v-if="h !== account">
            <small>{{ h }}</small>
          </a>
        </ul>
        <br />&nbsp;
      </div>
      <div v-show="!requesting && results.gt" class="donate">
        <div class="text-center donate">
          <span class="text-muted">Feel like sending a sip my way 🍺?</span><br />
          <a amount="0.345" size="275" to="WietseWind" network="twitter" href="https://www.xrptipbot.com" target="_blank"></a>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Vue from 'vue'
import VueLocalForage from 'vue-localforage'
import RippledWsClientPool from 'rippled-ws-client-pool'
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
      history: [],
      accountDetails: {}
    }
  },
  computed: {
    accountAccountDetails () {
      return Object.keys(this.accountDetails).filter(r => {
        return this.account.trim().split(' ').indexOf(this.accountDetails[r].account) > -1
      })
    },
    exchangeList () {
      return this.accountAccountDetails.filter(r => {
        return this.accountDetails[r].tagRequired
      }).map(r => {
        return this.accountDetails[r].account
      })
    },
    isExchange () {
      return this.accountAccountDetails.map(r => {
        return this.accountDetails[r].tagRequired
      }).indexOf(true) > -1
    }
  },
  mounted () {
    let script = document.createElement('script')
    script.src = 'https://www.xrptipbot.com/static/donate/tipper.js'
    script.setAttribute('charset', 'utf-8')
    script.setAttribute('async', 'async')
    script.setAttribute('deferred', 'deferred')
    document.querySelector('#app').appendChild(script)

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
      // this.requesting = false
      this.error = ''
      if (this.account) {
        this.check()
      }
    }
  },
  methods: {
    connectPool () {
      return new Promise((resolve, reject) => {
        if (typeof window.RippledWs === 'undefined') {
          let pool = new RippledWsClientPool({})
          pool.addServer('wss://s1.ripple.com')
          pool.addServer('wss://rippled-dev.xrpayments.co')
          pool.addServer('wss://rippled.xrptipbot.com')
          window.RippledWs = new Promise((resolve, reject) => {
            pool.on('ledger', ledger => {
              window.RippledWs = pool
              resolve(window.RippledWs)
            })
          })
        }
        resolve(window.RippledWs)
      })
    },
    getAccountFlags (account) {
      return new Promise((resolve, reject) => {
        this.connectPool().then(pool => {
          pool.send({
            command: 'account_info',
            account: account
          }).then(r => {
            if (typeof r.response.account_data.Flags !== 'undefined') {
              const accountRootFlags = {
                PasswordSpent: 0x00010000, // password set fee is spent
                RequireDestTag: 0x00020000, // require a DestinationTag for payments
                RequireAuth: 0x00040000, // require authorization to hold IOUs
                DepositAuth: 0x01000000, // require account to auth deposits
                DisallowXRP: 0x00080000, // disallow sending XRP
                DisableMaster: 0x00100000, // force regular key
                NoFreeze: 0x00200000, // permanently disallowed freezing trustlines
                GlobalFreeze: 0x00400000, // trustlines globally frozen
                DefaultRipple: 0x00800000
              }
              Object.keys(accountRootFlags).forEach(f => {
                if (r.response.account_data.Flags & accountRootFlags[f]) {
                  if (f === 'RequireDestTag') {
                    resolve({
                      account: r.response.account_data.Account,
                      tagRequired: true
                    })
                  }
                }
              })
            }
            resolve({
              account: r.response.account_data.Account,
              tagRequired: false
            })
          }).catch(reject)
        })
      })
    },
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
        clearInterval(interval)
        that.requesting = false
        that.progress = 0
      }
      interval = setInterval(() => {
        if (that.progress < 90) {
          // that.requesting = true
          that.progress += 4
        } else {
          clearInterval(interval)
        }
      }, 200)
      if (this.account.trim().match(/^r[a-zA-Z0-9, ]{10,}$/) || this.account.trim().match(/^[0-9]+$/)) {
        this.account.trim().split(' ').forEach(a => {
          this.getAccountFlags(a).then(r => {
            console.log('getAccountFlags', r)
            this.accountDetails = Object.assign({}, { [r.account]: r, ...this.accountDetails })
          })
        })
        this.requesting = true
        window.fetch('https://ledger.exposed/api/richlist-index/' + this.account).then(r => {
          return r.json()
        }).then((r) => {
          // console.log(r)
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
  .exchange { opacity: .5; }
  .donate {
    margin-top: 45px;
  }
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
      margin-top: -1.18em;
      margin-left: -0.3em;
      font-size: 3.3em;
      line-height: 2.9em;
    }
  }

  /* Tooltip text */
  /* Tooltip container */
  .tooltipx {
    cursor: default;
  }

  /* Tooltip text */
  .tooltipx .tooltiptext {
    visibility: hidden;
    width: 90px;
    background-color: #555;
    color: #fff;
    text-align: center;
    padding: 5px 0;
    border-radius: 6px;

    /* Position the tooltip text */
    position: absolute;
    z-index: 1;
    // bottom: 125%;
    // left: 50%;
    margin-top: -37px;
    margin-left: -10px;
    font-size: 1.4em;
    line-height: 1.4em;
    font-weight: bold;

    /* Fade in tooltip */
    opacity: 0;
    transition: opacity 0.3s;
  }

  /* Tooltip arrow */
  .tooltipx .tooltiptext::after {
    content: "";
    position: absolute;
    top: 100%;
    left: 50%;
    margin-left: -5px;
    border-width: 5px;
    border-style: solid;
    border-color: #555 transparent transparent transparent;
  }

  /* Show the tooltip text when you mouse over the tooltip container */
  .tooltipx:hover .tooltiptext {
    visibility: visible;
    opacity: 0.95;
  }

</style>
