import { AppLoaderType } from '@zto/zpage'

import type { App, AppPageLoader } from '@zto/zpage'

export const SiteDocPageLoader: AppPageLoader = {
  type: AppLoaderType.PAGE,

  name: 'site-doc',

  // 解析菜单数据
  async loadPage(app: App, path: string) {
    // 优先尝试从本地获取路径
    const page: any = app.usePage(path)

    //     const md = markdownit()

    //     const result = md.render(`
    // # markdown-it rulezz!

    // | Tables        | Are           | Cool  |
    // | ------------- |:-------------:| -----:|
    // | col 3 is      | right-aligned | $1600 |
    // | col 2 is      | centered      |   $12 |
    // | zebra stripes | are neat      |    $1 |

    // :tada: :100:

    // ::: info
    // This is an info box.
    // :::

    // \`\`\`js
    // console.log('Hello, VitePress!')
    // \`\`\`
    //     `)

    // if (page) page.body = result

    // data开头的路有需要从远程获取路径
    // if (!page && path.startsWith(APP_PAGE_PATH_PREFIX)) {
    //   const schemaUrl = pageUtil.getDataPageSchemaUrl(path)
    //   page = await dataApi.get('basic/page/get', { pagePath: schemaUrl })
    //   if (page) {
    //     page.path = path
    //     app.setPage(path, page)
    //     // app.pages.push(page)
    //   }
    // }

    return page
  }
}
