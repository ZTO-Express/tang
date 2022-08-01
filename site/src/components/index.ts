import { getComponentsFromGlobMap, getComponentsRecords } from '@zto/zpage-site-base'

const componentsMap: Record<string, any> = import.meta.globEager(`../components/**/C*.vue`)

const components = getComponentsFromGlobMap(componentsMap)

const componentRecords = getComponentsRecords(components)

export default componentRecords

export { components }
