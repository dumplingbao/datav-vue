<template>
  <div class="g-footer bottom-sider">
    <n-popover
      :width="235"
      placement="top"
      trigger="hover"
      raw
      style="--color: var(--datav-component-bg);"
    >
      <template #trigger>
        <n-icon class="shortcut-btn">
          <IconKeyboard />
        </n-icon>
      </template>
      <div class="shortcut-wp">
        <div class="shortcut-item">
          <div class="shortcut-title">开关图层面板</div>
          <div class="shortcut-value">Ctrl/Cmd + ←</div>
        </div>
        <div class="shortcut-item">
          <div class="shortcut-title">切换组件面板</div>
          <div class="shortcut-value">Ctrl/Cmd + ↑</div>
        </div>
        <div class="shortcut-item">
          <div class="shortcut-title">切换右侧面板</div>
          <div class="shortcut-value">Ctrl/Cmd + →</div>
        </div>
        <div class="shortcut-item">
          <div class="shortcut-title">画布缩放到最佳位置</div>
          <div class="shortcut-value">Ctrl/Cmd + a</div>
        </div>
      </div>
    </n-popover>
    <div class="scale-input-wp">
      <input
        v-model="inputScale"
        type="number"
        class="scale-input"
        @keydown.enter="submitScale(0)"
      >
      <span class="percent">%</span>
      <n-popover
        :width="56"
        placement="top"
        trigger="click"
        :show-arrow="false"
        raw
        style="--color: var(--datav-component-bg);"
      >
        <template #trigger>
          <n-icon class="open-icon">
            <IconArrowDown />
          </n-icon>
        </template>
        <div class="scale-value-list">
          <div
            v-for="s in scaleList"
            :key="s.value"
            class="scale-value-item"
            @click="submitScale(s.value)"
          >
            {{ s.label }}
          </div>
        </div>
      </n-popover>
    </div>
    <div class="scale-slider-wp">
      <n-slider
        v-model:value="scale"
        :min="10"
        :max="200"
        :step="5"
        :tooltip="false"
        @update:value="submitScale"
      />
    </div>
  </div>
</template>

<script lang='ts'>
import { defineComponent, ref, watch, onMounted, onUnmounted } from 'vue'
import { isMac } from '@/utils/util'
import { PanelType, ToolbarModule } from '@/store/modules/toolbar'
import { EditorModule } from '@/store/modules/editor'
import { IconKeyboard, IconArrowDown } from '@/icons'

export default defineComponent({
  name: 'FooterToolbar',
  components: {
    IconKeyboard,
    IconArrowDown,
  },
  setup() {
    const scale = ref(20)
    const inputScale = ref(20)
    const scaleList = [
      { label: '200%', value: 200 },
      { label: '150%', value: 150 },
      { label: '100%', value: 100 },
      { label: '50%', value: 50 },
      { label: '自适应', value: -1 },
    ]

    const getPanelOffset = () => ({
      offsetX: ToolbarModule.getPanelOffsetX,
      offsetY: ToolbarModule.getPanelOffsetY,
    })

    const submitScale = async (val: number) => {
      if (val === -1) {
        EditorModule.autoCanvasScale(getPanelOffset)
      } else {
        EditorModule.setCanvasScale({
          scale: val === 0 ? inputScale.value : val,
          ...getPanelOffset(),
        })
      }
    }

    watch(
      () => EditorModule.canvas.scale,
      s => {
        const val = parseInt((s * 100).toFixed(2))
        scale.value = val
        inputScale.value = val
      },
    )

    const addShortcuts = (ev: KeyboardEvent) => {
      const target = ev.target as HTMLElement
      if (!['input','textarea'].includes(target.tagName.toLowerCase())) {
        const ismac = isMac()
        if ((!ismac && ev.ctrlKey) || (ismac && ev.metaKey)) {
          const key = ev.key.toLowerCase()
          const { setPanelState } = ToolbarModule
          if (key === 'arrowleft') {
            setPanelState({ type: PanelType.layer, value: !ToolbarModule.layer.show })
          } else if (key === 'arrowup') {
            setPanelState({ type: PanelType.components, value: !ToolbarModule.components.show })
          } else if (key === 'arrowright') {
            setPanelState({ type: PanelType.config, value: !ToolbarModule.config.show })
          } else if (key === 'a') {
            EditorModule.autoCanvasScale(getPanelOffset)
          }

          ev.preventDefault()
        }
      }
    }

    onMounted(() => {
      document.addEventListener('keydown', addShortcuts, false)
    })

    onUnmounted(() => {
      document.removeEventListener('keydown', addShortcuts, false)
    })

    return {
      scaleList,
      scale,
      inputScale,
      submitScale,
    }
  },
})
</script>

<style lang="scss" scoped>
.bottom-sider {
  position: absolute;
  right: 0;
  bottom: 0;
  z-index: 99;
  display: flex;
  width: 100%;
  height: 32px;
  background: #222528;
  box-shadow: 0 -1px #000;
  user-select: none;
  align-items: center;
  justify-content: flex-end;

  .shortcut-btn {
    margin-right: 20px;
    font-size: 18px;
    color: var(--datav-font-color);
    cursor: pointer;
  }

  .scale-input-wp {
    position: relative;
    display: block;
    width: 58px;
    height: 20px;
    line-height: 18px;
    margin-right: 20px;
    overflow: hidden;
    cursor: pointer;
    background: var(--datav-dark-color);
    border: var(--datav-outline);

    .scale-input {
      width: 27px;
      padding-left: 5px;
      font-size: 12px;
      color: var(--datav-font-color);
      text-align: right;
      background: transparent;
      caret-color: var(--datav-font-color);

      &::-webkit-inner-spin-button,
      &::-webkit-outer-spin-button {
        margin: 0;
        -webkit-appearance: none;
      }
    }

    .percent {
      margin-left: 1px;
      color: var(--datav-font-color);
    }

    .open-icon {
      position: absolute;
      font-weight: bold;
      color: var(--datav-font-color);
      transform: scale(0.6);
    }
  }

  .scale-slider-wp {
    width: 190px;
  }
}

.shortcut-wp {
  position: relative;
  padding: 5px 10px;
  font-size: 12px;
  background: var(--datav-component-bg);
  box-shadow: 0 0 8px -4px #000;
  user-select: none;

  .shortcut-item {
    display: flex;
    margin: 5px 0;
    justify-content: space-between;
    align-items: center;
  }

  .shortcut-title {
    padding-right: 15px;
    color: var(--datav-font-color);
  }

  .shortcut-value {
    padding: 4px 6px;
    font-weight: 700;
    color: #08a1db;
    background: #262b33;
    border-radius: 2px;
  }
}

.scale-value-list {
  font-size: 12px;
  background: #262b33;
  border: var(--datav-outline);
  user-select: none;

  .scale-value-item {
    width: 54px;
    padding: 5px 0;
    color: var(--datav-font-color);
    text-align: center;
    cursor: pointer;
    transition: 0.2s;

    &:hover {
      color: var(--datav-main-hover-color);
      background: var(--datav-bgcolor-1);
    }

    &:not(:first-child) {
      border-top: var(--datav-outline);
    }
  }
}
</style>
