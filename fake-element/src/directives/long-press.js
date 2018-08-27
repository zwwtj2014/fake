export default {
  /**
   * 允许引用指令绑定的元素
   * 获取传递给指令的值
   * 标识指令使用的组件
   */
  bind(el, binding, vNode) {
    // 定义变量
    let pressTimer = null;

    // 定义函数处理程序
    // 创建计时器（ 1秒后执行函数 ）
    let start = e => {
      if (e.type === 'click' && e.button !== 0) {
        return;
      }
      if (pressTimer === null) {
        pressTimer = setTimeout(() => {
          handler();
        }, 1000);
      }
    };

    // 取消计时器
    let cancel = () => {
      // 检查是否有正在运行的计时器
      if (pressTimer !== null) {
        clearTimeout(pressTimer);
        pressTimer = null;
      }
    };

    // 运行函数
    const handler = e => {
      // 确保提供的表达式是函数

      if (typeof binding.value !== 'function') {
        // 获取组件名称
        const compName = vNode.context.name;

        // 将警告传递给控制台
        let warn = `[longpress:] provided expression '${binding.expression}' is not a function, but has to be `;
        if (compName) { warn += `Found in component '${compName}' `; }
        console.warn(warn);
      }
      // 执行传递给指令的方法
      binding.value(e);
    };

    // 添加事件监听器
    el.addEventListener('mousedown', start);
    el.addEventListener('touchstart', start);

    // 取消计时器
    el.addEventListener('click', cancel);
    el.addEventListener('mouseout', cancel);
    el.addEventListener('touchend', cancel);
    el.addEventListener('touchcancel', cancel);
  }
};
