import {
  _,
  h,
  tpl,
  renderHtml,
  renderCmpt,
  Cmpt,
  useSlots,
  defineComponent,
  resolveComponent,
  useCurrentAppInstance
} from '@zto/zpage'
import { ElTableColumn, ElFormItem } from 'element-plus'

import type { GenericFunction } from '@zto/zpage'

import CPoptip from '../poptip/CPoptip.vue'
import PopEditor from './pop-editor.vue'

import type { TableColumn } from './types'

const ChildTableColumn = defineComponent({
  props: {
    column: { type: Object, default: () => ({} as TableColumn) },
    editable: { type: Boolean, default: false },
    batchEditable: { type: Boolean, default: false },
    onEditorSubmit: { type: Function }
  },

  setup(props, { emit }) {
    const slots = useSlots()
    const app = useCurrentAppInstance()

    function getColumnProps(config: any) {
      return {
        ...config,
        key: `table${config.prop}`,
        prop: config.prop,
        width: config.width || '',
        formatter: config.formatter,
        align: config.children ? 'center' : config.align || 'center',
        className: config.className,
        showOverflowTooltip: config.tooltip !== false,
        fixed: config.fixed || undefined,
        editable: props.editable
      }
    }

    /** 构建子slots */
    function buildChildrenSlots(config: any) {
      const scopedSlots: any = {}

      // 自定义header
      if (typeof config.slotHeader !== 'undefined') {
        scopedSlots.header = slots[`${config.prop}Header`] as GenericFunction
      }

      if (config.children?.length) {
        scopedSlots.default = () => {
          return config.children.map((col: any) => {
            const _columnProps = getColumnProps(col)
            const _childrenSlots = buildChildrenSlots(col)

            return h(
              ElTableColumn,
              {
                ..._columnProps
              },
              _childrenSlots
            )
          })
        }

        scopedSlots.header = (scope: any) => {
          const context = app.useContext(scope)

          let headerLabel = config.label

          if (config.headerTpl) {
            headerLabel = tpl.filter(config.headerTpl, context)
          }

          return h(
            'div',
            {
              ...config.header
            },
            headerLabel
          )
        }
      } else {
        // 编辑列
        scopedSlots.default = (scope: any) => {
          const context = app.useContext()

          const prop = config.prop

          // __innerTexts用于导出数据时直接获取字符串
          scope.row.__innerTexts = scope.row.__innerTexts || {}

          let innerText = scope.row[prop]

          if (config.tpl) {
            innerText = tpl.filter(config.tpl, context)
            scope.row.__innerTexts[prop] = innerText

            return innerText
          }

          /** 格式化字段 */
          if (config.formatter) {
            innerText = config.formatter(scope.row, config, scope.row[prop], scope.$index, scope)
          }
          scope.row.__innerTexts[prop] = innerText

          if (config.html) {
            const htmlNode = renderHtml(config.html, context)
            return htmlNode
          }

          if (config.cmpt) {
            return h(Cmpt, { config: config.cmpt, contextData: scope })
          }

          if (config.component) {
            let cmptConfig: any = {}

            if (_.isFunction(config.component)) {
              cmptConfig = config.component(context, config)
            } else {
              cmptConfig = { ...config.component }
            }

            // 借用formItem组件
            let cmptType = cmptConfig.type || 'tpl'
            if (!cmptConfig.type && cmptConfig.formItemType) {
              cmptType = `c-form-item-${cmptConfig.formItemType}`
              cmptConfig.model = scope.row
              cmptConfig.prop = cmptConfig.prop || prop
            }

            const innerCmpt = renderCmpt({ props: cmptConfig, componentType: cmptType }, context)
            return innerCmpt
          }

          let tipSlot: any = null

          if (config?.tip) {
            let tipProps: any = config?.tip
            if (_.isFunction(config?.tip)) {
              tipProps = config?.tip(context, config)
            }

            let isTip = tipProps.visibleOn ? tpl.evalExpression(tipProps.visibleOn, context) : true
            tipSlot = isTip && h(CPoptip as any, { context, ...tipProps })
          }

          const rowEditable = !!scope.row.editable

          /** 编辑模式
           * editable 所有字段可编辑
           *  rowEditable 当前行可编辑 */
          if (config.editor && (props.editable || rowEditable)) {
            const editor = config.editor

            if (editor.popover) {
              return h(PopEditor as any, {
                text: innerText,
                column: config,
                config: config.editor,
                scope,
                onSubmit: props.onEditorSubmit
              })
            } else {
              const editAttrs = _.omit(editor, ['itemType', 'innerAttrs'])
              const formItemAttrs = editor.innerAttrs?.formItem
              const Editor = resolveComponent(`c-form-item-${editor.itemType}`)

              return h(
                ElFormItem,
                {
                  prop: `list.${scope.$index}.${prop}`,
                  rules: config.rules,
                  style: editAttrs.noPadding ? 'margin: 0' : 'margin:15px 0',
                  ...formItemAttrs
                },
                [
                  h(Editor, {
                    ...editAttrs,
                    model: scope.row,
                    prop,
                    onSubmit: props.onBatchEditorSubmit
                  }),
                  tipSlot
                ]
              )
            }
          }

          let innerStyle = {}
          if (_.isFunction(config.style)) {
            innerStyle = config.style(context, config)
          } else if (config.style) {
            innerStyle = tpl.deepFilter(config.style, context)
          }

          const _innerSolts = tipSlot ? [innerText, tipSlot] : innerText

          return h(
            'div',
            {
              style: innerStyle,
              class: { 'text-ellipsis': true },
              ...config.cell
            },
            _innerSolts
          )
        }

        scopedSlots.header = (scope: any) => {
          const context = app.useContext(scope)

          let headerConfig = config.header
          if (_.isFunction(headerConfig)) {
            headerConfig = config.header(context, config)
          }

          if (headerConfig?.cmpt) {
            return h(Cmpt, { config: headerConfig.cmpt, contextData: scope, ...headerConfig })
          }

          if (headerConfig?.component) {
            let headerCmptConfig: any = null

            if (_.isFunction(headerConfig.component)) {
              headerCmptConfig = headerConfig.component(context, config)
            }

            const headerCmpt = renderCmpt(headerCmptConfig, context)
            return headerCmpt
          }

          let headerLabel = headerConfig?.label || config.label
          if (config.headerTpl) {
            headerLabel = tpl.filter(config.headerTpl, context)
          }

          const batchEditor = config.batchEditor

          /** 批量编辑 */
          if (props.batchEditable && config.batchEditable) {
            return h(PopEditor as any, {
              config: batchEditor,
              column: config,
              scope,
              isBatch: true,
              onSubmit: props.onBatchEdit
            })
          }

          /** 插槽 */
          if (typeof config.showHeader !== 'undefined') {
            const slot = slots[`${config.prop}Header`]
            return slot && slot(scope)
          }

          let isRequired = false

          /** 必填项 */
          if (batchEditor && (batchEditor?.required || batchEditor?.rules)) {
            if (batchEditor.required || (batchEditor.rules || []).some((it: any) => it.required)) {
              isRequired = true
            }
          }

          let headerClass = config.header?.class
          if (isRequired && _.isObject(headerClass)) {
            headerClass['c-table-col-text-required'] = true
          }

          return h(
            'div',
            {
              ...headerConfig,
              class: headerClass
            },
            headerLabel
          )
        }
      }

      return scopedSlots
    }

    const columnProps = getColumnProps(props.column)
    const childrenSlots = buildChildrenSlots(props.column)

    return () => h(ElTableColumn, { ...columnProps }, childrenSlots)
  }
})

export default ChildTableColumn
