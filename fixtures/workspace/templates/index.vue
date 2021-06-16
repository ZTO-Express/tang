<template>
  <f-table-layout>
      <template #form>
          <z-form ref="searchForm" :model="formData" label-width="100px">
              <f-form-items
                      :configs="formItems"
                      :form-data="formData"
                      :clearable="true"
                      :span="6"
                      @search="query"
              ></f-form-items>
          </z-form>
      </template>

      <template #op-btn>
          <z-button type="primary" @click="openDialogEvent('add')">新增</z-button>
      </template>

      <template #table>
          <f-table
                  ref="fTable"
                  :batch-editable="true"
                  :columns="tableHead"
                  :data.sync="tableData"
                  api="<%= api.query && api.query.replace(/\//g,"_").substring(1) %>"
                  :params="formData"
          >
              <template #default="{row}">
                  <z-button type="text" @click="openDialogEvent('edit',row)">编辑</z-button>
              </template>
          </f-table>
      </template>

      <f-dialog ref="editDialog" :title="editDialogTitle(dialogType)" :dialog-type="dialogType" add-api="<%= api.add && api.add.replace(/\//g,"_").substring(1) %>" edit-api="<%= api.edit && api.edit.replace(/\//g,"_").substring(1) %>">
          <edit-form />
      </f-dialog>
  </f-table-layout>
</template>

<script lang="ts">
  import { Component, Mixins, Ref } from 'vue-property-decorator'
  import { Common } from '@/mixins/common'
  import EditForm from './children/editForm.vue'

  import Config from './config'

  @Component({
      name: '',
      components: {
          EditForm
      }
  })
  export default class extends Mixins(Common) {
      @Ref() editDialog: any

      formItems = Config.formItems
      tableHead = Config.tableHead

      dialogType = 'add' as EditDialogType

      formData: any = <%- JSON.stringify(formData) %>

      async openDialogEvent(type: EditDialogType,row:any) {
          this.dialogType = type
          // 新增
          if (type === "add"){
              this.editDialog.$show(null)
              return
          }

          // 编辑
          let {data} = await webapi.<%= api.detail && api.detail.replace(/\//g,"_").substring(1) %>({id:row.id})
          this.editDialog.$show(data)
      }
  }
</script>
