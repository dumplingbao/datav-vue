<template>
  <div class="canvas-main">
    <div id="canvas-wp" class="canvas-panel-wrap" @mousedown.stop="cancelSelectCom">
      <div class="screen-shot" :style="screenShotStyle">
        <align-line />
        <ruler />
        <div
          id="canvas-coms"
          class="canvas-panel"
          :style="canvasPanelStyle"
          @dragover="dragOver"
          @drop="dropToAddCom"
        >
          <datav-transform
            v-for="com in coms"
            :key="com.id"
            :com="com"
          >
            <component
              :is="com.name"
              :com="com"
              :style="{
                transform: 'translateZ(0px)',
                opacity: com.attr.opacity,
              }"
            />
          </datav-transform>
        </div>
      </div>
    </div>
    <div class="thumbnail"></div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue'
import type { CSSProperties } from 'vue'
import { ToolbarModule } from '@/store/modules/toolbar'
import { EditorModule } from '@/store/modules/editor'
import { BlueprintModule } from '@/store/modules/blueprint'
import { createComponent } from '@/components/datav'
import AlignLine from './align-line.vue'
import Ruler from './ruler/index.vue'
import DatavTransform from './datav-transform/index.vue'

export default defineComponent({
  name: 'CanvasMain',
  components: {
    AlignLine,
    Ruler,
    DatavTransform,
  },
  setup() {
    const canvas = computed(() => EditorModule.canvas)
    const pageConfig = computed(() => EditorModule.pageConfig)
    const coms = computed(() => EditorModule.coms)
    const screenShotStyle = computed(() => {
      return {
        width: `${canvas.value.width}px`,
        height: `${canvas.value.height}px`,
      } as CSSProperties
    })

    const canvasPanelStyle = computed(() => {
      return {
        position: 'absolute',
        width: `${pageConfig.value.width}px`,
        height: `${pageConfig.value.height}px`,
        transform: `scale(${canvas.value.scale}) translate(0px, 0px)`,
        backgroundImage: `url(${pageConfig.value.bgimage})`,
        backgroundColor: pageConfig.value.bgcolor,
      } as CSSProperties
    })

    const dropToAddCom = async (event: any) => {
      event.preventDefault()

      try {
        const name = event.dataTransfer.getData('text')
        if (name) {
          ToolbarModule.addLoading()
          let com = createComponent(name)
          const { scale } = EditorModule.canvas
          const offsetX = (event.clientX - ToolbarModule.getPanelOffsetLeft) / scale
          const offsetY = (event.clientY - ToolbarModule.getPanelOffsetTop) / scale
          com.attr.x = Math.round(offsetX - com.attr.w / 2)
          com.attr.y = Math.round(offsetY - com.attr.h / 2)
          await EditorModule.addCom(com)
          EditorModule.selectCom(com.id)
          ToolbarModule.removeLoading()

          if (com.apis.source) {
            await com.loadData()
            BlueprintModule.datavComponents[com.id].$DATAV_requestData()
          }
        }
      } catch {
        // TODO
      }
    }

    const cancelSelectCom = () => {
      EditorModule.selectCom()
    }

    const dragOver = (ev: DragEvent) => {
      ev.preventDefault()
      ev.stopPropagation()
      ev.dataTransfer.dropEffect = 'copy'
    }

    return {
      coms,
      screenShotStyle,
      canvasPanelStyle,
      dropToAddCom,
      cancelSelectCom,
      dragOver,
    }
  },
})
</script>

<style lang="scss" scoped>
.canvas-main {
  position: relative;
  display: flex;
  height: 100%;
  padding: 0;
  user-select: none;
  flex: 1;
  flex-basis: auto;
  overflow: auto;
}

.canvas-panel-wrap {
  position: relative;
  width: 100%;
  height: calc(100% - 32px);
  overflow: auto;

  .canvas-panel {
    top: 60px;
    left: 60px;
    background-position: center, right bottom;
    background-repeat: no-repeat, no-repeat;
    background-size: cover, contain;
    box-shadow: rgba(0, 0, 0, 0.5) 0 0 30px 0;
    transition: 0.2s all ease-in-out;
    transform-origin: 0 0;
  }
}
</style>

<style lang="scss">
.datav-com .datav-wraper,
.datav-layer .datav-wraper {
  pointer-events: none !important;
}

.datav-wraper {
  box-sizing: border-box;
}
</style>
