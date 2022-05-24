# vue-draggable

Vue Drag and Drop library without any dependency.
Native HTML5 drag and drop implementation made for Vue.

[npm-url]: https://www.npmjs.com/package/@nocyoung/vue-draggable

# Install
yarn add @nocyoung/vue-draggable

# Usage
```
import Draggable from '@nocyoung/vue-draggable';
<Draggable
    :bounds="bounds"
    :defaultPosition="defaultPosition"
    @onUserDragStart="onUserDragStart"
    @onUserDragEnd="onUserDragEnd"
>
    <img
    :src="imgSrc"
    alt="你的图片"
    />
</Draggable>

```
bounds: 拖拽的边界, 为上下左右到左上角的距离, 单位为px, 比如:  
bounds = {
    left: 100;
    right: 100;
    top:0,
    bottom:50
}  
  
defaultPosition: 拖拽元素初始位置, 单位为px, 比如:  
defaultPosition = {
    x: 100,
    y: 200,
}  
  
onUserDragStart: 拖拽开始回调，参数为位置坐标  
onUserDragEnd: 拖放结束回调，参数为位置坐标  
