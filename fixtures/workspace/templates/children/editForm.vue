<template>
  <z-form ref="zForm" :model="data" :rules="rules" label-width="100px">
    <f-form-items :configs="configs" :form-data="data" :span="12" :show-actions="false" />
  </z-form>
</template>
<script lang="ts">
import { Component, Ref, Vue } from 'vue-property-decorator'
import { ZForm } from '@zto/zui/types/form'

@Component({ name: '' })
export default class extends Vue {
  data = <%- JSON.stringify(formData) %>

  configs = <%- JSON.stringify(formConfig) %>

  rules = {}

  setData(data: any) {
    if (data) this.data = data
  }

  validator() {
    return (this.$refs.zForm as ZForm).validate()
  }
}
</script>
