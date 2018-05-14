<template>
  <div class="hello">
    <div class="pricing-header px-3 py-3 pt-md-5 pb-md-4 mx-auto text-center">
      <h1 class="display-4">Richlist stats</h1>
      <p v-if="!data.datamoment" class="lead text-muted">Ledger data updates every ~ 10 minutes</p>
      <p v-if="data.datamoment" class="lead text-muted">Last update: {{ m(data.datamoment) }}</p>
    </div>

    <div class="alert alert-primary text-center" v-if="top100 && data && data.totalCoins">
      <b>XRP owned by the top 100 accounts</b>
      <span class="large">{{ top100.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 }) }} XRP - <b>{{ (top100 / (top100AllXrp ? (data.totalCoins / 1000000) : noAccountsSum) * 100).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }} &percnt;</b></span>
      <b>Calculation:</b>
      <div v-if="top100AllXrp">
        <code>SUM(Non-escrowed XRP Top 100 accounts) / SUM(Existing XRP on ledger) * 100</code>
      </div>
      <div v-if="!top100AllXrp">
        <code>SUM(Non-escrowed XRP Top 100 accounts) / SUM(Non-escrowed XRP accounts) * 100</code>
      </div>
      <i>Note: there are multiple <b>exchange wallets</b> (accounts) in the Top 100. These wallets contain the funds of many individual investors. The actual number will be <b>significantly lower</b>!</i>
      <br />
      <div class="btn-group btn-group-toggle" style="margin-top: 10px;" data-toggle="buttons">
        <div @click="top100AllXrp=false" class="btn btn-xs" :class="{ 'btn-primary': !top100AllXrp, 'btn-light': top100AllXrp }">
          {{ !top100AllXrp ? '✓' : '' }}  Non-escrowed XRP
        </div>
        <div @click="top100AllXrp=true" class="btn btn-xs" :class="{ 'btn-primary': top100AllXrp, 'btn-light': !top100AllXrp }">
          {{ top100AllXrp ? '✓' : '' }} Existing XRP
        </div>
      </div>
    </div>

    <p class="text-center text-warning">
      <b>The numbers in the tables below are <u>not</u> taking escrowed XRP into account.</b>
    </p>

    <p v-if="Object.keys(data).length === 0" class="alert alert-primary text-center">Loading stats...</p>

    <div v-if="Object.keys(data).length > 0">
      <nav>
        <div class="nav nav-tabs nav-justified" id="nav-tab" role="tablist">
          <a class="nav-item nav-link" @click="location.hash = '#range'" :class="{ 'active bold': location.hash === '#range' }" href="#range">By # of accounts (balance range)</a>
          <a class="nav-item nav-link" @click="location.hash = '#percentage'" :class="{ 'active bold': location.hash === '#percentage' }" href="#percentage">By percentage of accounts</a>
        </div>
      </nav>

      <br />

      <table v-if="location.hash === '#range'" class="table table-hover table-sm table-striped">
        <thead class="thead-dark">
          <tr>
            <th scope="col" class="text-right" width="120"># Accounts</th>
            <th scope="col" class="text-right" width="220">Balance from</th>
            <th scope="col" width="1">-</th>
            <th scope="col" width="220">To</th>
            <th scope="col" class="text-right">Sum (XRP)</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(l, lk) in top" v-bind:key="l.i">
            <th scope="row" class="text-right">
              <router-link v-if="l.accounts < 999" :to="'/rich-stats/' + l.accounts + '/' + (lk > 0 ? top[lk - 1].accounts : 0)" class="">{{ l.accounts }}</router-link>
              <span v-if="l.accounts >= 999">{{ l.accounts }}</span>
            </th>
            <td class="text-right">{{ l.from }} XRP</td>
            <td></td>
            <td>
              <span v-if="l.i < 1">∞</span>
              <span v-if="l.i > 0">
                {{ l.to }} XRP
              </span>
            </td>
            <td class="text-primary text-right">
              <router-link v-if="l.accounts < 999" :to="'/rich-stats/' + l.accounts + '/' + (lk > 0 ? top[lk - 1].accounts : 0)" class=""><b>{{ l.balance }}</b> XRP</router-link>
              <span v-if="l.accounts >= 999"><b>{{ l.balance }}</b> XRP</span>
            </td>
          </tr>
        </tbody>
        <tfoot>
          <tr>
            <th scope="row" class="text-right">
              {{ noAccountsASum }}
            </th>
            <th scope="row" class="text-right" colspan="100">
              <span style="font-weight: normal;">In accounts (excl. escrows):</span> <code style="color: black;">{{ noAccountsSum.toLocaleString(undefined) }}</code> XRP<br />
              <span style="font-weight: normal;">Total coins (ledger):</span> <code style="color: black;">{{ Math.round(data.totalCoins / 1000000).toLocaleString(undefined) }}</code> XRP
            </th>
          </tr>
        </tfoot>
      </table>

      <table v-if="location.hash === '#percentage'" class="table table-hover table-sm table-striped">
        <thead class="thead-dark">
          <tr>
            <th scope="col" class="text-right" width="120">&percnt; Accounts</th>
            <th scope="col" class="text-right" width="300">Balance &gt;=</th>
            <th scope="col" class="text-right"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(v, k) in data.pct" v-bind:key="k">
            <th scope="row" class="text-right">{{ parseFloat(k.substring(3).replace('p', '.')).toLocaleString(undefined) }} &percnt;</th>
            <td class="text-right text-primary"><b>{{ v.toLocaleString(undefined, { minimumFractionDigits: 6, maximumFractionDigits: 6 }) }}</b> XRP</td>
            <td class="text-right"></td>
          </tr>
        </tbody>
      </table>

      <!-- <pre v-if="Object.keys(data).length > 0">{{ data }}</pre> -->
    </div>

    <br />&nbsp;
  </div>
