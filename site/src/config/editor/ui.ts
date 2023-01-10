/** UI配置信息 */
export interface UIConfig {
  /** 编辑器配置 */
  settings?: {
    cmpt?: string
    items?: any[] // 表单项配置
  }
}

/**
 * 各UI相关配置
 */
export const uis: Record<string, UIConfig> = {
  // 是否及字符串编辑
  booleanString: {
    settings: {
      cmpt: 'CUIBooleanStringSettings'
    }
  },

  // api设置
  api: {
    settings: {
      cmpt: 'CUIApiSettings'
    }
  },

  // 权限设置
  perm: {
    settings: {
      cmpt: 'CUIPermSettings'
    }
  },

  // 上下文数据
  contextPayload: {
    settings: {
      cmpt: 'CUIContextPayloadSettings'
    }
  },

  // 上下文数据
  contextFunction: {
    settings: {
      cmpt: 'CUIContextFunctionSettings'
    }
  },

  actionSet: {
    settings: {
      cmpt: 'CUIActionSetSettings'
      // items: []
    }
  },

  actionItems: {
    settings: {
      cmpt: 'CUIActionItemsSettings'
    }
  },

  formItems: {
    settings: {
      cmpt: 'CUIFormItemsSettings'
    }
  },

  tableColumns: {
    settings: {
      cmpt: 'CUITableColumnsSettings'
    }
  }
}
