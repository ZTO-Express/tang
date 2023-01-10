<CWidgetSchemaViewer name="WCrud" type="desc" />

## 基本用法

最基本的用法是配置 数据源接口(api) 以及 展示列(columns)

```json
--- doc-sample:zpage-widget ---
{
  "type": "crud",
  "style": { "height": "400px" },
  "actions": {
    "query": { "api": "/fixtures/data/list/crud" }
  },
  "search": {
    "items": [
      { "type": "input", "prop": "code", "label": "编号" },
      { "type": "input", "prop": "name", "label": "名称" }
    ]
  },
  "table": {
    "showSummary": true,
    "columns": [
      { "prop": "code", "label": "编号", "width": 160 },
      { "prop": "name", "label": "名称", "width": 200 },
      { "prop": "amount", "label": "数量", "summaryProp": true, "width": 100 },
      { "prop": "remark", "label": "备注" }
    ]
  }
}
```

## 查询接口数据结构

### 请求数据结构

- pageIndex: 分页参数，查询当前页标识，从1开始
- pageSize: 分页参数，分页大小

```json
{
  "pageIndex": 1, // 当前页
  "pageSize": 15, // 单页条数
  "...": "..." // 其他查询条件
}
```


### 返回数据结构

- result.data: 用于返回查询数据，格式为数组
- result.total: 用于返回查询一共有多少条数据，用于生成分页
- result.sum: 用于返回指定的汇总数据，sum中字端对应column配置中的字端

```json
{
  "result": {
    "data": [ // 返回数据
      { "code": "CODE1", "name": "名称1", "amount": 10, "remark": "描述..." }, // 每一行数据
      { "code": "CODE2", "name": "名称2", "amount": 20, "remark": "描述xxx" }
    ],
    "pageSize": 15, // 单页条数
    "total": 100, // 这里返回的是查询数据的总条数，用于生成分页组件，如果你不想要分页，把这个可以不返回
    "sum": { // 汇总数据
      "amount": 30 // 指定字段的汇总信息
    }
  },
  "message": "操作成功", // 消息（出错后提示）
  "status": true, // 请求状态，true: 成功，false: 失败
  "statusCode": "SYS000", // 错误码
}
```

## 操作

<CWidgetSchemaViewer name="WCrud" type="tree" />
