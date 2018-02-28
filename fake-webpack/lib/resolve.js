/**
 * resolve require module logic
 *  => 1. 如果是绝对路径或者相对路径, 则根据路径去找, 找不到报错
 *  => 2. 如果给的是模块的名称, 先在入口js文件所在目录找同名js文件, 找不到进入第三部
 *  => 3. 在入口文件的同级的node_modules去找, 找不到报错
 * 
 * => 新的webpack应该已经改成通过node require的方式去找模块了
 */