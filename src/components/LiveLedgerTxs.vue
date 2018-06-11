<template>
  <div class="hello">
    <div class="pricing-header px-3 py-3 pt-md-5 pb-md-4 mx-auto text-center">
      <h1 class="display-4">Live XRPL Transactions</h1>
      <p class="lead text-muted">Watch the most recent activity on the XRP ledger<br /><small><small class="text-primary">(Only accounts with &gt; 10 transactions are displayed)</small></small></p>
    </div>

    <div v-if="!poolReady">
      <p class="alert alert-primary text-center">Connecting to Ripple (XRPL) Websocket server...</p>
    </div>
    <div v-if="poolReady && sortedTxs.length < 1">
      <p class="alert alert-warning text-center">Connected, Waiting for transactions...</p>
    </div>
    <div v-if="poolReady && sortedTxs.length > 0">
      <div class="container">
        <br />
        <br />
        <table class="table table-sm table-bordered table-striped table-hover">
          <thead>
            <tr>
              <th width="60"></th>
              <th>Account</th>
              <th class="text-center" width="60" v-for="t in Object.keys(types).sort()" v-bind:key="t"><code class="vertical">{{ t }}</code></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="x in sortedTxs" v-bind:key="x">
              <td class="text-right"><small class="text-muted">{{ txs[x].__count }}</small></td>
              <td><code class="text-primary"><b><a :href="'https://bithomp.com/explorer/' + x" target="_blank">{{ x }}</a></b></code></td>
              <td class="text-center" v-for="t in Object.keys(types).sort()" v-bind:key="t">
                {{ txs[x][t] }}
              </td>
            </tr>
          </tbody>
        </table>
        <br />
        <br />&nbsp;
      </div>
    </div>
  </div>
</template>

<script>
import RippledWsClientPool from 'rippled-ws-client-pool'

export default {
  name: 'LiveLedgerTxs',
  data () {
    return {
      txs: {},
      types: {},
      poolReady: false,
      gotTxs: false
    }
  },
  mounted () {
    if (typeof window.RippledWsClientPoolLive === 'undefined') {
      let pool = new RippledWsClientPool({})
      pool.addServer('wss://s1.ripple.com')
      pool.addServer('wss://kyte.peerisland.com')
      pool.addServer('wss://rippled-dev.xrpayments.co')
      window.RippledWsClientPoolLive = pool
    } else {
      if (window.RippledWsClientPoolLive.getConnections().filter(c => {
        return c.state.online
      }).length > 0) {
        this.poolReady = true
        // if (this.account !== '') this.fetchTxs()
      }
    }
    window.RippledWsClientPoolLive.on('ledger', (ledger) => {
      let poolWasReady = this.poolReady
      this.poolReady = true
      if (!poolWasReady && this.account !== '') {
        // this.fetchTxs()
      }
      this.processLedger(ledger)
    })
  },
  computed: {
    sortedTxs () {
      return Object.keys(this.txs).sort(this.txSorter).filter(t => {
        return this.txs[t].__count > 10
      })
    }
  },
  watch: {
  },
  methods: {
    txSorter (a, b) {
      return (this.txs[a].__count > this.txs[b].__count) ? -1 : ((this.txs[b].__count > this.txs[a].__count) ? 1 : 0)
    },
    processLedger (l) {
      this.gotTxs = true
      if (this.$router.currentRoute.name === 'LiveLedgerTxs') {
        window.RippledWsClientPoolLive.send({
          command: 'ledger',
          ledger_index: l,
          transactions: true,
          expand: true
        }).then(t => {
          if (typeof t.response.ledger.transactions !== 'undefined' && t.response.ledger.transactions.length > 0) {
            t.response.ledger.transactions.forEach(x => {
              this.$set(this.types, x.TransactionType, true)
              if (typeof this.txs[x.Account] === 'undefined') {
                this.$set(this.txs, x.Account, [])
                this.$set(this.txs[x.Account], '__count', 0)
              }
              if (typeof this.txs[x.Account][x.TransactionType] === 'undefined') {
                this.$set(this.txs[x.Account], x.TransactionType, 0)
              }
              this.txs[x.Account][x.TransactionType]++
              this.txs[x.Account].__count++
            })
          }
        }).catch(e => {})
      }
    }
  }
}
</script>

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
  .vertical {
    display: block;
    position: absolute;
    transform: rotate(305deg);
    transform-origin: left bottom 0;
    margin-top: -20px;
    margin-left: 32px;
  }
  table.table.table-striped {
    border-top: none !important;
    border-right: none !important;
    border-left: none !important;
    tr, th {
      border-top: none !important;
      border-left: none !important;
      border-right: none !important;
    }
  }
</style>
