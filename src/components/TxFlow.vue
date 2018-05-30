<template>
  <div class="hello">
    <div class="pricing-header px-3 py-3 pt-md-5 pb-md-4 mx-auto text-center">
      <h1 class="display-4">Account Transaction Flow</h1>
      <p class="lead text-muted">Most recent XRP only <code>Payment</code> transactions</p>
    </div>

    <div v-if="!poolReady">
      <p class="alert alert-primary text-center">Connecting to Ripple (XRPL) Websocket server...</p>
    </div>
    <div v-if="poolReady">
      <p class="text-warning text-center">
        <b>Enter a (single) wallet address</b>
      </p>

      <div class="container">
        <div class="input-group mb-3">
          <input :disabled="requesting" v-on:keydown.enter="pushRoute" type="text" class="form-control form-control-lg" placeholder="Enter the account (wallet address), rXXXXXX...." v-model="account">
          <div class="input-group-append">
            <button :disabled="requesting" @click="pushRoute" class="btn btn-warning" type="button">Check</button>
          </div>
        </div>
        <div v-if="flowhistory.length > 0 && !(flowhistory.length === 1 && flowhistory[0] === account)" class="text-center text-muted">
          <h6>History</h6>
          <ul class="list-unstyled text-center">
            <a class="media" @click="account = h; pushRoute()" v-for="h in flowhistory" v-bind:key="h" v-if="h !== account">
              <small>{{ h }}</small>
            </a>
          </ul>
        </div>

        <div class="alert text-center alert-primary" v-if="requesting">
          Fetching the most recent account transactions: <b>{{ results.length > 0 ? results.length : '' }}</b>...
        </div>
        <div v-if="!requesting && results.length > 0">
          <h4 class="text-center">Chart based on most recent <b class="text-primary" v-if="chartData.records > 1">{{ chartData.records }}</b> transaction{{ chartData.records !== 1 ? 's' : '' }}</h4>
          <h6 class="text-center">The transactions are sent from / to: <b class="text-primary">{{ chartData.count.from }}</b> input accounts and <b class="text-primary">{{ chartData.count.to }}</b> output accounts</h6>
          <GChart :packages="['sankey']" type="Sankey" :data="chartData.rows" :options="chartOptions" />
          <br />
          &nbsp;
        </div>
        <div class="alert alert-danger" v-show="results.length < 1 && error !== ''">
          <b>Error:</b> {{ error }}
        </div>
        <table class="table table-sm table-striped table-hover" v-show="!requesting && results.length > 0">
          <thead>
            <tr>
              <th>Moment</th>
              <th class="text-right">Amount</th>
              <th class="text-center">From</th>
              <th class="text-center">To</th>
              <th>Ledger</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(tx, index) in results" v-bind:key="tx.tx.hash" v-if="index < chartData.records && tx.meta.delivered_amount !== '0'">
              <td><code><small>{{ m(new Date((tx.tx.date + 946684800) * 1000)) }}</small></code></td>
              <td class="text-right">
                <b><a :href="'https://xrpcharts.ripple.com/#/transactions/' + tx.tx.hash" target="_blank">{{ (parseInt(tx.meta.delivered_amount) / 1000000).toFixed(6) }}</a></b>
                <span class="default-pointer" :title="'High fee! ' + (parseInt(tx.tx.Fee) / 1000000).toFixed(6) + ' XRP!'" v-if="(parseInt(tx.tx.Fee) / 1000000) >= 1">⚠</span>
              </td>
              <td class="text-center"><code><small>
                <router-link :to="'/tx-flow/' + tx.tx.Account" v-if="account !== tx.tx.Account" class="text-primary">{{ tx.tx.Account }}</router-link>
                <span v-if="account === tx.tx.Account" class="text-muted">{{ tx.tx.Account }}</span>
              </small></code></td>
              <td class="text-center"><code><small>
                <router-link :to="'/tx-flow/' + tx.tx.Destination" v-if="account !== tx.tx.Destination" class="text-primary">{{ tx.tx.Destination }}</router-link>
                <span v-if="account === tx.tx.Destination" class="text-muted">{{ tx.tx.Destination }}</span>
              </small></code></td>
              <td><code><small class="text-black">{{ tx.tx.inLedger }}</small></code></td>
            </tr>
          </tbody>
        </table>
        <br />
      </div>
    </div>
  </div>
</template>

<script>
import Vue from 'vue'
import VueLocalForage from 'vue-localforage'
import RippledWsClientPool from 'rippled-ws-client-pool'
import { GChart } from 'vue-google-charts'
const moment = require('moment')
const timezone = require('moment-timezone')

Vue.use(VueLocalForage)

