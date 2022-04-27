<template>
  <b-container fluid class="mt-3">
    <h1>{{ $t('pageRequestsHeading') }}</h1>

    <h2>{{ $t('pageRequestsHeadingNew') }}</h2>
    <UserRequestTable :getData="getNewRequestData"
                      requestType="new" />
    <h2>{{ $t('pageRequestsHeadingExisting') }}</h2>
    <UserRequestTable :getData="getExistingRequestData"
                      requestType="existing" />
  </b-container>
</template>

<script>
import UserRequestTable from '../components/UserRequestTable'

export default {
  components: {
    UserRequestTable
  },
  methods: {
    getNewRequestData: function (data, callback) {
      return this.apiGetNewRequests(data, callback)
    },
    getExistingRequestData: function (data, callback) {
      return this.apiGetExistingRequests(data, callback)
    }
  }
}
</script>

<style>
</style>
