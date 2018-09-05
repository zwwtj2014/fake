<template>
    <div :class="[
        type === 'textarea' ? 'el-textarea' : 'el-input',
        inputSize ? `el-input--${inputSize}` : '',
        {
          'el-input--prefix': $slots.prefix || prefixIcon,
          'el-input--suffix': $slots.suffix || suffixIcon || clearable
        }
      ]"
      @mouseenter="hovering = true"
      @mouseleave="hovering = false"
    >
      <template v-if="type !== 'textarea'">
        <input
          v-if="type !== 'textarea'"
          class="el-input__inner"
          v-bind="$attrs"
          type="text"
          ref="input"
          :value="currentValue"
          :disabled="inputDisabled"
          :readonly="readonly"
          @input="handleInput"
          @focus="handleFocus"
        >
        <!-- 前置內容 -->
        <span class="el-input__prefix" v-if="$slots.prefix || prefixIcon">
          <slot name="prefix"></slot>
          <i class="el-input__icon" v-if="prefixIcon" :class="prefixIcon"></i>
        </span>
        <!-- 后置内容 -->
        <span class="el-input__suffix" v-if="$slots.suffix || suffixIcon || showClear">
          <span class="el-input__suffix-inner">
            <template v-if="!showClear">
              <slot name="suffix"></slot>
              <i class="el-input__icon" v-if="suffixIcon" :class="suffixIcon"></i>
            </template>
            <i v-else class="el-input__icon el-icon-circle-close el-input__clear" @click="clear"></i>
          </span>
        </span>
      </template>
      <textarea
        v-else
        class="el-textarea__inner"
        ref="textarea"
        v-bind="$attrs"
        :value="currentValue"
        :disabled="inputDisabled"
        :readonly="readonly"
        :style="textareaStyle"
        @input="handleInput"
        @focus="handleFocus"
      >
      </textarea>
    </div>
</template>

<script>
import emitter from 'fake-element-ui/src/mixins/emitter';
import migrating from 'fake-element-ui/src/mixins/migrating';
import calcTextareaHeight from './calcTextareaHeight';

export default {
  name: 'ElInput',
  componentName: 'ElInput',
  mixins: [emitter, migrating],
  inheritAttrs: false,
  inject: {
    // DI: 在任何后代组件里，我们都可以使用 inject 选项来接收指定的我们想要添加在这个实例上的属性
    elForm: {
      default: ''
    },
    elFormItem: {
      default: ''
    }
  },
  data() {
    return {
      currentValue: this.value === undefined || this.value === null ? '' : this.value,
      textareaCalcStyle: {}, // autosize时, 实时存储textarea的计算结果, {minHeight, height}
      isOnComposition: false, // 表示未处于composition event事件中
      valueBeforeComposition: null,
      focused: false, // 根据 focus 事件
      hovering: false // 根据 mouseenter/mouseleave 判断是否处于 hover 状态
    };
  },
  props: {
    value: [String, Number],
    type: {
      type: String,
      default: 'text'
    },
    size: String, // 只在`textarea`有效
    disabled: Boolean,
    readonly: Boolean,
    clearable: {
      type: Boolean,
      default: false
    },
    autosize: {
      type: [Boolean, Object],
      default: false
    },
    suffixIcon: String, // 输入框尾部图标
    prefixIcon: String // 输入框头部图标
  },
  computed: {
    _elFormItemSize() {
      return (this.elFormItem || {}).elFormItemSize;
    },
    inputSize() {
      return this.size || this._elFormItemSize || (this.$ELEMENT || {}).size;
    },
    inputDisabled() {
      return this.disabled || (this.elForm || {}).disabled;
    },
    textareaStyle() {
      return Object.assign({}, this.textareaCalcStyle, {resize: this.resize});
    },
    showClear() {
      return this.clearable &&
        !this.disabled &&
        !this.readonly &&
        this.currentValue !== '' &&
        (this.focused || this.hovering);
    }
  },
  methods: {
    focus() {
      (this.$refs.input || this.$refs.textarea).focus();
    },
    handleInput(e) {
      const value = e.target.value;
      this.setCurrentValue(value);
      if (this.isOnComposition) {
        return;
      }
      this.$emit('input', value); // input 事件
    },
    handleFocus(e) {
      this.focused = true;
      this.$emit('focus', e); // focus 事件
    },
    setCurrentValue(value) {
      // 处于composition事件中 且值未变化直接返回
      if (this.isOnComposition && value === this.valueBeforeComposition) {
        return;
      }
      this.currentValue = value;
      if (this.isOnComposition) {
        return;
      }
      this.$nextTick(this.resizeTextarea);
    },
    resizeTextarea() {
      // 标识当前Vue实例是否运行于服务端, 一般用于SSR
      if (this.$isServer) {
        return;
      }

      const { autosize, type } = this;
      if (type !== 'textarea') {
        return;
      }
      if (!autosize) {
        this.textareaCalcStyle = {
          minHeight: calcTextareaHeight(this.$refs.textarea).minHeight
        };
        return;
      }
      const { minRows, maxRows } = autosize;
      this.textareaCalcStyle = calcTextareaHeight(this.$refs.textarea, minRows, maxRows);
    },
    getMigratingConfig() {
      return {
        props: {
          'icon': 'icon is removed, use suffix-icon / prefix-icon instead.',
          'on-icon-click': 'on-icon-click is removed.'
        },
        events: {
          'click': 'click is removed.'
        }
      };
    },
    clear() {
      this.$emit('input', '');
      this.$emit('change', '');
      this.$emit('clear');
      this.setCurrentValue('');
      this.focus();
    }
  },

  mounted() {
    this.resizeTextarea();
  }
};
</script>

