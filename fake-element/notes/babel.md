- `loose mode`：[相关解释](http://2ality.com/2015/12/babel6-loose-mode.html)

  > TL;DR 
  >
  > 在转换的过程中存在两种模式：紧随，严格的和稍微松散一点的。loose为true表示开启松散的。
  >
  > 比如：正常的类的方式是不可枚举的，但是通过原型定义是可以的。在转换的过程中，松散的话就是直接转成原型上定义，紧随严格的就是使用`Object.defineProperties`这种来设置不可枚举