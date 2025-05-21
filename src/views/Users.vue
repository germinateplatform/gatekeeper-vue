<template>
  <b-container fluid class="mt-3">
    <h1>{{ $t('pageUsersHeading') }}</h1>
    <UserTable ref="userTable"
               v-on:user-selected="(user) => onUserSelected(user)" />
    <template v-if="user">
      <b-row>
        <b-col xs=12 md=6>
          <b-card header-tag="header" class="mb-3">
            <h6 slot="header" class="mb-0">{{ $t('pageUsersHeadingDetails') }}</h6>
            <dl>
              <dt>{{ $t('tableColumnUsername') }}</dt><dd>{{ user.username }}</dd>
              <dt>{{ $t('tableColumnFullName') }}</dt><dd>{{ user.fullName }}</dd>
              <dt>{{ $t('tableColumnEmail') }}</dt><dd>{{ user.emailAddress }}</dd>
              <dt>{{ $t('tableColumnInstitute') }}</dt><dd>{{ getInstitution() }}</dd>
              <dt>{{ $t('tableColumnLastLogin') }}</dt><dd>
                <template v-if="user.lastLogin">
                  {{ new Date(user.lastLogin).toLocaleString() }}
                </template>
                <template v-else>
                  --
                </template>
              </dd>
            </dl>
          </b-card>
        </b-col>
        <b-col xs=12 md=6>
          <b-card header-tag="header" class="mb-3">
            <h6 slot="header" class="mb-0">{{ $t('pageUsersHeadingActions') }}</h6>
            <h5>{{ $t('pageUsersHeadingGatekeeperAccess') }}</h5>
            <b-form-checkbox
              value="1"
              unchecked-value="0"
              v-model="user.gatekeeperAccess"
              @change="onGatekeeperAccessChanged($event)">
              {{ $t('pageUsersTextGatekeeperAccess') }}
            </b-form-checkbox>
            <h5 class="mt-3">{{ $t('pageUsersHeadingDeleteUser') }}</h5>
            <p>{{ $t('pageUsersTextDeleteUser') }}</p>
            <b-button variant="danger" @click="onDeleteUserClicked()">{{ $t('actionDelete') }}</b-button>
          </b-card>
        </b-col>
        <b-col xs=12 md=6>
          <b-card header-tag="header" class="mb-3">
            <h6 slot="header" class="mb-0">{{ $t('pageUsersHeadingPermissions') }}</h6>
            <UserPermissionTable :user="user"
                                 ref="permissionsTable" />
          </b-card>
        </b-col>
        <b-col xs=12 md=6>
          <b-card header-tag="header" class="mb-3">
            <h6 slot="header" class="mb-0">{{ $t('pageUsersHeadingGrantPermission') }}</h6>
            <b-tabs content-class="mt-3">
              <b-tab :title="$t('pageUsersTabExisting')" active>
                <b-form @submit.prevent="onSubmitExistingPermission">
                  <b-input-group class="mt-3">
                    <b-input-group-prepend is-text>
                      <DatabaseIcon class="form-icon" />
                    </b-input-group-prepend>
                    <b-form-select v-model="newPermission.database"
                                   :options="databases"
                                   value-field="id"
                                   required />
                  </b-input-group>
                  <b-input-group class="mt-3">
                    <b-input-group-prepend is-text>
                      <AccountStarIcon class="form-icon" />
                    </b-input-group-prepend>
                    <b-form-select v-model="newPermission.userType"
                                   :options="userTypeOptions"
                                   required />
                  </b-input-group>
                  <b-input-group class="mt-3">
                    <b-input-group-prepend is-text>
                      <CardAccountMailIcon class="form-icon" />
                    </b-input-group-prepend>
                    <b-form-checkbox v-model="newPermission.userIsPrimaryContact"
                                     value="1"
                                     unchecked-value="0"
                                     class="form-control form-checkbox"
                                     switch
                                     required>{{ $t('tableColumnUserIsPrimary') }}</b-form-checkbox>
                  </b-input-group>
                  <b-button type="submit" variant="primary" class="mt-3">{{ $t('actionAdd') }}</b-button>
                </b-form>
              </b-tab>
              <b-tab :title="$t('pageUsersTabNew')">
                <b-form @submit.prevent="onSubmitNewPermission">
                  <b-input-group class="mt-3">
                    <b-input-group-prepend is-text>
                      <DatabaseIcon class="form-icon" />
                    </b-input-group-prepend>
                    <b-form-input  v-model="newPermission.database"
                                   :placeholder="$t('formLabelDatabase')"
                                   required />
                  </b-input-group>
                  <b-input-group class="mt-3">
                    <b-input-group-prepend is-text>
                      <ServerIcon class="form-icon" />
                    </b-input-group-prepend>
                    <b-form-input  v-model="newPermission.server"
                                   :placeholder="$t('formLabelServer')"
                                   required />
                  </b-input-group>
                  <b-input-group class="mt-3">
                    <b-input-group-prepend is-text>
                      <PencilIcon class="form-icon" />
                    </b-input-group-prepend>
                    <b-form-input  v-model="newPermission.description"
                                   :placeholder="$t('formLabelDescription')" />
                  </b-input-group>
                  <b-input-group class="mt-3">
                    <b-input-group-prepend is-text>
                      <AccountStarIcon class="form-icon" />
                    </b-input-group-prepend>
                    <b-form-select v-model="newPermission.userType"
                                   :options="userTypeOptions"
                                   required />
                  </b-input-group>
                  <b-input-group class="mt-3">
                    <b-input-group-prepend is-text>
                      <CardAccountMailIcon class="form-icon" />
                    </b-input-group-prepend>
                    <b-form-checkbox v-model="newPermission.userIsPrimaryContact"
                                     value="1"
                                     unchecked-value="0"
                                     class="form-control form-checkbox"
                                     switch
                                     required>{{ $t('tableColumnUserIsPrimary') }}</b-form-checkbox>
                  </b-input-group>
                  <b-button type="submit" variant="primary" class="mt-3">{{ $t('actionAdd') }}</b-button>
                </b-form>
              </b-tab>
            </b-tabs>
          </b-card>
        </b-col>
      </b-row>
    </template>
  </b-container>
