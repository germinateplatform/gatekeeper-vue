<template>
  <div>
    <BaseTable :columns="columns" :getData="getData" :tableActions="tableActions" selectMode="single" @row-selected="onRowClicked" :supportsSearch="true" ref="table">
    </BaseTable>

    <AddUserModal ref="addUserModal" @add-institution-clicked="$refs.addInstitutionModal.show()" @user-added="refresh()" />
    <AddInstitutionModal ref="addInstitutionModal" @institutions-updated="$refs.addUserModal.updateInstitutions()" />
  </div>
</template>

<script>
import BaseTable from '@/components/BaseTable'
import AddInstitutionModal from './modal/AddInstitutionModal'
import AddUserModal from './modal/AddUserModal'
import { mdiAccountPlus } from '@mdi/js'

export default {
  data: function () {
    return {
      user: null,
      institutions: null,
      tableActions: [{
        id: 0,
        text: () => this.$t('actionAddUser'),
        variant: null,
        path: mdiAccountPlus,
        callback: () => {
          this.$refs.addUserModal.show()
        }
      }]
    }
  },
  components: {
    AddInstitutionModal,
    AddUserModal,
    BaseTable
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
      }]
    }
  },
  methods: {
    getData: function (data, callback) {
      return this.apiGetUsers(data, callback)
    },
    update: function () {
      this.newUser.password = this.$refs.password.getPassword()
      this.checkForm()
    },
    checkForm: function () {
      let result = true
      result = result && this.$refs.password.valid()
      result = result && this.newUser.username
      result = result && this.newUser.fullName
      result = result && (this.newUser.institution.id || this.newUser.institution.name)
      result = result && this.newUser.email
      this.canContinue = result
    },
    onRowClicked: function (event) {
      this.user = (event && event.length > 0) ? event[0] : null

      this.$emit('user-selected', this.user)
    },
    refresh: function () {
      this.$refs.table.refresh()
    }
  }
}
</script>

<style>

</style>