</template>

<script>
const moment = require('moment')
const timezone = require('moment-timezone')

export default {
  name: 'RichStats',
  data () {
    return {
      data: {},
      top100: null,
      top100AllXrp: false,
      location: {
        hash: '#range'
      }
    }
  },
  computed: {
    top () {
      var prevStart = 0
      return Object.keys(this.data.has).map((k, i) => {
        var r = {
          i: i,
          accounts: this.data.has[k].accounts,
          from: parseInt(k.substring(3)).toLocaleString(undefined),
          to: prevStart.toLocaleString(undefined),
          balance: Math.round(this.data.has[k].balanceSum).toLocaleString(undefined)
        }
        prevStart = parseInt(k.substring(3)) - 1
        return r
      })
    },
    noAccountsSum () {
      return Math.round(Object.keys(this.data.has).map((r) => {
        return this.data.has[r].balanceSum
      }).reduce((a, b) => {
        return a + b
      }, 0))
    },
    noAccountsASum () {
      return Math.round(Object.keys(this.data.has).map((r) => {
        return this.data.has[r].accounts
      }).reduce((a, b) => {
        return a + b
      }, 0)).toLocaleString(undefined)
    }
  },
  methods: {
    m (m) {
      var d = timezone(m)
      return d.tz(moment.tz.guess()).fromNow()
    }
  },
  mounted () {
    this.location.hash = document.location.hash
    if (this.location.hash === '') {
      this.location.hash = '#range'
    }
    window.fetch('https://ledger.exposed/api/richlist').then((r) => {
      return r.json()
    }).then((r) => {
      this.data = r
    }).catch((e) => {
      console.log(e)
    })
    window.fetch('https://ledger.exposed/api/wallet-toplist/100/0').then((r) => {
      return r.json()
    }).then((r) => {
      this.top100 = r.map(p => {
        return p.Balance
      }).reduce((a, b) => {
        return a + b
      }, 0)
    }).catch((e) => {
      console.log(e)
    })
  }
}
</script>

<style lang="scss" scoped>
  .bold { font-weight: bold; }
  span.large {
    display: block;
    font-size: 2em;
    margin-top: .5em;
  }
</style>
