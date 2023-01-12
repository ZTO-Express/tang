| 组件/微件 | 1. 所有需要注册到全局的组件必须以 C 开头，并以驼峰格式命名<br>2. 所有子组件以中划线（-）分割的单词组成<br>3. 所有需要注册到全局的表单项组件必须以 CFormItem 开头<br>4. 组件内触发事件以 handle 开头（如：handleXXClick，handleYYBlur 等）<br>5. 组件内 el 引用以 Ref 结尾（如：formRef, buttonRef 等）<br>6. 每个组件一般情况下，在根节点下提供和组件名称相同以-分隔的样式<br>7. 组件内需要调用应用方法的，需要先采用 useCurrentAppInstance 获取应用实例，通用应用实例进行操作<br>8. 组件需要传递上下文信息的需要采用 app.useContext<br>9. 组件中进行 api 请求时使用 app.request<br>10. onMounted 注册的事件注意要在页面卸载的时候释放<br>11. 组件的属性定义使用 withDefaults(defineProps<{}>, {})<br>12. 可以重用的类型尽量定义类型<br>13. 单文件组件代码不应该超过 500 行 |

| 微件 | 1. 所有需要微件必须以 W 开头，并以驼峰格式命名<br>2. 页面相关微件以 Page 结尾 |
| 页面 | 1. 所有可注册主页面以 index.ts 为命名，子页面以 名称.ts 命名(bizName.ts)<br>2. 页面拆分配置以下划线+名称.ts 命名(如：\_dialog.ts)<br>3. 页面配置中尽量将信息保存在 action 中（以保证逻辑和应用分离）<br>4. 开发过程中涉及表单操作，尽量采用表单内部 model 进行数据传递，特殊情况采用页面状态传递信息 | |
