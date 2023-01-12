文档还有不完善的地方，比如接口路径是否一定要 restful 格式，登录接口定义及 token 传递方式是否需要定下来，pc 端菜单权限接口格式等等。有任何疑问，欢迎留言讨论。

原则：

1. 前端尽可能少的参与业务逻辑，重点关注用户体验及开发效率
2. 业务逻辑尽可能内聚，减少耦合，特别是前后端
3. 不要相信前端的传参，后端只接收自己想要的值，同时进行规则验证
4. 相同的前端展示方式，相同的接口格式

## Api 路径规范

接口路径要符合通用命名规则，接口交互统一用 POST，接口入参和出参统一采用实体（DTO），接口字段定义 3 要素：是否必须，字段说明，类型

示例：实际使用过程中把&lt;base&gt;替换成自己的模块名称

前端文档生成说明：<a href="http://w.ztosys.com/107098842" target="_blank">http://w.ztosys.com/107098842</a>

**RPC 路径**
| 路径 | 说明 | 入参 | 出参 |
| ------------------------------------ | ---------------- | ---- | ---- |
| `<namespace>.add<entityName>` | 添加 | | |
| `<namespace>.edit<entityName>` | 修改 | | |
| `<namespace>.save<entityName>` | 添加或修改 | | |
| `<namespace>.delete<entityName>` | 删除 | | |
| `<namespace>.get<entityName>Options` | 下拉模糊搜索 | | |
| `<namespace>.query<entityName>Page` | 分页查询 | | |
| `<namespace>.export` | 下载/导出 | | |
| `<namespace>.upload` | 上传 | | |
| `<namespace>.get<entityName>Detail` | 查询详情（单条） | | |
| `<namespace>.get<entityName>Details` | 查询明细（多条） | | |

**Restful 路径**
| 路径 | 说明 | 入参 | 出参 |
| ------------------------------------ | ---------------- | ---- | ---- |
`/<base>/add` |添加|||
`/<base>/edit`| 修改|
`/<base>/save` |添加或修改|
`/<base>/delete` |删除|
`/<base>/options` |下拉模糊搜索|
`/<base>/query` |分页查询|
`/<base>/download` |下载/导出|
`/<base>/upload` |上传|
`/<base>/detail`| 查询详情（单条）|
`/<base>/details` |查询明细（多条）|

**讨论：**

1. <font color="red">添加和修改是否应该合并，在什么情况下合并</font>

## Api 请求/返回值规范

所有返回值按照中通通过返回值中的 result 规范，如下示例，&lt;result&gt;部分：

{ message: '成功', status: true, statusCode: 200, result: <font color="red">&lt;result&gt;</font> }

<el-table :data="tableData" style="width: 100%">
  <el-table-column prop="name" label="规范" width="180">
    <template #default="scope">
      <div v-html="scope.row.name"></div>
    </template>
  </el-table-column>
  <el-table-column prop="desc" label="说明" minWidth="300">
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
    name: '查询条件-分页',
    desc: `<pre>页大小：pageSize
第几页：pageIndex (从1开始)
排序：pageSort (prop: 排序属性；order: 排序，1:升序，-1:降序，0: 不排序)
示例：
{
  pageSize: 10,
  pageIndex: 1,
  pageSort: [{ prop: 'createdAt', order: -1 }],
  code: 'AAA',
  name: 'BBB'
}`,
    remark: '待讨论：查询字段是否需要进行包装'

},
{
    name: '查询返回-分页',
    desc: `<pre>返回数据：需要包含在list内
总条数：total
汇总字段：sum
汇总数据的资源与列字段对应
示例：
{
  data: [
    { col1: "val1", ...数据1 },
    { col1: "val2", ...数据2 }
  ],
  total: 1000,
  sum: {
      col1: "sum1"
  }
}`,
    remark: `如果考虑到分页查询时汇总性能，可以在翻页时，sum返回空，将会缓存之前一次的汇总信息<br />
缓存建议由后端处理，如果后端没有好的方案也可由前端执行`

},
{
  name: '删除，修改，查询',
  desc: '<pre>入参主键id都定义为id',
  remark: '考虑到安全性和可维护性，一般不建议应用返回id，尽量用code唯一标识记录'
},
{
  name: '下拉模糊搜索',
  desc: `<pre>入参：keyword
出参：{
    data: [{id，code，name}]
}
id, code, 可视情况使用id或code或同时使用。`,
  remark: '考虑到安全性和可维护性，一般不建议应用返回id，尽量用code唯一标识记录'
},
{
  name: '查询条件',
  desc: `<pre>空值代表忽略当前查询条件（空：'', null, undefined）
不存在的条件字段自动忽略`,
  remark: ''
},
{
  name: '查询条件-时间范围',
  desc: `<pre>命名：
开始时间：startDate，baseStartDate
结束时间：endDate, baseEndDate
格式：YYYY-MM-DD HH:mm:ss`,
  remark: `<pre>入参一般不包括具体时间，例如：
2021-01-01 至 2021-01-02 翻译为：
2021-01-01 00:00:00 - 2021-01-02 23:59:59
单天、单月、单年：
只传入日期，月份，年份信息`
},

{
  name: '查询条件 - 多项',
  desc: `<pre>
查询条件一个字段包含多项，用数组表示，
示例：
{
    formIds: ['F1001', 'F1002']
}`,
  remark: ``
},
{
  name: '查询返回 - 枚举',
  desc: `<pre>
需要同时返回枚举值和显示值，显示值以 Name作为后缀
{
    data: [
        { id: 1, status: 1, statusName: "有效" },
         { id: 2, status: 0, statusName: "无效" }
    ]
}`,
  remark: `易变枚举，建议通过接口返回`
},
{
  name: '查询返回 - 日期',
  desc: `<pre>返回日期为格式化后日期，
无时间：yyyy-MM-dd
有时间：yyyy-MM-dd HH:mm:ss`,
  remark: `秒级时间是否有必要显示`
},
{
  name: '查询返回 - 附件',
  desc: `<pre>返回中包含附件，以如下格式：
{
  name: '文件名.pdf',
  url: '文件下载地址',
}`,
  remark: ``
},
{
  name: '文件上传',
  desc: `<pre>需要同时保存文件名及url，以备下载时用
{
  name: '文件名.pdf',
  url: '文件路径',
}`,
  remark: `<pre>附件建议同时存储文件名和下载地址，
下载地址格式建议加上空间前缀：
zfs://<文件Id>, 中通文件系统
oss://<文件Id>, 对象存储
文件url,可以包含路径，区分文件类型比如：
operate/storeQuitAudit/xxxxx.pdf`
},
{
  name: '文件异步导出',
  desc: `<pre>{
    id?: 标识,
    name?: 文件名称
    status?: 状态
    url: 下载地址
}`,
  remark: ``
},
{
  name: '数据导入',
  desc: `<pre>
{
   data: [{...item}]
}`,
  remark: ``
},
]
</script>

## 部分命名规范约定

命名规范为前端对返回接口命名建议，不作为后端命名约束，但仍建议前后端就一些通用的命名达成一致

较粗糙, 后面流程化维护产品统一语言表

| 命名     | 规范                        | 备注 |
| -------- | --------------------------- | ---- |
| 主键     | id, xxxId                   |
| 编码     | code, xxxCode               |
| 日期     | xxxDate                     |
| 状态     | status, xxxStatus           |
| 备注     | remark, xxxRemark           |
| 创建日期 | createdDate, xxxCreatedDate |
| 更新时间 | updatedDate, xxxUpdatedDate |
