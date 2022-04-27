<template>
  <div>
    <BaseTable :columns="columns" :getData="getData" :tableActions="tableActions" selectMode="single" @row-selected="onDatabaseClicked" :supportsSearch="true" ref="table">
      <template v-slot:cell(delete)="data">
        <b-button variant="danger"
                size="sm"
                @click="deleteDatabase(data.item.id)">
        <MdiIcon :path="mdiDelete" />
      </b-button>
      </template>
    </BaseTable>

    <AddDatabaseModal ref="addDatabaseModal" @databases-updated="$refs.table.refresh()" />
  </div>
</template>

<script>
import MdiIcon from '@/components/MdiIcon'
import BaseTable from '@/components/BaseTable'
import AddDatabaseModal from './modal/AddDatabaseModal'
import { EventBus } from '../event-bus.js'

import { mdiDatabasePlus, mdiDelete } from '@mdi/js'

export default {
  data: function () {
    return {
      mdiDelete,
      database: null,
      tableActions: [{
        id: 0,
        text: () => this.$t('actionAddDatabase'),
        variant: null,
        path: mdiDatabasePlus,
        callback: () => {
          this.$refs.addDatabaseModal.show()
        }
      }]
    }
  },
  computed: {
    columns: function () {
      return [{
        key: 'systemName',
        sortable: true,
        label: this.$t('formLabelDatabase')
      }, {
        key: 'serverName',
        sortable: true,
        label: this.$t('formLabelServer')
      }, {
        key: 'description',
        sortable: true,
        label: this.$t('formLabelDescription')
      }, {
        key: 'delete',
        sortable: false,
        label: this.$t('actionDelete')
      }]
    }
  },
  components: {
    AddDatabaseModal,
    BaseTable,
    MdiIcon
  },
  methods: {
    getData: function (data, callback) {
      return this.apiGetDatabases(data, callback)
    },
    deleteDatabase: function (id) {
      this.$bvModal.msgBoxConfirm(this.$t('modalMessageSure'), {
        okTitle: this.$t('genericYes'),
        okVariant: 'danger',
        cancelTitle: this.$t('genericNo')
      })
        .then(value => {
          if (value) {
            this.apiDeleteDatabase(id, result => {
              if (result === true) {
                this.$bvToast.toast(this.$t('toastDeletedSuccessfully'), {
                  title: this.$t('formLabelDatabase'),
                  variant: 'success',
                  autoHideDelay: 5000,
                  appendToast: true
                })
              }

              EventBus.$emit('stats-count-changed')
              this.$refs.table.refresh()
            })
          }
        })
    },
    onDatabaseClicked: function (event) {
      this.database = (event && event.length > 0) ? event[0] : null

      this.$emit('database-selected', this.database)
    }
  }
}
</script>

<style>

</style>
