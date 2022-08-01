<template>
  <div class="app-header-extra">
    <!-- <div class="divider">
      <el-divider direction="vertical"></el-divider>
    </div> -->
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, useCurrentAppInstance } from '@zto/zpage'

const app = useCurrentAppInstance()

const { MessageBox } = app.useMessage()

const imageAssets = app.useAssets('images', {})
</script>

<style lang="scss">
@import '../styles/app.scss';
</style>

<style lang="scss" scoped></style>
