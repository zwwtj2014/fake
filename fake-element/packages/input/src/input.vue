<template>
    <div :class="[
        type === 'textarea' ? 'el-textarea' : 'el-input',
        inputSize ? `el-input--${inputSize}` : '',
        {
          'is-disabled': inputDisabled,
          'el-input-group': $slots.prepend || $slots.append,
          'el-input-group--append': $slots.append,
          'el-input-group--prepend': $slots.prepend,
          'el-input--prefix': $slots.prefix || prefixIcon,
          'el-input--suffix': $slots.suffix || suffixIcon || clearable
        }
      ]"
      @mouseenter="hovering = true"
      @mouseleave="hovering = false"
    >
      <template v-if="type !== 'textarea'">
        <!-- 前置元素 -->
        <div class="el-input-group__prepend" v-if="$slots.prepend">
          <slot name="prepend"></slot>
        </div>
        <input
          v-if="type !== 'textarea'"
          :tabindex="tabindex"
          class="el-input__inner"
          v-bind="$attrs"
          :type="type"
          ref="input"
          :autocomplete="autoComplete"
          :value="currentValue"
          :disabled="inputDisabled"
          :readonly="readonly"
          @input="handleInput"
          @focus="handleFocus"
          @blur="handleBlur"
          @change="handleChange"
          @compositionstart="handleComposition"
          @compositionupdate="handleComposition"
          @compositionend="handleComposition"
          :aria-label="label"
        >
        <!-- 前置內容 -->
        <span class="el-input__prefix" v-if="$slots.prefix || prefixIcon">
          <slot name="prefix"></slot>
          <i class="el-input__icon" v-if="prefixIcon" :class="prefixIcon"></i>
        </span>
        <!-- 后置内容 -->
        <span
          class="el-input__suffix"
          v-if="$slots.suffix || suffixIcon || showClear || validateState || needStatusIcon">
          <span class="el-input__suffix-inner">
            <template v-if="!showClear">
              <slot name="suffix"></slot>
              <i class="el-input__icon" v-if="suffixIcon" :class="suffixIcon"></i>
            </template>
            <i v-else class="el-input__icon el-icon-circle-close el-input__clear" @click="clear"></i>
          </span>
          <i class="el-input__icon"
            v-if="validateState"
            :class="['el-input__validateIcon', validateIcon]">
          </i>
        </span>
        <!-- 后置元素 -->
        <div class="el-input-group__append" v-if="$slots.append">
          <slot name="append"></slot>
        </div>
      </template>
      <textarea
        v-else
        :tabindex="tabindex"
        class="el-textarea__inner"
        ref="textarea"
        v-bind="$attrs"
        :value="currentValue"
        :disabled="inputDisabled"
        :readonly="readonly"
        :style="textareaStyle"
        @input="handleInput"
        @focus="handleFocus"
        @blur="handleBlur"
        @change="handleChange"
        @compositionstart="handleComposition"
        @compositionupdate="handleComposition"
        @compositionend="handleComposition"
        :aria-label="label"
      >
      </textarea>
    </div>
</template>

<script>
import emitter from 'main/mixins/emitter';
import migrating from 'main/mixins/migrating';
import calcTextareaHeight from './calcTextareaHeight';
import { isKorean } from 'element-ui/src/utils/shared';

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
      focused: false, // 根据 focus 事件判断是否处于focus状态
      hovering: false // 根据 mouseenter/mouseleave 判断是否处于 hover 状态
    };
  },
  props: {
    tabindex: String,
    value: [String, Number],
    label: String,
    type: {
      type: String,
      default: 'text'
    },
    size: String, // 只在`textarea`有效
    resize: String, // 控制是否能被用户缩放 (none/both/horizontal/vertical)
    disabled: Boolean,
    readonly: Boolean,
    clearable: {
      type: Boolean,
      default: false
    },
    autoComplete: {
      type: String,
      default: 'off'
    },
    autosize: {
      type: [Boolean, Object],
      default: false
    },
    suffixIcon: String, // 输入框尾部图标
    prefixIcon: String, // 输入框头部图标
    validateEvent: {
      type: Boolean,
      default: true
    },
    form: String // 原生属性, 表示与该input元素关系的表单元素
  },
  computed: {
    _elFormItemSize() {
      return (this.elFormItem || {}).elFormItemSize;
    },
    validateState() {
      return this.elFormItem ? this.elFormItem.validateState : '';
    },
    needStatusIcon() {
      return this.elForm ? this.elForm.statusIcon : false;
    },
    validateIcon() {
      return {
        validating: 'el-icon-loading',
        success: 'el-icon-circle-check',
        error: 'el-icon-circle-close'
      }[this.validateState];
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
  watch: {
    value(val) {
      this.setCurrentValue(val);
    }
  },
  methods: {
    focus() {
      (this.$refs.input || this.$refs.textarea).focus();
    },
    blur() {
      (this.$refs.input || this.$refs.textarea).blur();
    },
    select() {
      (this.$refs.input || this.$refs.textarea).select();
    },
    handleInput(e) {
      const value = e.target.value;
      this.setCurrentValue(value);
      if (this.isOnComposition) {
        return;
      }
      this.$emit('input', value); // input 事件
    },
    handleChange(e) {
      this.$emit('change', e.target.value);
    },
    handleFocus(e) {
      this.focused = true;
      this.$emit('focus', e); // focus 事件
    },
    handleBlur(e) {
      this.focused = false;
      this.$emit('blur', e);
      if (this.validateEvent) {
        this.dispatch('ElFormItem', 'el.form.blur', [this.currentValue]);
      }
    },
    handleComposition(e) {
      if (e.type === 'compositionend') {
        this.isOnComposition = false;
        this.currentValue = this.valueBeforeComposition;
        this.valueBeforeComposition = null;
        this.handleInput(e);
      } else {
        const text = e.target.value;
        const lastCharacter = text[text.length - 1] || '';
        this.isOnComposition = !isKorean(lastCharacter);
        if (this.isOnComposition && e.type === 'compositionstart') {
          this.valueBeforeComposition = text;
        }
      }
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
      // 这里???
      if (this.validateEvent && this.currentValue === this.value) {
        this.dispatch('ElFormItem', 'el.form.change', [value]);
      }
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
    calcIconOffset(place) {
      let elList = [].slice.call(this.$el.querySelectorAll(`.el-input__${place}`) || []);
      if (!elList.length) return;
      let el = null;
      for (let i = 0; i < elList.length; i++) {
        if (elList[i].parentNode === this.$el) {
          el = elList[i];
          break;
        }
      }
      if (!el) return;
      const pendantMap = {
        suffix: 'append',
        prefix: 'prepend'
      };

      const pendant = pendantMap[place];
      if (this.$slots[pendant]) {
        el.style.transform = `translateX(${place === 'suffix' ? '-' : ''}${this.$el.querySelector(`.el-input-group__${pendant}`).offsetWidth}px)`;
      } else {
        el.removeAttribute('style');
      }
    },
    updateIconOffset() {
      this.calcIconOffset('prefix');
      this.calcIconOffset('suffix');
    },
    clear() {
      this.$emit('input', '');
      this.$emit('change', '');
      this.$emit('clear');
      this.setCurrentValue('');
      this.focus();
    }
  },
  created() {
    this.$on('inputSelect', this.select);
  },
  mounted() {
    this.resizeTextarea();
    this.updateIconOffset();
  },
  updated() {
    this.$nextTick(this.updateIconOffset);
  }
};
</script>