export default {
  name: 'TxFlow',
  props: [ 'address' ],
  components: {
    GChart
  },
  data () {
    return {
      poolReady: false,
      account: '',
      requesting: false,
      results: [],
      error: '',
      flowhistory: [],
      maxUniqueDataPoints: 50,
      chartOptions: {
        height: 750,
        tooltip: {
          isHtml: true
        }
      }
    }
  },
  mounted () {
    if (this.$route.params.address) {
      this.account = this.$route.params.address
    }
    if (typeof window.RippledWsClientPool === 'undefined') {
      let pool = new RippledWsClientPool({})
      pool.addServer('wss://s2.ripple.com')
      window.RippledWsClientPool = pool
    } else {
      if (window.RippledWsClientPool.getConnections().filter(c => {
        return c.state.online
      }).length > 0) {
        this.poolReady = true
        if (this.account !== '') this.fetchTxs()
      }
    }
    window.RippledWsClientPool.on('ledger', (ledger) => {
      let poolWasReady = this.poolReady
      this.poolReady = true
      if (!poolWasReady && this.account !== '') {
        this.fetchTxs()
      }
    })
    this.$getItem('flowhistory').then((r) => {
      if (typeof r !== 'undefined' && r !== null && r.length > 0) {
        r.forEach((d) => {
          if (typeof d === 'string' && d.match(/^r/)) {
            this.flowhistory.unshift(d)
          }
        })
      }
    })
  },
  computed: {
    chartData () {
      let data = [[ 'From', 'To', 'XRP' ]]
      let records = 0
      let toCount
      let fromCount
      this.results.forEach(tx => {
        toCount = data.filter(r => { return r[0] === 'Account' }).length
        fromCount = data.filter(r => { return r[1] === 'Account' }).length
        if (toCount <= this.maxUniqueDataPoints && fromCount <= this.maxUniqueDataPoints) {
          let left
          let right
          if (tx.tx.Account === this.account) {
            left = 'Account'
            right = ' ' + tx.tx.Destination
            // if (tx.tx.DestinationTag) {
            //   right += ':' + tx.tx.DestinationTag
            // }
          } else {
            left = tx.tx.Account + ' '
            right = 'Account'
          }
          let d = [ left, right, parseFloat(tx.meta.delivered_amount) / 1000000 ]
          let existingPath = data.filter(r => {
            return r[0] === d[0] && r[1] === d[1]
          })
          if (existingPath.length > 0) {
            data[data.indexOf(existingPath[0])][2] += d[2]
          } else {
            data.push(d)
          }
          records++
        }
      })
      return {
        rows: data,
        records: records,
        count: {
          from: fromCount,
          to: toCount
        }
      }
    }
  },
  watch: {
    '$route.params.address': function (r) {
      this.account = r
      this.results = []
      // this.requesting = false
      this.error = ''
      if (this.account !== '') {
        this.fetchTxs()
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
        this.$router.push({ path: '/tx-flow/' + this.account, params: { address: this.account } })
      }
    },
    fetchTxs () {
      let lastResponse
      let fetchMore
      let addTxs = (txs) => {
        let existingTxFound = false
        txs.filter(tx => {
          return tx.tx.TransactionType === 'Payment' && typeof tx.meta.delivered_amount === 'string'
        }).forEach(tx => {
          if (!existingTxFound) {
            if (this.results.map(r => {
              return r.tx.hash
            }).indexOf(tx.tx.hash) < 0) {
              if (tx.meta.delivered_amount === 'unavailable') {
                tx.meta.delivered_amount = typeof tx.tx.Amount === 'string' ? tx.tx.Amount : '0'
              }
              this.results.push(tx)
            } else {
              console.log('Got existing TX')
              existingTxFound = true
            }
          }
        })
        return existingTxFound
      }
      fetchMore = () => {
        if (typeof lastResponse.more === 'function') {
          lastResponse.more().then(response => {
            lastResponse = response
            if (response.txCount > 0) {
              let existingTxFound = addTxs(response.transactions)
              if (this.results.length < 500 && !existingTxFound) {
                fetchMore()
              } else {
                this.requesting = false
              }
            }
          }).catch(error => {
            this.requesting = false
            this.error = error.message
          })
        } else {
          this.requesting = false
        }
      }
      if (this.poolReady && this.account !== '') {
        this.requesting = true
        window.RippledWsClientPool.getTransactions(this.account, { forward: false }, {
          serverTimeout: 4500,
          overallTimeout: 10000
        }).then(response => {
          lastResponse = response
          if (response.txCount < 1) {
            this.requesting = false
            this.error = 'No recent transactions'
          } else {
            addTxs(response.transactions)
          }
          if (response.txCount > 0 && this.results.length < 500) {
            fetchMore()
          } else {
            this.requesting = false
          }
        }).catch(error => {
          this.error = error.message
          this.requesting = false
          console.log('ws err', error)
        })
      }
    }
  }
}
</script>

<style lang="scss">
  div.google-visualization-tooltip {
    border-radius: 4px;
    pointer-events: none;
    opacity: .75;
    margin-left: -50px;
    ul.google-visualization-tooltip-item-list {
      li.google-visualization-tooltip-item {
        text-align: center;
        width: 300px;
        span {
          font-size: 12px !important;
        }
        &:last-child {
          span {
            font-size: 17px !important;
            font-weight: bold;
          }
        }
      }
    }
  }
  svg {
    text {
      pointer-events: none;
      font-weight: normal !important;
      &:hover {
        pointer-events: all;
        font-weight: normal !important;
      }
    }
  }
</style>

<style lang="scss" scoped>
  .text-black {
    color: #000;
  }
  .default-pointer {
    cursor: default;
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
</style>