</template>

<script>
import AccountStarIcon from 'vue-material-design-icons/AccountStar.vue'
import CardAccountMailIcon from 'vue-material-design-icons/CardAccountMail.vue'
import DatabaseIcon from 'vue-material-design-icons/Database.vue'
import PencilIcon from 'vue-material-design-icons/Pencil.vue'
import ServerIcon from 'vue-material-design-icons/Server.vue'

import UserTable from '../components/UserTable'
import UserPermissionTable from '../components/UserPermissionTable'

import { EventBus } from '../event-bus.js'

export default {
  data: function () {
    return {
      user: null,
      databases: [],
      newPermission: {
        database: null,
        server: null,
        description: null,
        userType: 2,
        userIsPrimaryContact: '0'
      },
      userTypeOptions: [{
        value: 1,
        text: 'Administrator'
      }, {
        value: 4,
        text: 'Data Curator'
      }, {
        value: 2,
        text: 'Regular User'
      }, {
        value: 3,
        text: 'Suspended User'
      }]
    }
  },
  components: {
    AccountStarIcon,
    DatabaseIcon,
    PencilIcon,
    ServerIcon,
    UserTable,
    UserPermissionTable,
    CardAccountMailIcon
  },
  methods: {
    getInstitution: function () {
      let result = ''

      if (this.user.name) {
        result += this.user.name
      }
      if (this.user.acronym) {
        result += ' (' + this.user.acronym + ')'
      }
      if (this.user.address) {
        result += ' - ' + this.user.address
      }
      if (result.length === 0) {
        result = '-'
      }

      return result
    },
    onUserSelected: function (user) {
      this.user = user

      this.$nextTick(() => this.$refs.permissionsTable.refresh())
    },
    onGatekeeperAccessChanged: function (event) {
      this.apiPatchUserGatekeeperAccess(this.user.id, event)
    },
    resetNewPermission: function () {
      this.newPermission = {
        database: null,
        server: null,
        description: null,
        userType: 2,
        userIsPrimaryContact: '0'
      }
    },
    onDeleteUserClicked: function () {
      this.$bvModal.msgBoxConfirm(this.$t('modalMessageSure'), {
        okTitle: this.$t('genericYes'),
        okVariant: 'danger',
        cancelTitle: this.$t('genericNo')
      })
        .then(value => {
          if (value) {
            this.apiDeleteUser(this.user.id, result => {
              this.user = null
              this.update()
            })
          }
        })
    },
    update: function () {
      this.$refs.userTable.refresh()

      EventBus.$emit('stats-count-changed')
    },
    onSubmitNewPermission: function () {
      if (this.newPermission.database && this.newPermission.server && this.newPermission.userType) {
        const toSend = {
          systemName: this.newPermission.database,
          serverName: this.newPermission.server,
          description: this.newPermission.description
        }

        this.apiPostDatabase(toSend, result => {
          if (result) {
            const toSend = {
              userId: this.user.id,
              databaseId: result,
              userTypeId: this.newPermission.userType,
              userIsPrimaryContact: this.newPermission.userIsPrimaryContact
            }

            EventBus.$emit('stats-count-changed')

            this.apiPostUserPermission(toSend, () => {
              this.$refs.permissionsTable.refresh()
              this.resetNewPermission()
            })
          }
        })
      }
    },
    onSubmitExistingPermission: function () {
      if (this.newPermission.database && this.newPermission.userType) {
        const toSend = {
          userId: this.user.id,
          databaseId: this.newPermission.database,
          userTypeId: this.newPermission.userType,
          userIsPrimaryContact: this.newPermission.userIsPrimaryContact
        }

        this.apiPostUserPermission(toSend, result => {
          this.resetNewPermission()
          this.$refs.permissionsTable.refresh()
        })
      }
    }
  },
  mounted: function () {
    this.apiGetDatabases({ page: 1, limit: this.MAX_JAVA_INTEGER }, result => {
      if (result && result.data) {
        result.data.forEach(d => {
          d.text = d.serverName + ' -> ' + d.systemName
        })

        this.databases = result.data
      }
    })
  }
}
</script>

<style>
.form-checkbox .custom-control-label {
  margin-left: 0.5rem !important;
}
</style>
