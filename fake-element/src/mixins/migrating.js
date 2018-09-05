/**
 * Show migrating guide in browser console.
 *
 * Usage:
 * import Migrating from 'element-ui/src/mixins/migrating';
 *
 * mixins: [Migrating]
 *
 * add getMigratingConfig method for your component.
 *  getMigratingConfig() {
 *    return {
 *      props: {
 *        'allow-no-selection': 'allow-no-selection is removed.',
 *        'selection-mode': 'selection-mode is removed.'
 *      },
 *      events: {
 *        selectionchange: 'selectionchange is renamed to selection-change.'
 *      }
 *    };
 *  },
 */

export default {
  // 钩子混合时会合并成一个数组，因此都会被调用
  mounted() {
    if (process.env.NODE_ENV === 'production') {
      return;
    }
    if (!this.$vnode) {
      return;
    }

    const { props = {}, events = {}} = this.getMigratingConfig();
    const { data, componentOptions } = this.$vnode;
    const definedProps = data.attrs || {};
    const definedEvents = componentOptions.listeners || {};

    for (const propName in definedProps) {
      if (definedProps.hasOwnProperty(propName) && props[propName]) {
        console.warn(`[Element Migrating][${this.$options.name}][Attribute]: ${props[propName]}`);
      }
    }

    for (let eventName in definedEvents) {
      if (definedEvents.hasOwnProperty(eventName) && events[eventName]) {
        console.warn(`[Element Migrating][${this.$options.name}][Event]: ${events[eventName]}`);
      }
    }
  },
  // 值为对象的选项，如`methods`, `components`, `directives` 混合时，如果键名冲突，取组件对象的键值对
  methods: {
    // 该方法由混入组件复写, 注入迁移的属性及其信息
    getMigratingConfig() {
      return {
        props: {},
        events: {}
      };
    }
  }
};
