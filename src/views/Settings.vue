<template>
  <b-container fluid class="mt-3">
    <h1>{{ $t('pageSettingsHeading') }}</h1>
    <b-row>
      <b-col xs=12 md=6>
        <b-card header-tag="header" class="mb-3">
          <h6 slot="header" class="mb-0">{{ $t('pageSettingsHeadingUpdateEmail') }}</h6>
          <b-form @submit.prevent="onEmailChanged()">
            <b-form-group>
              <label for="email">{{ $t('formLabelEmail') }}</label>
              <b-input-group>
                <b-input-group-prepend is-text>
                  <AtIcon class="form-icon" />
                </b-input-group-prepend>
                <b-form-input name="email" id="email" type="email" v-model="email" required />
              </b-input-group>
            </b-form-group>
            <b-button variant="primary" type="submit" class="float-right" slot="footer">{{ $t('actionUpdate') }}</b-button>
          </b-form>
        </b-card>
      </b-col>
      <b-col xs=12 md=6>
        <b-card header-tag="header" class="mb-3">
          <h6 slot="header" class="mb-0">{{ $t('pageSettingsHeadingUpdatePassword') }}</h6>

          <b-form @submit.prevent="onPasswordChanged()">
            <b-form-group>
              <label for="old-password">{{ $t('formLabelCurrentPassword') }}</label>
              <b-input-group>
                <b-input-group-prepend is-text>
                  <KeyRemoveIcon class="form-icon" />
                </b-input-group-prepend>
                <b-form-input name="old-password" id="old-password" type="password" v-model="oldPassword" required />
              </b-input-group>
            </b-form-group>

            <PasswordInput ref="passwordInput" @change="update"/>
            <b-button :disabled="!canContinue" type="submit" variant="primary" class="float-right" slot="footer">{{ $t('actionUpdate') }}</b-button>
          </b-form>
        </b-card>
      </b-col>
    </b-row>
  </b-container>
</template>

<script>
import { mapState } from 'vuex'
import AtIcon from 'vue-material-design-icons/At.vue'
import KeyRemoveIcon from 'vue-material-design-icons/KeyRemove.vue'
import PasswordInput from '@/components/PasswordInput.vue'
import { EventBus } from '@/event-bus.js'

export default {
  data: function () {
    return {
      user: null,
      email: '',
      oldPassword: '',
      canContinue: false
    }
  },
  computed: {
    ...mapState([
      'token'
    ])
  },
  components: {
    AtIcon,
    KeyRemoveIcon,
    PasswordInput
  },
  methods: {
    update: function () {
      this.canContinue = this.$refs.passwordInput.valid()
    },
    onPasswordChanged: function () {
      const password = this.$refs.passwordInput.getPassword()
      const passwordConfirm = this.$refs.passwordInput.getPasswordConfirm()
      const score = this.$refs.passwordInput.getScore()

      if (password && passwordConfirm && password === passwordConfirm && score >= 2) {
        const update = {
          oldPassword: this.oldPassword,
          newPassword: password
        }
        EventBus.$emit('show-loading', true)
        this.apiPatchUserPassword(this.token.id, update, result => {
          EventBus.$emit('show-loading', false)
          if (result === true) {
            this.$bvToast.toast('Update successful.', {
              title: 'Password',
              variant: 'success',
              autoHideDelay: 5000,
              appendToast: true
            })

            // Revoke the token and redirect to login
            this.$store.dispatch('ON_TOKEN_CHANGED', null)
            this.$router.push('/gk/login')
          }
        }, {
          codes: [401],
          callback: err => {
            EventBus.$emit('show-loading', false)
            if (err.status === 401) {
              this.$bvToast.toast('Update failed. Wrong password provided.', {
                title: 'Password',
                variant: 'danger',
                autoHideDelay: 5000,
                appendToast: true
              })
            } else {
              console.error(err)
            }
          }
        })
      }
    },
    onEmailChanged: function () {
      if (this.email && this.email.length > 0) {
        const update = {
          oldEmail: this.token.email,
          newEmail: this.email
        }

        this.apiPatchUserEmail(this.token.id, update, result => {
          if (result === true) {
            this.$store.dispatch('ON_EMAIL_CHANGED', this.email)

            this.$bvToast.toast('Update successful.', {
              title: 'Email',
              variant: 'success',
              autoHideDelay: 5000,
              appendToast: true
            })
          }
        })
      }
    }
  },
  mounted: function () {
    this.email = this.token.email

    this.apiGetUser(this.token.id, result => {
      this.user = result[0]
    })
  }
}
</script>

<style>
</style>
