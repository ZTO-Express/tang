import type { Component } from 'vue'

const componentsMap: Record<string, any> = import.meta.globEager(`../components/**/C*.vue`)

const components: Component[] = []

// 安装全局组件
for (const key in componentsMap) {
  const cmpt = componentsMap[key].default
  cmpt.name = cmpt.name || key.substring(key.lastIndexOf('/') + 1, key.lastIndexOf('.'))

  components.push(cmpt)
}

export { components }
