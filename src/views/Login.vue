<template>
  <div>
    <main class="container container-fluid">
      <b-form class="form-signin" @submit.prevent="checkCreds">
        <b-img src="./gatekeeper-square.svg" fluid class="mb-3 mt-5 px-5" />
        <h1 class="text-center">Germinate Gatekeeper</h1>
        <h1 class="h3 my-3 font-weight-normal">{{ $t('pageLoginHeading') }}</h1>
        <label for="inputUsername" class="sr-only">{{ $t('formLabelUsername') }}</label>
        <input id="inputUsername" class="form-control" :placeholder="$t('formLabelUsername')" required autofocus v-model="user.username">
        <label for="inputPassword" class="sr-only">{{ $t('formLabelUsername') }}</label>
        <input type="password" id="inputPassword" class="form-control" :placeholder="$t('formLabelPassword')" required v-model="user.password">
        <b-button variant="link" class="forgot-password" v-b-modal.modal-password>{{ $t('pageLoginForgotPassword') }}</b-button>
        <b-button size="lg" variant="primary" block type="submit">{{ $t('pageLoginSignIn') }}</b-button>

        <div v-if=response class="text-red"><p class="vertical-5p lead">{{ response }}</p></div>
      </b-form>
    </main>

    <b-modal id="modal-password"
             :title="$t('modalHeadingResetPassword')"
             :ok-title="$t('genericSend')"
             :ok-disabled="resetInProgress"
             :cancel-title="$t('genericCancel')"
             :cancel-disabled="resetInProgress"
             ref="resetModal"
             @ok="handleOk">
      <b-form ref="resetForm" :class="formValidated ? 'was-validated' : 'needs-validation'" @submit.stop.prevent="onPasswordReset">
        <b-form-group :label="$t('formLabelUsername')" label-for="inputUsername" :invalid-feedback="$t('formFeedbackUsernameRequired')">
          <b-form-input id="inputUsername" name="username" :placeholder="$t('formLabelUsername')" required autofocus v-model="reset.username" />
        </b-form-group>
        <b-form-group :label="$t('formLabelEmail')" label-for="inputEmail" :invalid-feedback="$t('formFeedbackEmailRequired')">
          <b-form-input id="inputEmail" name="email" :placeholder="$t('formLabelEmail')" type="email" required v-model="reset.email" :state="formError ? 'invalid' : null"/>
        </b-form-group>
        <p class="text-info">{{ $t('modalMessageResetPassword') }}</p>
        <p class="text-danger" v-if="formError">{{ formError }} </p>
      </b-form>
    </b-modal>
  </div>
</template>

<script>
import { EventBus } from '@/event-bus.js'

export default {
  data: function () {
    return {
      user: {
        username: null,
        password: null
      },
      reset: {
        email: null
      },
      formValidated: false,
      formError: null,
      error: false,
      resetInProgress: false,
      section: 'Login',
      response: ''
    }
  },
  methods: {
    checkFormValidity: function () {
      this.formValidated = true
      return this.$refs.resetForm.checkValidity()
    },
    onPasswordReset: function () {
      if (this.checkFormValidity()) {
        this.formError = null

        this.resetInProgress = true
        EventBus.$emit('show-loading', true)
        this.apiPostPasswordReset(this.reset, result => {
          EventBus.$emit('show-loading', false)
          if (result === true) {
            this.$bvToast.toast(this.$t('toastPasswordResetSuccessful'), {
              title: this.$t('genericSuccess'),
              variant: 'success',
              autoHideDelay: 5000,
              appendToast: true
            })
          } else {
            this.$bvToast.toast(this.$t('errorMessageUnknownServerError'), {
              title: this.$t('genericError'),
              variant: 'danger',
              autoHideDelay: 5000,
              appendToast: true
            })
          }
          this.$refs.resetModal.hide()
          this.resetInProgress = false
        }, {
          codes: [],
          callback: err => {
            EventBus.$emit('show-loading', false)
            this.formValidated = false
            if (err) {
              if (err.status === 400) {
                this.formError = this.$t('errorMessageInvalidEmailUsername')
              } else if (err.status === 503) {
                this.formError = this.$t('errorMessageEmailUnavailable')
              } else {
                this.formError = this.$t('errorMessageUnknownServerError')
              }
            }
          }
        })
      }
    },
    handleOk (event) {
      event.preventDefault()
      this.onPasswordReset()
    },
    checkCreds: function () {
      this.resetResponse()

      this.apiPostToken(this.user, result => {
        this.error = false
        // If it's successful, finally store them
        this.$store.dispatch('ON_TOKEN_CHANGED', result)
        this.$router.push('/')
      }, {
        codes: [400, 403],
        callback: error => {
          console.log('error', error)
          this.error = true
          if (error.status === 403 || error.status === 400) {
            this.response = this.$t('errorMessageInvalidUsernamePassword')
          } else {
            this.response = this.$t('errorMessageServerUnavailable')
          }
          // If they're wrong, remove
          this.$store.dispatch('ON_TOKEN_CHANGED', null)
        }
      })
    },
    resetResponse () {
      this.response = ''
    }
  }
}
</script>

<style>

</style>
