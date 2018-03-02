<template>
  <div class="hello">
    <div class="pricing-header px-3 py-3 pt-md-5 pb-md-4 mx-auto text-center">
      <h1 class="display-4">XRP Stats</h1>
      <p class="lead">Because everything on the ledger is public information 🎉</p>
    </div>

    <div class="card-deck mb-3 text-center">
      <div class="card mb-4 box-shadow">
        <div class="card-header">
          <h4 class="my-0 font-weight-normal">Your Richlist Index</h4>
        </div>
        <div class="card-body">
          <p>How are you hodling up?</p>
          <router-link to="/rich-index" class="btn btn-md btn-block btn-outline-primary">Lookup</router-link>
        </div>
      </div>
      <div class="card mb-4 box-shadow">
        <div class="card-header">
          <h4 class="my-0 font-weight-normal">Richlist stats</h4>
        </div>
        <div class="card-body">
          <p>You wish 😉</p>
          <router-link to="/rich-stats" class="btn btn-md btn-block btn-outline-primary">Show me</router-link>
        </div>
      </div>
      <div class="card mb-4 box-shadow">
        <div class="card-header">
          <h4 class="my-0 font-weight-normal">Escrow stats</h4>
        </div>
        <div class="card-body">
          <p>One day...🔒</p>
          <router-link to="/escrow-stats" class="btn btn-md btn-block btn-outline-primary">Filter it...</router-link>
        </div>
      </div>
    </div>

    <div class="card box-shadow">
      <div class="card-body text-center text-muted">
        <small>If you want to analyze the data yourself: every ~15 minutes the entire ledger export is saved for you to download 🎉</small>
        <br />
        <small>
          Accounts (250~400MB): <a href="https://ledger.exposed/download/latest_account_data.csv">CSV</a> / <a href="https://ledger.exposed/download/latest_account_data.json">JSON</a>
          &dash;
          Escrows (&lt;1MB): <a href="https://ledger.exposed/download/latest_escrow_data.csv">CSV</a> / <a href="https://ledger.exposed/download/latest_escrow_data.json">JSON</a>
        </small>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Home',
  data () {
    return {
    }
  },
  methods: {
  }
}
</script>

<style lang="scss" scoped>
</style>
