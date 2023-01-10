<template>
  <div class="c-doc-schema-tree">
    <h3 :id="headerId">search</h3>
  </div>
</template>

<script setup lang="ts">
import { uuid } from '@zto/zpage'

const headerId = uuid()
</script>
