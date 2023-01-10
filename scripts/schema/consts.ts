/**
 * 支持的schema tag
 */
export const SchemaTags = [
  /**
   * schema类型
   * @desc widget:微件, component:组件
   */
  'schema',
  /**
   * schema目标
   * @desc 一般为微件或组件名
   */
  'target',
  /**
   * 元数据
   */
  'meta',
  /**
   * 属性名称
   */
  'name',
  /**
   * 描述
   */
  'desc',
  /**
   * 分类
   */
  'category',
  /**
   * 分区
   */
  'section',
  /**
   * 选项
   */
  'options',
  /**
   * 标签
   */
  'label',
  /**
   * 主要用于排序
   */
  'index',
  /**
   * 级别，实际主要用于排序
   * 级别有小到大
   * 1为最高：一般确定在属性编辑器中放入最高位
   * 2为次高：一般确定在属性编辑器中放入次高位
   * 默认priority为10
   */
  'priority',
  /**
   * 数据类型
   * @desc 一般用于不方便通过typescript区分的数据类型，增加额外标识，
   * data会影响json schema到dev schema的解析
   * partial: 对内容引用的类型内部进行Partial
   * set: 标识当前类型为set
   * array: 标识当前类型为set
   * enum: 枚举
   * sub: 表示此数据不继承主数据，将重新创建新数据，一般用于子级分类
   */
  'data',
  /**
   * ui类型
   * @desc 一般用于无法通过类型判断含义的情形，目前支持如下类型
   * ui属性会影响dev schema进行文档或编辑器渲染
   * string: icon|template｜container|formItem|action|page|tableColumn
   * json: style|tip|formatter
   */
  'ui',
  /**
   * 解析是是否将引用合并到父类型
   */
  'mergeRef',
  /**
   * 编辑器拖拽指示器，指示可拖动元素
   */
  'editorDragEl',
  /**
   * 编辑器拖拽指示器，指示拖动目标元素
   */
  'editorDropEl'
]
