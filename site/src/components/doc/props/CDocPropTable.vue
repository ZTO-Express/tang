<template>
  <div class="c-doc-widget-prop-table">
    <h3 :id="headerId">search</h3>
    SchemasJson: {{ SchemasJson }}
  </div>
</template>

<script setup lang="ts">
import { uuid } from '@zto/zpage'

import SchemasJson from '@/../schemas/index.json'

const headerId = uuid()
</script>
