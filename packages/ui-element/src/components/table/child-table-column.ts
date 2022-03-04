import { vue, renderHtml, tpl, _, useAppContext } from '@zto/zpage'
import { ElTableColumn, ElFormItem } from 'element-plus'

import type { GenericFunction } from '@zto/zpage'

import CPoptip from '../poptip/CPoptip.vue'
import BatchEditor from './batch-editor.vue'

import type { TableColumn } from './types'

const { defineComponent, ref, useSlots, h, resolveComponent } = vue

const ChildTableColumn = defineComponent({
  props: {
    column: {
      type: Object,
      default: () => {
        return {} as TableColumn
      }
    },
    editable: { type: Boolean, default: false },
    batchEditable: { type: Boolean, default: false },
    onBatchEdit: { type: Function },
    onEditorSubmit: { type: Function }
  },

  setup(props, { emit }) {
    const slots = useSlots()

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
          let headerLabel = config.label

          if (config.headerTpl) {
            const context = useAppContext(scope)
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
          const context = useAppContext(scope)

          if (config.tpl) return tpl.filter(config.tpl, context)
          if (config.html) return renderHtml(config.html, context)

          const rowEditable = !!scope.row.editable

          const editor = config.editor
          const prop = config.prop

          let tipSlot = null
          if (config?.tip) {
            const tipProps = config?.tip
            let isTip = tipProps.visibleOn ? tpl.evalExpression(tipProps.visibleOn, context) : true
            tipSlot = isTip && h(CPoptip as any, { context, ...tipProps })
          }

          /** 编辑模式
           * editable 所有字段可编辑
           *  rowEditable 当前行可编辑 */
          if (editor && (props.editable || rowEditable)) {
            const Editor = resolveComponent(`c-form-item-${editor.itemType}`)
            const editAttrs = _.omit(editor, ['itemType', 'innerAttrs'])
            const formItemAttrs = editor.innerAttrs?.formItem
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
                  onSubmit: props.onEditorSubmit
                }),
                tipSlot
              ]
            )
          }

          let innerText = scope.row[prop]

          /** 直接返回字段 */
          if (config.formatter) {
            innerText = config.formatter(scope.row, config, scope.row[prop], scope.$index, scope)
          }

          let innerStyle = {}
          if (config.style) {
            innerStyle = tpl.deepFilter(config.style, context)
          }

          const _innerSolts = tipSlot ? [innerText, tipSlot] : innerText

          return h(
            'div',
            {
              style: innerStyle,
              ...config.cell
            },
            _innerSolts
          )
        }

        scopedSlots.header = (scope: any) => {
          let headerLabel = config.label

          if (config.headerTpl) {
            const context = useAppContext(scope)
            headerLabel = tpl.filter(config.headerTpl, context)
          }

          const editor = config.editor

          /** 批量编辑 */
          if (props.batchEditable && config.batchEditable) {
            return h(BatchEditor as any, {
              editorType: `c-form-item-${editor.itemType}`,
              item: config,
              onOk: (data: Record<string, string>) => {
                return props.onBatchEdit && props.onBatchEdit(data)
              }
            })
          }

          /** 插槽 */
          if (typeof config.showHeader !== 'undefined') {
            const slot = slots[`${config.prop}Header`]
            return slot && slot(scope)
          }

          let isRequired = false

          /** 必填项 */
          if (editor && (editor.required || config.rules)) {
            if (editor.required || (config.rules || []).some((it: any) => it.required)) {
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
              ...config.header,
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

    return () =>
      h(
        ElTableColumn,
        {
          ...columnProps
        },
        childrenSlots
      )
  }
})

export default ChildTableColumn
