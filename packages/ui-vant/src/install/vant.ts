import { warn } from '@zto/zpage'
import { Toast, Dialog, Loading, Button, Icon, Col, Row, Cell, CellGroup, List, Empty } from 'vant'

import type { AppOptions, Runtime } from '@zto/zpage'
import type { App } from 'vue'

export default (instance: Runtime, options?: AppOptions): void => {
  const { app } = instance

  if (!app) {
    warn('请先实例化再注册组件')
    return
  }

  app.use(Toast)

  const componentsMap: any = {
    Loading,
    Dialog,
    Button,
    Icon,
    Col,
    Row,
    Cell,
    CellGroup,
    List,
    Empty
  }

  Object.keys(componentsMap).forEach(key => {
    install(app, componentsMap[key], key)
  })
}

function install(app: App<Element>, cmpt: any, name?: string) {
  app.use(cmpt)

  if (name) {
    app.component(name, cmpt)
  }
}
