<template>
  <div class="hello">
    <div class="pricing-header px-3 py-3 pt-md-5 pb-md-4 mx-auto text-center">
      <h1 class="display-4">Richlist stats</h1>
      <p v-if="!data.datamoment" class="lead text-muted">Ledger data updates every ~ 10 minutes</p>
      <p v-if="data.datamoment" class="lead text-muted">Last update: {{ m(data.datamoment) }}</p>
    </div>

    <p class="text-center text-warning">
      <b>The numbers on this page are <u>not</u> taking escrowed XRP into account.</b>
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
          <tr v-for="l in top" v-bind:key="l.i">
            <th scope="row" class="text-right">{{ l.accounts }}</th>
            <td class="text-right">{{ l.from }} XRP</td>
            <td></td>
            <td>
              <span v-if="l.i < 1">∞</span>
              <span v-if="l.i > 0">{{ l.to }} XRP</span>
            </td>
            <td class="text-primary text-right"><b>{{ l.balance }}</b> XRP</td>
          </tr>
        </tbody>
        <tfoot>
          <tr>
            <th scope="row" class="text-right">
              {{ noAccountsASum }}
            </th>
            <th scope="row" class="text-right" colspan="100">
              {{ noAccountsSum }} XRP
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
      }, 0)).toLocaleString(undefined)
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
    window.fetch('https://xrpstats.xrptipbot.com/api/richlist').then((r) => {
      return r.json()
    }).then((r) => {
      this.data = r
    }).catch((e) => {
      console.log(e)
    })
  }
}
</script>

<style lang="scss" scoped>
.bold { font-weight: bold; }
</style>
