<template>
  <div class="hello">
    <div class="pricing-header px-3 py-3 pt-md-5 pb-md-4 mx-auto text-center">
      <h1 class="display-4">Escrow stats</h1>
      <p class="lead text-muted">Ledger data updates every ~ 10 minutes</p>
    </div>

    <p v-if="isotope.list.length < 1" class="alert alert-primary text-center">Loading stats...</p>
    <!-- <pre v-if="Object.keys(data).length > 0">{{ data }}</pre> -->

    <div class="text-center">
      <small><b>Show</b></small>
      <div class="btn-group btn-group-sm" role="group">
        <button class="btn" :class="{ 'btn-primary': show === 'all', 'btn-outline-primary': show !== 'all' }" @click="show='all'">All</button>
        <button class="btn" :class="{ 'btn-primary': show === 'finish', 'btn-outline-primary': show !== 'finish' }" @click="show='finish'">Has Finish</button>
        <button class="btn" :class="{ 'btn-primary': show === 'cancel', 'btn-outline-primary': show !== 'cancel' }" @click="show='cancel'">Has Cancel</button>
        <button class="btn" :class="{ 'btn-primary': show === 'condition', 'btn-outline-primary': show !== 'condition' }" @click="show='condition'">Has Condition</button>
        <button class="btn" :class="{ 'btn-primary': show === 'gt1000', 'btn-outline-primary': show !== 'gt1000' }" @click="show='gt1000'">&gt; 1000 XRP</button>
      </div>
      <br /><br />
      <small><b>Sort</b></small>
      <div class="btn-group btn-group-sm" role="group">
        <button class="btn" :class="{ 'btn-primary': sort === 'Amount', 'btn-outline-primary': sort !== 'Amount' }" @click="sort='Amount'">Amount</button>
        <button class="btn" :class="{ 'btn-primary': sort === 'Cancel', 'btn-outline-primary': sort !== 'Cancel' }" @click="sort='Cancel'">Cancel After</button>
        <button class="btn" :class="{ 'btn-primary': sort === 'Finish', 'btn-outline-primary': sort !== 'Finish' }" @click="sort='Finish'">Finish After</button>
        <button class="btn" :class="{ 'btn-primary': sort === 'Account', 'btn-outline-primary': sort !== 'Account' }" @click="sort='Account'">Account</button>
        <button class="btn" :class="{ 'btn-primary': sort === 'Destination', 'btn-outline-primary': sort !== 'Destination' }" @click="sort='Destination'">Destination</button>
      </div>
    </div>

    <br />

    <Isotope ref="cpt" :list="isotope.list" id="root_isotope" class="isoDefault row" :options="isotope.option" @filter="filterOption=arguments[0]" @sort="sortOption=arguments[0]">
      <div class="col-12 col-md-4" v-for="element in isotope.list" @click="isotope.selected=element" :key="element.id">
        <div class="card mb-4 box-shadow">
          <div class="card-body">
            <div class="card-text text-center">
              <b>{{ (Math.round(element.Amount * 1000000) / 1000000).toLocaleString(undefined, { maximumFractionDigits: 6 }) }}</b> XRP
              <br />
              <small><b><code>{{ element.Account }}</code></b></small>
              <br />
              ↓
              <br />
              <small><b><code class="text-primary">{{ element.Destination }}</code></b></small>
            </div>
            <hr />
            <!-- <small class="text-muted">{{ element.Condition ? 1 : 0 }}</small>
            <small class="text-muted">{{ !element.DestinationTag ? '-' : element.DestinationTag }}</small> -->
            <div class="d-flex justify-content-between align-items-center">
              <small class="text-muted">
                <small>Cancel</small><br />
                <b>{{ !element.CancelAfter ? 'Unset' : mfn(element.CancelAfter + 946684800) }}</b><br />
                {{ !element.CancelAfter ? '-' : mf(element.CancelAfter + 946684800) }}
              </small>
              <small class="text-muted text-right">
                <small>Finish</small><br />
                <b>{{ !element.FinishAfter ? 'Unset' : mfn(element.FinishAfter + 946684800) }}</b><br />
                {{ !element.FinishAfter ? '-' : mf(element.FinishAfter + 946684800) }}
              </small>
            </div>
          </div>
        </div>
      </div>
    </Isotope>

    <br />&nbsp;
  </div>
</template>

<script>
import Isotope from 'vueisotope'
const moment = require('moment')
const timezone = require('moment-timezone')

export default {
  name: 'EscrowStats',
  components: {
    Isotope
  },
  watch: {
    show: function (e) {
      this.applyFilter(e)
    },
    sort: function (e) {
      var ef = e
      if (e === 'Finish') ef += 'After'
      if (e === 'Cancel') ef += 'After'
      if (ef.match(/After/)) {
        this.show = e.toLowerCase()
      } else {
        this.show = 'all'
      }
      this.applySort(ef)
    }
  },
  mounted () {
    window.fetch('https://ledger.exposed/api/escrowlist').then((r) => {
      return r.json()
    }).then((r) => {
      // this.data = r
      r.forEach((d, i) => {
        d.id = i
        this.isotope.list.push(d)
      })
    }).catch((e) => {
      console.log(e)
    })
  },
  data () {
    return {
      data: {},
      show: 'all',
      sort: 'Amount',
      isotope: {
        list: [],
        selected: null,
        option: {
          getSortData: {
            id: 'id',
            Account: 'Account',
            Amount (a) { return parseFloat(a.Amount) },
            Destination: 'Destination',
            Condition: 'Condition',
            FinishAfter (a) { return parseInt(a.FinishAfter) },
            CancelAfter (a) { return parseInt(a.CancelAfter) }
          },
          getFilterData: {
            'all': function () {
              return true
            },
            'finish': function (e) {
              return typeof e.FinishAfter !== 'undefined'
            },
            'cancel': function (e) {
              return typeof e.CancelAfter !== 'undefined'
            },
            'condition': function (e) {
              return typeof e.Condition !== 'undefined'
            },
            'gt1000': function (e) {
              return e.Amount > 1000
            }
          },
          sortBy: 'Amount',
          sortAscending: {
            Account: true,
            Amount: false,
            Destination: true,
            Condition: true,
            FinishAfter: false,
            CancelAfter: false
          }
        }
      }
    }
  },
  methods: {
    mfn (m) {
      var d = timezone(m * 1000)
      return d.tz(moment.tz.guess()).fromNow()
    },
    mf (m) {
      var d = timezone(m * 1000)
      return d.tz(moment.tz.guess()).format('YYYY-MM-DD HH:mm')
    },
    applySort: function (key) {
      this.$refs.cpt.sort(key)
    },
    applyFilter: function (key) {
      this.$refs.cpt.filter(key)
    }
  }
}
</script>

<style lang="scss" scoped>
@media (max-width: 768px) {
  div.btn-group {
    display: inline-block;
    button.btn {
      margin-top: 4px;
      border-radius: 4px !important;
      display: inline-block;
      white-space: wrap;
    }
  }
}
</style>
