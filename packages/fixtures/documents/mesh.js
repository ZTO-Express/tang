module.exports = {
  // 所有的插件基于事件驱动，但仍然遵循大的流程，事件有优先级以及同步或异步
  "name": "tang-test-mesh", // mesh名称
  "version": "0.0.1", // 预设版本
  "title": "yapi文档生成", // 标题
  "description": "此预设用于通过api文档生成vue项目、调用接口及页面", // 描述
  "contact": {
    "name": "rayl", // 名称
    "url": "https://github.com/ZTO-Express/tang", // url
    "email": "rayl@pisaas.com" // 邮箱
  },
  "extends": "", // 扩展其他配置
  "plugins": [
    // 插件的安装是并行的
    {
      "name": "openapi-titan",
      // 插件
      "install": [
        "git clone git@github.com:pient/devspace.git",
        "git checkout dev"
      ] // 安装方式为git及地址
    },
    {
      "name": "yapi-openapi",
      // 插件
      "install": "npm install", // 安装方式npm, 默认包名为key(@tang/plugin-yapi-openapi)
      "version": "0.0.1"
    },
    {
      "name": "fsharing",
      // 插件
      "install": "npm install", // 安装方式npm, 默认包名为key(@tang/plugin-yapi-openapi)
      "version": "0.0.1"
    }
    // 所有插件安装完成，emit plugins:installed
    // 所有插件安装完成后，开始执行插件初始化，插件的初始化目前是按优先级顺序进行的
    // 默认按配置顺序 初始化完成后 emit plugins:initialized
  ],
  "loaders": [
    // 默认包含local, url加载器
  ],
  "parsers": [
    // 默认包含yaml, json解析器
    // 选择一个执行
    {
      "parser": "plugin:yapi-openapi/parser",
      "options": {}
    },
    {
      "parser": "plugin:openapi-titan/parser",
      "options": {}
    }
    // 所有解析器执行完成，parsers针对某类型文件只执行一次，emit doc:parsed
  ],
  "generators": [
    // 默认包含yaml, json生成器
    {
      "generator": "plugin:openapi-titan/generator",
      "options": {
        "include": [], // 包含的模版文件（以执行路径为基路径）
        "exclude": [], // 排除的模版文件
        "output": {
          "name": "local",
          "overwrite": true
        }
      }
    },
    {
      "generator": "plugin:yapi-openapi/generator",
      "options": {
        "output": {
          "name": "github",
          "overwrite": true
        }
      }
    }
    // 所有生成器执行完成，emit doc:generated
  ],
  "outputers": [
    // 默认包含local, memory生成器
    {
      "name": "local",
      "outputDir": "./out"
    },
    {
      "name": "github",
      "repository": ""
    }
    // 所有存储器执行完成，emit files:output
  ],
  "snippets": [
    {
      "snippet": "plugin:fsharing/snippets"
    }
  ],
  "hooks": {
    "beforeLoad": {
      "name": ["titan:output"]
    }
  }
}