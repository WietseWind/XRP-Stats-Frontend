<template>
  <div id="app">
    <main role="main">
      <div class="d-md-flex flex-column flex-md-row align-items-center p-3 px-md-4 mb-3 bg-white border-bottom box-shadow">
        <router-link tag="h5" class="my-0 mr-md-auto font-weight-normal logo" to="/">
          <span class="logo">x</span> XRP Stats
        </router-link>
        <nav class="d-inline-block my-2 my-md-0 mr-md-3">
          <router-link to="/rich-index" class="p-2 routerlink btn" active-class="btn btn-outline-primary">Richlist Index</router-link>
        </nav>
        <nav class="d-none d-sm-inline-block my-2 my-md-0 mr-md-3">
          <router-link to="/tx-flow" class="p-2 routerlink btn" active-class="btn btn-outline-primary">Tx Flow</router-link>
        </nav>
        <nav class="d-inline-block my-2 my-md-0 mr-md-3">
          <router-link to="/rich-stats" class="p-2 routerlink btn" active-class="btn btn-outline-primary">Richlist Stats</router-link>
        </nav>
        <nav class="d-none d-sm-inline-block my-2 my-md-0 mr-md-3">
          <router-link to="/live-ledger-txs" class="p-2 routerlink btn" active-class="btn btn-outline-primary">Live Tx</router-link>
        </nav>
        <nav class="d-inline-block my-2 my-md-0 mr-md-3">
          <router-link to="/escrow-stats" class="p-2 routerlink btn" active-class="btn btn-outline-primary">Escrows</router-link>
        </nav>
      </div>
      <div class="container">
        <router-view/>
      </div>
    </main>

    <footer class="footer">
      <div class="container text-center">
        <small>
          <span class="text-muted">
            By <a href="https://twitter.com/WietseWind" target="_blank">@WietseWind</a> &bull;
            <a href="https://wietse.com/xrpl" target="_blank"><b>More projects</b></a>
          </span>
          &dash;
          <span class="text-muted">XRPTipBot: <a href="https://xrptipbot.com" target="_blank">xrptipbot.com</a></span>
          &dash;
          Source:
          <span class="text-muted"><a href="https://github.com/WietseWind/XRP-Stats-Frontend" target="_blank">Frontend</a></span>
          &amp;
          <span class="text-muted"><a href="https://github.com/WietseWind/XRP-Ledger-to-MongoDB" target="_blank">Backend</a></span>
        </small>
      </div>
    </footer>
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>

<style lang="scss">
@font-face {
  font-family: 'r1ppled';
  src:  url('/static/xrp-font/r1ppled.eot');
  src:  url('/static/xrp-font/r1ppled.eot#iefix') format('embedded-opentype'),
    url('/static/xrp-font/r1ppled.ttf') format('truetype'),
    url('/static/xrp-font/r1ppled.woff') format('woff'),
    url('/static/xrp-font/r1ppled.svg#r1ppled') format('svg');
  font-weight: normal;
  font-style: normal;
}

html {
  font-size: 14px;
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}
html {
  position: relative;
  min-height: 100%;
}
body {
  margin-bottom: 60px; /* Margin bottom by footer height */
}
@media (min-width: 768px) {
  html {
    font-size: 16px;
  }
}
@media (max-width: 768px) {
  nav.my-2 {
    // display: inline-block !important;
    margin: 0px !important;
    margin-top: 4px !important;
    a.btn {
      display: inline-block !important;
      padding: 3px 6px !important;
    }
  }
}

.container {
  max-width: 960px;
}

.pricing-header {
  max-width: 700px;
}

.card-deck .card {
  min-width: 220px;
}

.border-top { border-top: 1px solid #e5e5e5; }
.border-bottom { border-bottom: 1px solid #e5e5e5; }

.box-shadow { box-shadow: 0 .25rem .75rem rgba(0, 0, 0, .05); }

.routerlink {
  &:not(.btn) {
    color: #343a40!important;
  }
}

.footer {
  position: absolute;
  bottom: 0;
  width: 100%;
  height: 60px; /* Set the fixed height of the footer here */
  overflow: hidden;
  line-height: 60px; /* Vertically center the text there */
  background-color: #f5f5f5;
}

.logo {
  // background-image: url('assets/logo.png');
  background-repeat: no-repeat;
  background-position: top left;
  background-size: contain;
  padding: 10px;
  padding-left: 43px;
  cursor: pointer;
  span {
    font-family: 'r1ppled';
    font-size: 4em;
    display: block;
    position: absolute;
    left: -25px;
    top: -0.362em;
  }
  &:hover {
    text-decoration: none;
    color: #2079F9;
    span {
      text-decoration: none;
      color: #2079F9;
    }
  }
}
</style>
