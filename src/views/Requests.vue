<template>
  <b-container fluid class="mt-3">
    <h1>{{ $t('pageRequestsHeading') }}</h1>

    <template v-if="(newRequestData && newRequestData.length > 0) || (existingRequestData && existingRequestData.length > 0)">
      <template v-if="newRequestData && newRequestData.length > 0">
        <h2>{{ $t('pageRequestsHeadingNew') }}</h2>
        <UserRequestTable :data="newRequestData"
                          v-on:request-data="updateNewRequests()"
                          requestType="new" />
      </template>

      <template v-if="existingRequestData && existingRequestData.length > 0">
        <h2>{{ $t('pageRequestsHeadingExisting') }}</h2>
        <UserRequestTable :data="existingRequestData"
                          v-on:request-data="updateExistingRequests()"
                          requestType="existing" />
      </template>
    </template>
    <h3 v-else>{{ $t('genericHeadingNoData') }}</h3>
  </b-container>
</template>

<script>
import UserRequestTable from '../components/UserRequestTable'

export default {
  data: function () {
    return {
      newRequestData: [],
      existingRequestData: []
    }
  },
  components: {
    UserRequestTable
  },
  methods: {
    updateNewRequests: function () {
      this.apiGetNewRequests(result => {
        this.newRequestData = result
      })
    },
    updateExistingRequests: function () {
      this.apiGetExistingRequests(result => {
        this.existingRequestData = result
      })
    }
  },
  mounted: function () {
    this.updateNewRequests()
    this.updateExistingRequests()
  }
}
</script>

<style>
</style>
