<template>
  <div>
    <BaseTable :columns="columns" :getData="getData" sortBy="createdOn" :sortDesc="true" :supportsSearch="true" ref="table">
      <template v-slot:cell(createdOn)="data">
        <span v-if="data.item.createdOn">{{ new Date(data.item.createdOn).toLocaleString() }}</span>
      </template>
      <template v-slot:cell(activationKey)="data">
        <span v-b-tooltip:hover :title="$t('tooltipEmailActivationAwaiting')" v-if="data.item.activationKey && data.item.activationKey.length > 0" class="text-danger">
          <MdiIcon :path="mdiTimerSand" />
        </span>
        <span v-b-tooltip:hover :title="$t('tooltipEmailActivationSuccessful')" v-else class="text-success">
          <MdiIcon :path="mdiEmailCheckOutline" />
        </span>
      </template>
      <template v-slot:cell(actions)="data">
        <b-button-group>
          <b-button size="sm"
                    v-b-tooltip.hover
                    variant="secondary"
                    :title="$t('actionDelete')"
                    @click="onAction('delete', data.item)">
            <MdiIcon :path="mdiDelete" />
          </b-button>
          <b-button size="sm"
                    v-b-tooltip.hover
                    variant="danger"
                    :title="$t('actionReject')"
                    @click="onAction('reject', data.item)">
            <MdiIcon :path="mdiThumbDown" />
          </b-button>
          <b-button size="sm"
                    v-b-tooltip.hover
                    variant="success"
                    :title="$t('actionAccept')"
                    @click="onAction('approve', data.item)">
            <MdiIcon :path="mdiThumbUp" />
          </b-button>
        </b-button-group>
      </template>
    </BaseTable>

    <b-modal ref="feedbackModal" @ok="onReject(null)" :ok-title="$t('actionReject')" ok-variant="danger" :cancel-title="$t('actionCancel')" :title="$t('modalTitleRejection')" v-if="currentRow">
      <b-form @submit.prevent="onReject(null)">
        <b-textarea rows="5" :placeholder="$t('modalTextRejection')" v-model="rejectionReason" />
      </b-form>
    </b-modal>
  </div>
</template>

<script>
import BaseTable from '@/components/BaseTable'
import MdiIcon from '@/components/MdiIcon'
import { EventBus } from '../event-bus.js'

import { mdiTimerSand, mdiEmailCheckOutline, mdiDelete, mdiThumbDown, mdiThumbUp } from '@mdi/js'

export default {
  data: function () {
    return {
      mdiTimerSand,
      mdiEmailCheckOutline,
      mdiDelete,
      mdiThumbDown,
      mdiThumbUp,
      currentRow: null,
      rejectionReason: null
    }
  },
  computed: {
    columns: function () {
      return [{
        key: 'username',
        label: this.$t('tableColumnUsername'),
        sortable: true
      }, {
        key: 'fullName',
        label: this.$t('tableColumnFullName'),
        sortable: true
      }, {
        key: 'emailAddress',
        label: this.$t('tableColumnEmail'),
        sortable: true
      }, {
        key: 'name',
        label: this.$t('tableColumnInstituteName'),
        sortable: true
      }, {
        key: 'acronym',
        label: this.$t('tableColumnInstituteAcronym'),
        sortable: true
      }, {
        key: 'address',
        label: this.$t('tableColumnInstituteAddress'),
        sortable: true
      }, {
        key: 'databaseSystemName',
        label: this.$t('tableColumnRequestsAccessTo'),
        sortable: true
      }, {
        key: 'databaseServerName',
        label: this.$t('tableColumnRequestsOnServer'),
        sortable: true
      }, {
        key: 'activationKey',
        label: this.$t('tableColumnRequestsActivationKey'),
        sortable: true
      }, {
        key: 'createdOn',
        label: this.$t('tableColumnRequestsOnDate'),
        sortable: true
      }, {
        key: 'actions',
        label: '',
        sortable: false
      }]
    }
  },
  props: {
    getData: {
      type: Function,
      default: () => {
        return {
          data: [],
          count: 0
        }
      }
    },
    requestType: {
      type: String,
      required: true,
      validator: (val) => ['new', 'existing'].includes(val)
    }
  },
  components: {
    BaseTable,
    MdiIcon
  },
  methods: {
    onAction: function (decision, row) {
      this.$bvModal.msgBoxConfirm(this.$t('modalMessageSure'), {
        okTitle: this.$t('genericYes'),
        okVariant: 'danger',
        cancelTitle: this.$t('genericNo')
      })
        .then(value => {
          if (value) {
            switch (decision) {
              case 'delete':
                this.onDelete(row)
                break
              case 'reject':
                this.onReject(row)
                break
              case 'approve':
                this.onApprove(row)
                break
            }
          }
        })
    },
    onReject: function (row) {
      if (row) {
        this.currentRow = row
        this.$nextTick(() => this.$refs.feedbackModal.show())
      } else {
        EventBus.$emit('show-loading', true)
        var decision = {
          requestId: this.currentRow.id,
          decision: 'REJECT',
          feedback: this.rejectionReason
        }

        if (this.requestType === 'new') {
          this.apiPostDecisionNewRequests(this.currentRow.id, decision, result => {
            this.refresh()
            EventBus.$emit('show-loading', false)
          })
        } else if (this.requestType === 'existing') {
          this.apiPostDecisionExistingRequests(this.currentRow.id, decision, result => {
            this.refresh()
            EventBus.$emit('show-loading', false)
          })
        }
        this.currentRow = null
      }

      this.rejectionReason = null
    },
    onApprove: function (row) {
      EventBus.$emit('show-loading', true)
      var decision = {
        requestId: row.id,
        decision: 'APPROVE'
      }

      if (this.requestType === 'new') {
        this.apiPostDecisionNewRequests(row.id, decision, result => {
          this.refresh()
          EventBus.$emit('show-loading', false)
        })
      } else if (this.requestType === 'existing') {
        this.apiPostDecisionExistingRequests(row.id, decision, result => {
          this.refresh()
          EventBus.$emit('show-loading', false)
        })
      }
    },
    onDelete: function (row) {
      if (this.requestType === 'new') {
        this.apiDeleteRequestNew(row.id, result => {
          this.refresh()
          EventBus.$emit('show-loading', false)
        })
      } else if (this.requestType === 'existing') {
        this.apiDeleteRequestExisting(row.id, result => {
          this.refresh()
          EventBus.$emit('show-loading', false)
        })
      }
    },
    refresh: function () {
      EventBus.$emit('stats-count-changed')
      this.$refs.table.refresh()
    }
  }
}
</script>

<style>
</style>
