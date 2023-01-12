## 一、项目结构

<el-table :data="tableData" style="width: 100%">
  <el-table-column prop="name" label="项目类型" width="180">
    <template #default="scope">
      <div v-html="scope.row.name"></div>
    </template>
  </el-table-column>
  <el-table-column prop="desc" label="结构" minWidth="300">
    <template #default="scope">
      <div v-html="scope.row.desc"></div>
    </template>
  </el-table-column>
  <el-table-column prop="remark" label="备注" width="320">
    <template #default="scope">
      <div v-html="scope.row.remark"></div>
    </template>
  </el-table-column>
</el-table>

<script lang="ts" setup>
  const tableData = [
    {
      name: `主项目（单体项目）`,
      desc: `<pre>src
  common(公共目录)
    index.ts (通用模块导入，方便在其他代码文件中引用)
    enums.ts (通用枚举)
    options.ts (通用选项)
  utils (通用实用工具)
  consts.ts (通用常量)
  env.ts (环境变量)
  start.ts (启动)
  config (应用配置)
  styles (样式文件)
    app.scss(全局样式)
  entry (启动目录)
    index.html (页面入口)
    main.ts (启动脚本入口)
  components (组件)
    index.ts (组件汇总)
    common (通用组件)
    module1 (模块相关组件)
      submodule1 (子模块相关组件)
      submoduleN ...
    moduleN ...
  widgets (微件)
    index.ts (微件汇总)
    common (通用微件)
    module1 (模块相关微件)
      submodule1 (子模块相关微件)
      submoduleN ...
    moduleN...
  pages (页面)
    index.ts
    welcome (欢迎页)
    module1 (模块页面)
      submodule1 (子模块页面)
      submoduleN ...
    moduleN ...
public
  images (图片)
  templates (模版，如导入模版等)
  vendors (第三方库脚本)
package.json (不解释)
.gitignore (git忽略)
.npmrc (npm配置)
tsconfig.json (*: typescript相关配置)
vite.config.js (*: vite及相关插件配置)
postcss.config.js (postcss插件配置)
.eslintignore, .eslintrc (eslint配置)
.cz-config.js, commitlint.config.js (commit提交配置)
jest.config.js (jest配置)
sonar-project.properties (sonar配置)
README.md (项目README文件)`,
      remark: ``
    },
    {
      name: '子项目',
      desc: `<pre>	
子项目与主项目目录结构相似，新增/更新了如下模块，由于子项目不但需要在开阶段输出主页面方便开发，还需要在联调时输出 元脚本(meta) 以集成到主应用内部。

src
  config
    meta (包含子项目运行必须的配置)
      index.ts
      app.ts
      assets.ts
      widgets.ts
      components.ts
    meta.ts (所有子应用运行配置)
vite.config.meta.js (子项目打包配置)`
    }
  ]
</script>

## 二、命名规范

| 类型      | 内容                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 原则      | 1. 命名尽量简洁明了，采用英文或英文缩写<br>2. 开发人员需要尽力使代码阅读人员尽可能多的从命名中获取尽量多的信息，如组件类型、作用等                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| 组件/微件 | 1. 所有需要注册到全局的组件必须以 C 开头，并以驼峰格式命名<br>2. 所有子组件以中划线（-）分割的单词组成<br>3. 所有需要注册到全局的表单项组件必须以 CFormItem 开头<br>4. 组件内触发事件以 handle 开头（如：handleXXClick，handleYYBlur 等）<br>5. 组件内 el 引用以 Ref 结尾（如：formRef, buttonRef 等）<br>6. 每个组件一般情况下，在根节点下提供和组件名称相同以-分隔的样式<br>7. 组件内需要调用应用方法的，需要先采用 useCurrentAppInstance 获取应用实例，通用应用实例进行操作<br>8. 组件需要传递上下文信息的需要采用 app.useContext<br>9. 组件中进行 api 请求时使用 app.request<br>10. onMounted 注册的事件注意要在页面卸载的时候释放<br>11. 组件的属性定义使用 withDefaults(defineProps<{}>, {})<br>12. 可以重用的类型尽量定义类型<br>13. 单文件组件代码不应该超过 500 行 |
| 微件      | 1. 所有需要微件必须以 W 开头，并以驼峰格式命名<br>2. 页面相关微件以 Page 结尾                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| 页面      | 1. 所有可注册主页面以 index.ts 为命名，子页面以 名称.ts 命名(bizName.ts)<br>2. 页面拆分配置以下划线+名称.ts 命名(如：\_dialog.ts)<br>3. 页面配置中尽量将信息保存在 action 中（以保证逻辑和应用分离）<br>4. 开发过程中涉及表单操作，尽量采用表单内部 model 进行数据传递，特殊情况采用页面状态传递信息                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| css       | 1. css 命名推荐但不强求采用 bem<br>2. css 类命名要求简洁，采用中划线(-)分割                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |

## 三、开发规范

| 类型      | 内容                                                                                                                                                                                                                                                    |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 配置化    | 1. 为保证 ZPage 的不断完善，在项目开发过程中尽量采用配置化进行页面开发<br>2. 在配置化不满足的情况下，先总结当前模式是否通用模式，如果是通用模式，则建议开发通用微件/组件，如果非通用模式，则考虑自行开发特殊类型组件                                    |
| 枚举      | 1. 项目中尽量使用枚举代替 1、2 之类的标识，确保可以通过代码本身了解逻辑<br>2. 每一个枚举必须提供注释，业务相关枚举值必须提供注释                                                                                                                        |
| 选项      | 1. 通用的选择项放在 src/common 的 options 下<br>2. 每一个通用选项必须提供注释                                                                                                                                                                           |
| 组件/微件 | 1. 自定义组件/微件中每个方法、watch 必须提供注释表明其意图<br>2. 自定义组件/微件中无法一眼看穿的属性、computed 必须提供注释<br>3. 开发时后原则上相同逻辑的代码放在一起<br>4. 代码排序按自上而下的阅读顺序排列，如触发事件的方法在前，组件内共用方法再后 |

## 四、css 规范

| 类型 | 内容                                                                                                                                                                                                                                                                                           |
| ---- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 位置 | 1. css 样式放在 components 下的 styles 文件夹下<br>2. 通用样式放于 app.scss 中，app.scss 和外部通用样式通过公共组件引入                                                                                                                                                                        |
| 使用 | 1. 尽量避免使用全局 css，如需在组件中使用全局 css，一定组件给出组件限制条件<br>2. 禁止在组件内部使用，全局 css + important 标记<br>3. css 中常用参数尽量使用通用变量，如：var(--primary)<br>4. 尽量使用全局 css，如(text-center, fs, fl, fr 等)<br>5. 组件中控制子组件样式，尽量使用:deep 方法 |
