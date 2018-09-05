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
        :value="currentValue"
        :disabled="inputDisabled"
        :readonly="readonly"
        @input="handleInput"
      >
      </textarea>
    </div>
</template>

<script>
import emitter from 'fake-element-ui/src/mixins/emitter';
import migrating from 'fake-element-ui/src/mixins/migrating';

export default {
  name: 'ElInput',
  componentName: 'ElInput',
  mixins: [emitter, migrating],
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
  }
};
</script>

