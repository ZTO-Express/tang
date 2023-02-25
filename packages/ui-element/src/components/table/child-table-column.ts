import {
  _,
  h,
  tpl,
  computed,
  renderHtml,
  renderCmpt,
  Cmpt,
  useSlots,
  defineComponent,
  useCurrentAppInstance
} from '@zto/zpage'
import { ElTableColumn, ElFormItem } from 'element-plus'

import { calcFormItemAttrs } from '../form'

import Cell from './cell.vue'
import HeaderCell from './header-cell.vue'
import CPoptip from '../poptip/CPoptip.vue'
import PopEditor from './pop-editor.vue'
import CAction from '../action/CAction.vue'

import type { GenericFunction } from '@zto/zpage'
import type { TableColumn } from './types'

const ChildTableColumn = defineComponent({
  props: {
    editorModel: { type: Object },
    editorExFormRules: { type: Array },
    column: { type: Object, default: () => ({} as TableColumn) },
    editable: { type: Boolean, default: false },
    batchEditable: { type: Boolean, default: false },
    onEditorSubmit: { type: Function }
  },

  setup(props, { emit }) {
    const slots = useSlots()
    const app = useCurrentAppInstance()

    function getColumnProps(config: any) {
      // 计算className
      if (config.expandColumn) {
        config.className = `expand-column ${config.className || ''}`
      }

      let colProps = _.omit(
        {
          ...config,
          align: config.align || 'center',
          key: `table${config.prop}`,
          prop: config.prop,
          width: config.width || '',
          formatter: config.formatter,
          className: config.className,
          showOverflowTooltip: config.tooltip !== false,
          fixed: config.fixed || undefined,
          editable: props.editable
        },
        'children'
      )

      return colProps
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
            return h(ElTableColumn, { ..._columnProps }, _childrenSlots)
          })
        }
      } else {
        // 编辑列
        scopedSlots.default = (scope: any) => {
          const context = app.useContext(scope)

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
            innerText = config.formatter(scope.row, config, scope.row[prop], context)
          }

          scope.row.__innerTexts[prop] = innerText

          if (config.html) {
            const htmlNode = renderHtml(config.html, context)
            return htmlNode
          }

          if (config.cmpt) {
            return h(Cmpt, { config: config.cmpt, contextData: scope })
          }

          if (config.action) {
            let actionConfig: any = {}

            if (_.isFunction(config.action)) {
              actionConfig = config.action(context, config)
            } else {
              actionConfig = { ...config.action }
            }

            // 单元格内的action
            return h(
              CAction,
              {
                buttonType: 'text',
                ...actionConfig,
                contextData: scope,
                textEllipsis: true
              },
              actionConfig?.label || innerText
            )
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

          const tipSlot = getTableTip(config, context)

          const editorProp = config.editorProp
          const rowEditable = !!scope.row.editable

          /** 编辑模式
           * editable 所有字段可编辑
           *  rowEditable 当前行可编辑 */
          if (config.editor && (props.editable || rowEditable)) {
            let editor = config.editor

            if (_.isFunction(config.editor)) {
              editor = config.editor(context, config)
            }

            if (editor.popover) {
              return h(PopEditor as any, {
                text: innerText,
                column: config,
                config: editor,
                scope,
                onSubmit: props.onEditorSubmit
              })
            } else {
              const editAttrs = _.omit(editor, ['itemType', 'formItem', 'required', 'noPadding', 'rules', 'innerAttrs'])
              const Editor = app.resolveComponent(`c-form-item-${editor.itemType}`)

              const formItemAttrs = {
                prop: `data.${scope.$index}.${editorProp}`,
                rules: editor.rules,
                label: editor.label || config.label,
                required: editor.required,
                noPadding: editor.noPadding,
                ...editor.formItem
              }

              const colFormItemAttrs = calcFormItemAttrs(formItemAttrs, context, {
                model: props.editorModel,
                exFormRules: props.editorExFormRules,
                disabled: editor.disabled
              })

              return h(
                ElFormItem,
                {
                  class: {
                    'table-column-form-item': true,
                    'no-padding': formItemAttrs.noPadding,
                    'show-label': formItemAttrs.showLabel
                  },
                  ...colFormItemAttrs
                },
                [
                  h(Editor, {
                    ...editAttrs,
                    model: scope.row,
                    prop: editorProp,
                    onSubmit: props.onBatchEditorSubmit
                  }),
                  tipSlot
                ]
              )
            }
          }

          const _innerSolts = tipSlot ? [innerText, tipSlot] : innerText

          return h(Cell, { app, scope, config, ...config.cell }, { default: () => _innerSolts })
        }
      }

      scopedSlots.header = (scope: any) => {
        const context = app.useContext(scope)

        let headerConfig = config.header || {}
        if (_.isFunction(headerConfig)) {
          headerConfig = config.header(context, config)
        }

        if (headerConfig.cmpt) {
          return h(Cmpt, { config: headerConfig.cmpt, contextData: scope, ...headerConfig })
        }

        if (headerConfig.component) {
          let headerCmptConfig: any = null

          if (_.isFunction(headerConfig.component)) {
            headerCmptConfig = headerConfig.component(context, config)
          }

          const headerCmpt = renderCmpt(headerCmptConfig, context)
          return headerCmpt
        }

        let headerLabel = headerConfig.label || config.label
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

        let headerClass = headerConfig?.class
        if (isRequired && _.isObject(headerClass)) {
          headerClass['c-table-col-text-required'] = true
        }

        return h(
          HeaderCell,
          { app, scope, config, ...headerConfig, class: headerClass },
          {
            default: () => {
              let tipSlot = getTableTip(headerConfig, context)
              const _innerSolts = tipSlot ? [headerLabel, tipSlot] : headerLabel
              return _innerSolts
            }
          }
        )
      }

      return scopedSlots
    }

    const columnProps = computed(() => {
      return getColumnProps(props.column)
    })

    const childrenSlots = computed(() => {
      return buildChildrenSlots(props.column)
    })

    return () => h(ElTableColumn, { ...columnProps.value }, childrenSlots.value)
  }
})

/** 渲染表格提示 */
export function getTableTip(config: any, context: any) {
  let tipProps: any = config?.tip

  if (!tipProps) return undefined

  if (_.isString(config?.tip)) {
    tipProps = { content: config?.tip }
  } else if (_.isFunction(tipProps)) {
    tipProps = config?.tip(context, config)
  }

  let isTip = tipProps.visibleOn ? tpl.evalExpression(tipProps.visibleOn, context) : true
  const tipSlot = isTip && h(CPoptip as any, { contextData: context.data, ...tipProps })

  return tipSlot
}

export default ChildTableColumn
