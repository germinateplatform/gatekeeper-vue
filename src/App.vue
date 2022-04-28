<template>
  <div>
    <b-navbar type="dark" variant="dark" fixed="top" class="flex-md-nowrap p-0 shadow">
      <b-navbar-brand class="col-md-3 col-lg-2 mr-0 text-center" to="/">
        <b-img src="./gatekeeper-square.svg" height=50 />
      </b-navbar-brand>
      <b-navbar-nav class="ml-auto mr-2">
        <b-nav-item :to="token ? '/about' : '/gk/about'">{{ $t('navbarActionAbout') }}</b-nav-item>
        <b-nav-item-dropdown text="Lang" right>
          <template slot="button-content"><MdiIcon :path="mdiTranslate" /></template>
          <b-dropdown-item v-for="language in languages" :key="language.locale" @click="onLocaleChanged(language)"><flag :squared="false" :iso="language.flag" class="flag-icon" /> {{ language.name }}</b-dropdown-item>
        </b-nav-item-dropdown>
        <b-nav-item to="/" @click="signOut" :title="$t('navbarActionSignOut')" v-if="token">
          <MdiIcon :path="mdiLogoutVariant" />
        </b-nav-item>
      </b-navbar-nav>
    </b-navbar>

    <router-view />

    <footer id="sticky-footer" class="py-2 px-3 bg-dark text-white-50">
      <div class="text-right">
        <small><a href="#" @click="$event.preventDefault()" v-b-modal.cookie-policy>{{ $t('widgetFooterCookiePolicy') }}</a></small> | <small v-html="$t('widgetFooterText', { year: new Date().getFullYear(), version: $t('appVersion') })"></small>
      </div>
    </footer>
    <b-modal id="cookie-policy" :title="$t('modalCookiePolicyTitle')">
      <div v-html="$t('modalCookiePolicyMessage')"></div>
      <template slot="modal-footer" slot-scope="{ ok }">
        <b-button @click="ok()">
          {{ $t('genericOk') }}
        </b-button>
      </template>
    </b-modal>
    <b-modal ref="loadingModal" :title="$t('modalTitleLoading')" hide-footer no-close-on-backdrop no-close-on-esc hide-header-close>
      <div class="text-center">
        <b-spinner style="width: 3rem; height: 3rem;" variant="primary" type="grow" />
      </div>
    </b-modal>
  </div>
</template>

<script>
import MdiIcon from '@/components/MdiIcon'
import { mapState } from 'vuex'
import { EventBus } from './event-bus.js'

import { mdiLogoutVariant, mdiTranslate } from '@mdi/js'

export default {
  name: 'app',
  data: function () {
    return {
      mdiLogoutVariant,
      mdiTranslate,
      languages: [{
        locale: 'en_GB',
        flag: 'gb',
        name: 'British English'
      }, {
        locale: 'de_DE',
        flag: 'de',
        name: 'Deutsch - Deutschland'
      }]
    }
  },
  computed: {
    ...mapState([
      'token',
      'locale'
    ])
  },
  components: {
    MdiIcon
  },
  methods: {
    onLocaleChanged: function (language) {
      this.$i18n.locale = language.locale
      this.$store.dispatch('ON_LOCALE_CHANGED', language.locale)
    },
    signOut: function () {
      const user = {
        email: this.token.username,
        password: this.token.token
      }

      this.apiDeleteToken(user, result => {
        // If it's successful, delete token, then redirect
        this.$store.dispatch('ON_TOKEN_CHANGED', null)
        this.$router.push('/gk/login')
      }, {
        codes: [],
        callback: () => {
          // If they're wrong, remove
          this.$store.dispatch('ON_TOKEN_CHANGED', null)
        }
      })
    },
    toggleLoading: function (show) {
      if (show) {
        this.$refs.loadingModal.show()
      } else {
        this.$refs.loadingModal.hide()
      }
    }
  },
  destroyed: function () {
    EventBus.$off('show-loading', this.toggleLoading)
  },
  mounted: function () {
    EventBus.$on('show-loading', this.toggleLoading)

    if (this.locale) {
      this.$i18n.locale = this.languages.map(l => l.locale).filter(l => this.locale === l)
    }
  }
}
</script>

<style lang="scss">
$font-size-base: 1rem;
$primary: #23a1d7;
$dark:    #36363b;
$secondary: #bdc3c7;
$success: #27ae60;
$info:    #3498db;
$warning: #f39c12;
$danger:  #e74c3c;
$indigo:  #6610f2;
$purple:  #6f42c1;
$pink:    #e83e8c;
$red:     #dc3545;
$orange:  #fd7e14;
$yellow:  #ffc107;
$green:   #28a745;
$teal:    #20c997;
$cyan:    #17a2b8;
$headings-font-weight: 400;
$badge-font-size: 85%;
$small-font-size: 70%;

$container-max-widths: (
  sm: 540px,
  md: 720px,
  lg: 960px,
  xl: 1140px,
  xxl: 1400px
);

$grid-breakpoints: (
  xs: 0,
  sm: 576px,
  md: 768px,
  lg: 992px,
  xl: 1200px,
  xxl: 1500px
);

@import '~bootswatch/dist/cosmo/variables';
@import '~bootstrap/scss/bootstrap';
@import '~bootstrap-vue/src/index.scss';
@import '~bootswatch/dist/cosmo/bootswatch';
@import '@/assets/css/custom.scss';

#app {
  flex: 1 0 auto;
  min-height: calc(100vh - 37px);
}

#sticky-footer {
  flex-shrink: 0;
}
</style>
