const componentsMap: Record<string, any> = import.meta.globEager(`@/components/example/**/*.vue`)
const ExampleMap: Record<string, any> = {}

for (const key in componentsMap) {
  const cmpt = componentsMap[key].default
  const name = key.substring(key.indexOf('/') + 1, key.lastIndexOf('.'))
  ExampleMap[name] = cmpt
}

export default ExampleMap
