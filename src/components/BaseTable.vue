<template>
  <div>
    <b-row v-if="supportsSearch">
      <b-col cols=12 md=3>
        <b-form-group :label="$t('paginationFilterPlaceholder')" label-for="search">
          <b-input type="search" :debounce="500" v-model="search" id="search" :placeholder="$t('paginationFilterPlaceholder')" />
        </b-form-group>
      </b-col>
    </b-row>

    <b-table striped
             responsive
             hover
             outlined
             show-empty
             :sort-by="sortBy"
             :sort-desc="sortDesc"
             :selectable="selectMode !== null"
             selected-variant="info"
             :select-mode="selectMode"
             @row-selected="data => $emit('row-selected', data)"
             :fields="columns"
             :items="getDataLocal"
             ref="table"
             head-variant="dark"
             table-class="position-relative">
      <!-- Pass on all named slots -->
      <slot v-for="slot in Object.keys($slots)" :name="slot" :slot="slot"/>
      <!-- Pass on all scoped slots -->
      <template v-for="slot in Object.keys($scopedSlots)" :slot="slot" slot-scope="scope"><slot :name="slot" v-bind="scope"/></template>
    </b-table>

    <!-- Container below the table -->
    <div class="d-flex flex-wrap-reverse justify-content-between align-items-end">
      <div class="table-bottom-left">
        <!-- Any additional actions and the download button -->
        <b-button-group v-if="tableActions">
          <!-- Download button -->
          <!-- Table actions -->
          <b-button v-for="action in tableActions"
                    :key="`base-table-action-${action.id}`"
                    :variant="action.variant"
                    @click="action.callback()"
                    v-b-tooltip.hover.bottom
                    :title="action.text()">
            <MdiIcon :path="action.path" v-if="action.path" />
            <span v-else>{{ action.text }}</span>
          </b-button>
        </b-button-group>
      </div>

      <!-- Page indicator and pagination -->
      <div class="d-flex">
        <b-button-group class="table-pagination" v-show="pagination.totalCount > 10">
          <b-pagination v-model="pagination.currentPage"
                        :total-rows="pagination.totalCount"
                        :per-page="10"
                        id="table-pagination"
                        v-if="pagination.totalCount > 0" />
        </b-button-group>
      </div>
    </div>
  </div>
</template>

<script>
import MdiIcon from '@/components/MdiIcon'

export default {
  components: {
    MdiIcon
  },
  props: {
    supportsSearch: {
      type: Boolean,
      default: false
    },
    columns: {
      type: Array,
      default: () => []
    },
    options: {
      type: Object,
      default: () => {}
    },
    getData: {
      type: Function,
      default: () => {
        return {
          data: [],
          count: 0
        }
      }
    },
    selectMode: {
      type: String,
      default: null
    },
    tableActions: {
      type: Array,
      default: () => null
    },
    sortBy: {
      type: String,
      default: null
    },
    sortDesc: {
      type: Boolean,
      default: false
    }
  },
  data: function () {
    return {
      pagination: {
        currentPage: 1,
        totalCount: -1
      },
      search: null
    }
  },
  watch: {
    'pagination.currentPage': function () {
      this.$refs.table.refresh()
    },
    search: function () {
      this.refresh()
    }
  },
  methods: {
    refresh: function () {
      this.pagination.totalCount = -1
      this.$refs.table.refresh()
    },
    getDataLocal: function (ctx) {
      // Set the API pagination information fields
      const localCtx = JSON.parse(JSON.stringify(ctx))
      localCtx.page = this.pagination.currentPage
      localCtx.limit = 10
      localCtx.prevCount = this.pagination.totalCount
      localCtx.orderBy = localCtx.sortBy.length > 0 ? localCtx.sortBy : null
      localCtx.ascending = localCtx.sortBy.length > 0 ? (localCtx.sortDesc ? 0 : 1) : null
      localCtx.query = this.search

      // Delete fields that the bootstrap-vue table sets itself
      delete localCtx.sortBy
      delete localCtx.sortDesc
      delete localCtx.apiUrl
      delete localCtx.currentPage
      delete localCtx.perPage

      return new Promise((resolve) => {
        this.getData(localCtx).then(result => {
          let localResult = null
          if (result && result.data && result.data.data) {
            this.pagination.totalCount = result.data.count
            localResult = result.data.data

            if (this.options && this.options.rowVariant !== null && typeof this.options.rowVariant === 'function') {
              localResult.forEach(r => {
                r._rowVariant = this.options.rowVariant(r)
              })
            }
          } else {
            this.pagination.totalCount = 0
          }
          resolve(localResult)
        })
      })
    }
  }
}
</script>

<style>
div.table-responsive {
  margin-bottom: 0;
}
.table-bottom-left button {
  border-top-right-radius: 0;
  border-top-left-radius: 0;
}
.table-pagination .page-item .page-link {
  border-top: 0;
  border-top-right-radius: 0;
  border-top-left-radius: 0;
}
</style>
