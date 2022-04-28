<template>
  <b-modal id="modal-add-database"
           ref="addDatabaseModal"
           :title="$t('modalTitleAddDatabase')"
           :ok-title="$t('actionAdd')"
           :cancel-title="$t('actionCancel')"
           @ok="onAddDatabaseClicked" >
      <b-form @submit.prevent="onAddDatabaseClicked" autocomplete="off" ref="form" :class="validated ? 'was-validated' : 'needs-validation'" >
        <b-form-group
          :label="$t('formLabelDatabase')"
          label-for="systemName">
          <template v-slot:description>
            <span class="text-muted" v-html="$t('formDescriptionDatabase')" />
          </template>
          <b-input-group>
            <b-form-input id="systemName" name="systemName" autocomplete="off" v-model="database.systemName" required />
          </b-input-group>
        </b-form-group>
        <b-form-group
          :label="$t('formLabelServer')"
          label-for="serverName">
          <template v-slot:description>
            <span class="text-muted" v-html="$t('formDescriptionServer')" />
          </template>
          <b-input-group>
            <b-form-input id="serverName" name="serverName" autocomplete="off" v-model="database.serverName" required />
          </b-input-group>
        </b-form-group>
        <b-form-group>
          <label for="description">{{ $t('formLabelDescription') }}</label>
          <b-input-group>
            <b-form-textarea id="description" name="description" autocomplete="off" v-model="database.description" />
          </b-input-group>
        </b-form-group>
      </b-form>
    </b-modal>
</template>

<script>
import { EventBus } from '../../event-bus.js'

export default {
  data: function () {
    return {
      validated: false,
      database: {
        systemName: null,
        serverName: null,
        description: null
      }
    }
  },
  methods: {
    show () {
      this.$nextTick(() => this.$refs.addDatabaseModal.show())
    },
    onAddDatabaseClicked: function (event) {
      event.preventDefault()
      this.validated = true
      // Check that all fields are set
      if (!this.database.systemName || !this.database.serverName || !this.$refs.form.checkValidity()) {
        return
      }

      // Send the new database to the server
      this.apiPostDatabase(this.database, result => {
        this.$refs.addDatabaseModal.hide()
        this.$emit('databases-updated')
        this.resetDatabase()
        EventBus.$emit('stats-count-changed')
      })
    },
    resetDatabase: function () {
      this.database = {
        systemName: null,
        serverName: null,
        description: null
      }
    }
  },
  mounted: function () {
    this.resetDatabase()
  }
}
</script>

<style>

</style>
