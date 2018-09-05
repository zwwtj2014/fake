// 单独提出来是为了实现递归
// 不使用dispatch遍历父组件找目标组件的原因是因为, 父组件时唯一的, 子组件是多个, 遍历至少是两层, 没递归看的清楚
function broadcast(componentName, eventName, params) {
  this.$children.forEach(child => {
    const name = child.$options.componentName;

    if (name === componentName) {
      child.$emit.apply(child, [eventName].concat(params));
    } else {
      broadcast.apply(child, [componentName, eventName].concat(params));
    }
  });
}

export default {
  methods: {
    // 向上
    dispatch(componentName, eventName, params) {
      let parent = this.$parent || this.$root;
      let name = parent.$options.componentName;

      // 根据componentName找到目标组件
      while (parent && (!name || name !== componentName)) {
        parent = parent.$parent;

        if (parent) {
          name = parent.$options.componentName;
        }
      }

      if (parent) {
        parent.$emit.apply(parent, [eventName].concat(params));
      }
    },
    // 向下
    broadcast(componentName, eventName, params) {
      broadcast.call(this, componentName, eventName, params);
    }
  }
};
