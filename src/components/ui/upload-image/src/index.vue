<template>
  <div
    class="datav-gui g-upload"
    :class="[
      {
        '--inline --single': !!inline,
      }
    ]"
  >
    <el-input
      :model-value="modelValue"
      placeholder="请输入图片地址"
      prefix-icon="v-icon-link"
      size="mini"
      @update:model-value="handleInput"
    />
    <el-upload
      v-loading="loading"
      element-loading-text="正在上传..."
      element-loading-spinner="v-icon-loading"
      element-loading-background="rgba(0, 0, 0, 0.7)"
      drag
      accept="image/*"
      :action="action"
      :multiple="false"
      :show-file-list="false"
      :before-upload="beforeUpload"
      :on-success="onSuccess"
      :on-error="onError"
      :data="form"
    >
      <div
        class="g-upload-image-wrap"
        @mouseenter="handleMouseEnter"
        @mouseleave="handleMouseLeave"
      >
        <div class="g-upload-image-content">
          <img v-if="modelValue && !iserr" :src="modelValue">
          <div v-else class="g-upload-tip">
            <i class="v-icon-img"></i>
            <div>点击或拖拽文件到这里更换</div>
          </div>
        </div>
        <div v-if="visibleCover" class="g-upload-image-cover">
          <span>更改</span>
          <p style="padding: 0 10px;">|</p>
          <span @click.stop="removeImage">删除</span>
        </div>
      </div>
    </el-upload>
    <span v-if="label" class="g-input__caption">
      {{ label }}
    </span>
  </div>
</template>

<script lang='ts'>
import { defineComponent, ref, watch } from 'vue'
import { UPDATE_MODEL_EVENT } from '@/utils/constants'
import { useMessage } from 'naive-ui'
import { generateId } from '@/utils/util'
import { uploadHost, previewHost, validAllowImg } from '@/utils/upload-util'
import { getTokenByEnv } from '@/api/qiniu'

export default defineComponent({
  name: 'GUploadImage',
  props: {
    modelValue: {
      type: String,
      required: true,
    },
    allowType: {
      type: String,
      default: 'gif|jpeg|jpg|png',
    },
    size: {
      type: Number,
      default: 2,
    },
    action: {
      type: String,
      default: uploadHost,
    },
    previewHost: {
      type: String,
      default: previewHost,
    },
    label: {
      type: String,
      default: '',
    },
    inline: {
      type: [Boolean, String],
      default: false,
    },
  },
  emits: [UPDATE_MODEL_EVENT],
  setup(props, ctx) {
    const nMessage = useMessage()
    const loading = ref(false)
    const form = ref({
      key: '',
      token: '',
    })
    const iserr = ref(false)
    const visibleCover = ref(false)

    const beforeUpload = async (file: any) => {
      const valid = validAllowImg(file, {
        allowType: props.allowType,
        allowSize: props.size,
      })

      if (valid) {
        nMessage.error(valid)
        return false
      }

      try {
        loading.value = true
        form.value.token = await getTokenByEnv()
        form.value.key = `upload/${generateId()}_${file.name}`
        return true
      } catch (error) {
        loading.value = false
        nMessage.error(error.toString())
      }

      return false
    }

    const onSuccess = (res: any) => {
      loading.value = false
      ctx.emit(UPDATE_MODEL_EVENT, `${props.previewHost}/${res.key}`)
    }

    const onError = (error: any) => {
      loading.value = false
      nMessage.error(error.toString())
    }

    const handleInput = (value: string) => {
      ctx.emit(UPDATE_MODEL_EVENT, value)
    }

    const zoomImage = () => {
      const img = new Image()
      img.src = props.modelValue
      img.onload = () => {
        iserr.value = false
      }

      img.onerror = () => {
        iserr.value = true
        if (props.modelValue) {
          nMessage.error('图片加载失败')
        }
      }
    }

    const handleMouseEnter = () => {
      if (props.modelValue) {
        visibleCover.value = true
      }
    }

    const handleMouseLeave = () => {
      visibleCover.value = false
    }

    const removeImage = () => {
      handleInput('')
      visibleCover.value = false
    }

    watch(() => props.modelValue, zoomImage)

    return {
      loading,
      form,
      iserr,
      visibleCover,
      beforeUpload,
      onSuccess,
      onError,
      handleInput,
      handleMouseEnter,
      handleMouseLeave,
      removeImage,
    }
  },
})
</script>
