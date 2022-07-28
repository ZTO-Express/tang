<template>
  <div class="app-header-extra">
    <div v-if="isDownloads" class="button-link icon" type="text" @click="handleDownloadsClick">
      <el-icon class="icon"><icon-list /></el-icon>
      <span class="label">下载列表</span>
    </div>

    <div class="divider">
      <el-divider direction="vertical"></el-divider>
    </div>

    <div class="dropdown-con">
      <el-dropdown class="link-item" size="medium" trigger="click" @command="handleDropdownCommand">
        <span class="dropdown-link">
          {{ nickname }}
          <el-icon class="dropdown-link__icon">
            <arrow-down />
          </el-icon>
        </span>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item v-if="userPositions.length" class="dropdown-link__item" command="position">
              切换组织/岗位
            </el-dropdown-item>
            <el-dropdown-item class="dropdown-link__item" command="logout">退出登录</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>

    <!-- 用户切换组织/岗位提示 -->
    <el-dialog v-model="isShowPositionAlert" title="切换组织/岗位" width="550px">
      <div class="position-alert dialog-body">
        <div class="content">
          <div class="img01">
            <img :src="changePositionImg01" />
            <div class="text">账号信息</div>
          </div>
          <div class="img02">
            <img :src="changePositionImg02" />
            <div class="text">切换组织/岗位</div>
          </div>
        </div>
        <div class="tip">如需切换组织/岗位，您可在「账号信息-切换组织/岗位」中操作</div>
      </div>
      <template #footer>
        <span class="position-alert dialog-footer">
          <el-button type="primary" v-preventReclick @click="handleUserPositionConfirm">我知道了</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 用户切换组织/岗位对话框 -->
    <c-dialog
      ref="positionChooseDialogRef"
      title="切换组织/岗位"
      width="550px"
      :formItems="positionChooseFormItems"
      :on-submit="positionChooseSubmitMethod"
    ></c-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, useCurrentAppInstance } from '@zto/zpage'
import { appUtil, ElementPlusIcons } from '@zto/zpage-ui-element'

const { ArrowDown } = ElementPlusIcons
const IconList = ElementPlusIcons.List

const app = useCurrentAppInstance()

const { MessageBox } = app.useMessage()

const { userStore } = app.stores
const { authApi } = app.apis
const downloadsConfig = app.useAppConfig('header.downloads')

const imageAssets = app.useAssets('images', {})
const { changePositionImg01, changePositionImg02 } = imageAssets

const userPositions = ref<any[]>([])
const isShowPositionAlert = ref(false)
const positionChooseDialogRef = ref<any>()

const nickname = computed(() => {
  return userStore.nickname
})

const innerUserBasic = computed(() => {
  return userStore.data?.basic
})

const isDownloads = computed(() => {
  return !!(downloadsConfig && downloadsConfig !== false)
})

const positionChooseFormItems = computed(() => {
  return [
    {
      type: 'select',
      prop: 'position',
      options: userPositions.value,
      label: '组织/岗位',
      required: true,
      labelWidth: '120px',
      span: 24
    }
  ]
})

onMounted(async () => {
  await fetchUserInfo()

  checkUserPositionAlert()
})

// 下拉菜单命令
function handleDropdownCommand(command: string) {
  switch (command) {
    case 'position':
      changeUserPosition()
      break
    case 'logout':
      logout()
      break
  }
}

async function logout() {
  app.logout()

  // await MessageBox.confirm('确定退出系统？', {
  //   title: '确认提示',
  //   confirmButtonText: '确定',
  //   cancelButtonText: '取消',
  //   type: 'warning'
  // }).then(() => {
  //   return app.logout()
  // })
}

// 打开下载页
function handleDownloadsClick() {
  appUtil.openDownloadsDialog()
}

// 确认已读
async function handleUserPositionConfirm() {
  await authApi.confirmUserPositionRead()

  isShowPositionAlert.value = false
}

// 提交岗位选择
async function positionChooseSubmitMethod(payload: any) {
  const positionKey = payload?.position

  if (!positionKey) return

  // 获取岗位信息
  const position = userPositions.value.find(it => it.value === positionKey)

  if (!position) return

  await authApi.changeUserPosition({
    deptCode: position.deptCode,
    positionCode: position.positionCode
  })

  setTimeout(() => {
    window.location.reload()
  }, 200)
}

// 切换用户组织岗位
function changeUserPosition() {
  const userBasic = innerUserBasic.value
  if (!userBasic) return

  const position = [userBasic.deptCode, userBasic.positionCode].join()

  positionChooseDialogRef.value.show({ position })
}

/** 检查用户是否已选择岗位 */
function checkUserPositionAlert() {
  const userBasic = innerUserBasic.value
  if (!userBasic) return

  // 当用户拥有多个岗位，且没有选择部门，且没有设置已读，跳出提醒
  if (userPositions.value?.length > 1 && !userBasic.chooseDeptPosition && !userBasic.readDeptPosition) {
    isShowPositionAlert.value = true
  }
}

/** 获取用户岗位列表 */
async function fetchUserInfo() {
  const res = await authApi.getUserPositions()

  userPositions.value = (res || []).map((it: any) => {
    return {
      ...it,
      value: [it.deptCode, it.positionCode].join(),
      label: `${it.deptName || ''} - ${it.positionName || ''}`
    }
  })
}
</script>

<style lang="scss">
@import '../../styles/app.scss';
</style>

<style lang="scss" scoped>
.position-alert {
  &.dialog-body {
    & > .content {
      display: flex;

      & > .img01 img {
        width: 200px;
      }

      & > .img02 img {
        width: 300px;
      }

      .text {
        text-align: center;
        line-height: 30px;
      }
    }

    & > .tip {
      padding: 10px 20px;
    }
  }

  &.dialog-footer {
    padding: 10px 20px;
  }
}
</style>
