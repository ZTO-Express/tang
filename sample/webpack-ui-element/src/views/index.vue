<template>
  <h1>Index</h1>
  <div>
    {{ text1 }}
    <button @click="handleClick">test</button>
  </div>
  <div>
  </div>
</template>

<script>
import { defineComponent, ref } from 'vue'
import { getCurrentInstance } from '@zpage/zpage'

export default defineComponent({
  setup() {
    const text1 = ref(1)

    function handleClick() {
      text1.value++
    }

    return {
      text1,
      handleClick
    }
  }
})
</script>

