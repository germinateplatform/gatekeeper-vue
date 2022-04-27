<template>
  <BaseTable :columns="columns" :getData="getData" ref="table">
    <template v-slot:cell(delete)="data">
      <b-button variant="danger"
              size="sm"
              @click="deleteUserPermission(data.item)">
        <MdiIcon :path="mdiDelete" />
      </b-button>
    </template>
    <template v-slot:cell(userTypeId)="data">
      <b-form-select
                  :value="data.item.userTypeId"
                  :options="userTypeOptions"
                  @change="setUserType(data.item, $event)" />
    </template>
  </BaseTable>
</template>

<script>
import BaseTable from '@/components/BaseTable'
import MdiIcon from '@/components/MdiIcon'

import { mdiDelete } from '@mdi/js'

export default {
  data: function () {
    return {
      mdiDelete,
      userTypeOptions: [{
        text: 'Administrator',
        value: 1
      }, {
        text: 'Data Curator',
        value: 4
      }, {
        text: 'Regular User',
        value: 2
      }, {
        text: 'Suspended User',
        value: 3
      }]
    }
  },
  computed: {
    columns: function () {
      return [{
        key: 'systemName',
        label: this.$t('formLabelDatabase'),
        sortable: true
      }, {
        key: 'serverName',
        label: this.$t('formLabelServer'),
        sortable: true
      }, {
        key: 'username',
        label: this.$t('tableColumnUsername'),
        sortable: true
      }, {
        key: 'userTypeId',
        label: this.$t('tableColumnUserType'),
        sortable: true
      }, {
        key: 'delete',
        label: this.$t('actionDelete'),
        sortable: false
      }]
    }
  },
  props: {
    user: {
      type: Object,
      required: true
    }
  },
  components: {
    BaseTable,
    MdiIcon
  },
  methods: {
    getData: function (data, callback) {
      return this.apiGetUserPermissions(this.user.id, data, callback)
    },
    refresh: function () {
      this.$refs.table.refresh()
    },
    setUserType: function (row, newValue) {
      const payload = JSON.parse(JSON.stringify(row))
      payload.userTypeId = newValue
      payload.userType = this.userTypeOptions.filter(t => t.value === newValue)[0].text
      this.apiPatchUserPermission(payload, () => this.refresh())
    },
    deleteUserPermission: function (row) {
      this.$bvModal.msgBoxConfirm(this.$t('modalMessageSure'), {
        okTitle: this.$t('genericYes'),
        okVariant: 'danger',
        cancelTitle: this.$t('genericNo')
      })
        .then(value => {
          if (value) {
            this.apiDeleteUserPermission(row, () => this.refresh())
          }
        })
    }
  }
}
</script>

<style>

</style>
