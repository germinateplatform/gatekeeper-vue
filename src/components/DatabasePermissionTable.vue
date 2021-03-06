<template>
  <v-server-table ref="table"
                  :url="'' + database.id"
                  :columns=columns
                  :options=options>
    <b-button variant="danger"
              slot="delete"
              slot-scope="props"
              size="sm"
              @click="deleteUserPermission(props.row, $event)">
      <DeleteIcon class="form-icon" />
    </b-button>
    <b-form-select slot="userType"
                  slot-scope="props"
                  :value="props.row.userType"
                  :options="userTypeOptions"
                  @change="setUserType(props.row, $event)" />
  </v-server-table>
</template>

<script>
import DeleteIcon from 'vue-material-design-icons/Delete'
import I18nTable from './I18nTable'

export default {
  extends: I18nTable,
  data: function () {
    return {
      columns: ['username', 'userType', 'delete'],
      options: {
        requestFunction: function (data) {
          var vm = this
          return this.apiGetDatabasePermissions(this.url, data, function (result) {
            vm.dispatch('success', result)
          })
        },
        responseAdapter: function (data) {
          return data.data
        },
        perPage: 10,
        headings: {
          username: () => this.$t('tableColumnUsername'),
          userType: () => this.$t('tableColumnUserType'),
          delete: () => this.$t('actionDelete')
        },
        columnsClasses: {
          delete: 'py-0 align-middle'
        },
        sortable: ['username', 'userType'],
        filterable: ['username', 'userType']
      },
      userTypeOptions: ['Administrator', 'Data Curator', 'Regular User', 'Suspended User']
    }
  },
  props: {
    database: {
      type: Object,
      required: true
    }
  },
  components: {
    DeleteIcon
  },
  methods: {
    refresh: function () {
      this.$refs.table.refresh()
    },
    setUserType: function (row, event) {
      var vm = this
      row.userType = event
      row.userTypeId = this.userTypeOptions.indexOf(event) + 1
      this.apiPatchUserPermission(row, function (result) {
        vm.refresh()
      })
    },
    deleteUserPermission: function (row, event) {
      var vm = this

      this.$bvModal.msgBoxConfirm(this.$t('modalMessageSure'), {
        okTitle: this.$t('genericYes'),
        okVariant: 'danger',
        cancelTitle: this.$t('genericNo')
      })
        .then(value => {
          if (value) {
            vm.apiDeleteUserPermission(row, function (result) {
              vm.refresh()
            })
          }
        })
    }
  }
}
</script>

<style>

</style>
