<template>
  <div class="nav-line">
    <div class="nav-line-top" :style="topLineStyle"></div>
    <div class="nav-line-left" :style="leftLineStyle"></div>
    <div class="nav-line-account" :style="accountStyle">
      {{ attr.x }}, {{ attr.y }}
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, computed } from 'vue'
import { ComponentAttr } from '@/components/datav-component'

export default defineComponent({
  name: 'ReferLine',
  props: {
    attr: {
      type: Object as PropType<ComponentAttr>,
      required: true,
    },
    scale: {
      type: Number,
      required: true,
    },
  },
  setup(props) {
    const topLineStyle = computed(() => ({
      height: `${props.attr.y + 60 / props.scale}px`,
      borderLeftWidth: `${0.9 / props.scale}px`,
    }))

    const leftLineStyle = computed(() => ({
      width: `${props.attr.x + 60 / props.scale}px`,
      borderTopWidth: `${0.9 / props.scale}px`,
    }))

    const accountStyle = computed(() => ({
      fontSize: `${(12 / props.scale)}px`,
      top: `-${(6 / props.scale)}px`,
      left: `-${(6 / props.scale)}px`,
    }))

    return {
      topLineStyle,
      leftLineStyle,
      accountStyle,
    }
  },
})
</script>

<style lang="scss" scoped>
@import '@/styles/themes/var';

.nav-line {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  box-sizing: content-box;
}

.nav-line-top {
  position: absolute;
  left: 0;
  width: 0;
  border-left: 1px dashed $gui-primary-color;
  transform: translateY(-100%);
}

.nav-line-left {
  position: absolute;
  top: 0;
  height: 0;
  border-top: 1px dashed $gui-primary-color;
  transform: translateX(-100%);
}

.nav-line-account {
  position: absolute;
  color: $gui-primary-color;
  text-shadow: 1px 1px 1px #222;
  white-space: nowrap;
  transform: translate(-100%, -100%);
}
</style>
