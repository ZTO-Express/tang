
## 框架

- <img src="/docs/zpage-framework-01.png" width="90%" style="max-width: 800px" />
<div class="text-center">ZPage架构图</div>

**ZPage框架由如下几个部分组成：**

**内核**：内核主要包含ZPage的部分领域特定语言(DSL)的Typescript概念的定义，如微件(Widget)、组件(Cmpt)、插件(Plugin)、结构(Schema)、加载器(Loader)、内置错误（ZPageError）等。同时内核中也包含平台无关的常用的Js实用工具，如字符格式化(strings)、Js工具方法(简化版lodash)、防抖、节流方法(throttle-debound)等。

**运行时**：运行时包含ZPage配置化框架的完整实现，是整个ZPage框架的核心。如果说内核是跨平台的，运行时就是基于特定平台的实现。目前已经实现了Vue3运行时，并在实际项目中进行广泛应用。

**UI库**：UI库构建于运行时之上，其为运行时提供特定UI支持。目前已实现并在实际项目中应用的有 ui-element(基于Element-Plus)，ui-vant(基于Vant 3)

**基础配置**：基础配置可以理解为基于特定运行时和UI库的应用模版。目前已有Web应用配置库(site-base)，其集成了中通日常Web应用常用的标准Api请求配置、图表组件、Xlsx导出、Zfs文件上传、百度地图、一帐通登录等功能。基础配置中的配置可以在实际项目中被覆盖，从而减少通用配置工作量的同时保持灵活性和扩展性。

