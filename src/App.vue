<template>
  <div
    v-bind:style="{ transform: 'translate(' + xPum + 'px,' + yPum + 'px)' }"
    @touchstart="touchstart"
    @touchend="touchend"
    @mousedown="onMouseDown"
    @mouseup="onMouseUp"
  >
    <slot></slot>
  </div>
</template>
<script>
/*eslint-disable*/
import { 
  getTouchIdentifier,
  getTouch,
  findInArray,
  isNum,
  addEvent,
  removeEvent 
} from './utils';
    
export default {
  data() {
    return {
      // Current transform x and y.
      xPum: this.position ? this.lastX : this.defaultPosition.x,
      yPum: this.position ? this.lastY : this.defaultPosition.y,
      
      lastX:'',
      lastY:'',

      dragging: false,
      slackX: 0,
      slackY: 0,
      eventsFor: {
        touch: {
          start: 'touchstart',
          move: 'touchmove',
          stop: 'touchend'
        },
        mouse: {
          start: 'mousedown',
          move: 'mousemove',
          stop: 'mouseup'
        }
      },

    };
  },
  props: {
    // 拖拽边界
    bounds: Object,
    // 初始位置
    defaultPosition: {
      type: Object,
      default: () => {
        return {
          x: 0,
          y: 0,
        }
      },
    },
    // defines the current position of the element
    position: { 
      type: Object,
      default: () => {
        return null;   
      }
    },
  },
  mmounted(){
    this.dragEventFor = this.eventsFor.mouse;
  },
  beforeDestroyed() {
    this.dragging = false;
  },
  beforeUpdate(){

  },
  methods: {
    getControlPosition(e, touchIdentifier, draggableCore) {
      const touchObj =
        typeof touchIdentifier === 'number' ? getTouch(e, touchIdentifier) : null;

      // if (typeof touchIdentifier === 'number' && !touchObj) return null; // not the right touch
      const node = draggableCore.$el;
      // User can provide an offsetParent if desired.
      const offsetParent = node.offsetParent || node.ownerDocument.body;

      return this.offsetXYFromParent(touchObj || e, offsetParent);
    },

    offsetXYFromParent(evt, offsetParent) {
      const isBody = offsetParent === offsetParent.ownerDocument.body;
      const offsetParentRect = isBody ? { left: 0, top: 0 } : offsetParent.getBoundingClientRect();
      const x = evt.clientX + offsetParent.scrollLeft - offsetParentRect.left;
      const y = evt.clientY + offsetParent.scrollTop - offsetParentRect.top;

      return { x, y };
    },

    getBoundPosition(draggable, x, y) {
      // If no bounds, short-circuit and move on
      if (!draggable.bounds) return [x, y];

      // Clone new bounds
      const { bounds } = draggable;

      if (isNum(bounds.right)) x = Math.min(x, bounds.right);
      if (isNum(bounds.bottom)) y = Math.min(y, bounds.bottom);

      // But above left and top limits.
      if (isNum(bounds.left)) x = Math.max(x, bounds.left);
      if (isNum(bounds.top)) y = Math.max(y, bounds.top);

      return [x, y];
    },

    touchstart(e) {
      this.dragEventFor = this.eventsFor.touch;
      return this.handleDragStart(e);
    },
    touchend(e) {
      this.dragEventFor = this.eventsFor.touch;
      return this.handleDragStop(e);
    },
    onMouseDown(e) {
      this.dragEventFor = this.eventsFor.mouse;
      return this.handleDragStart(e);
    },
    onMouseUp(e) {
      this.dragEventFor = this.eventsFor.mouse;
      return this.handleDragStop(e);
    },

    handleDragStart(e) {

      // Only accept left-clicks.
      if (typeof e.button === 'number' && e.button !== 0) return false;

      e.preventDefault();
      // Get nodes. Be sure to grab relative document (could be iframed)
      const thisNode = this.$el;
      if (!thisNode || !thisNode.ownerDocument || !thisNode.ownerDocument.body) {
        throw new Error('<SealDrag> not mounted on TouchStart!');
      }

      // Set touch identifier in component state if this is a touch event. This allows us to
      // distinguish between individual touches on multitouch screens by identifying which
      // touchpoint was set to this element.
      const touchIdentifier = getTouchIdentifier(e);
      this.touchIdentifier = touchIdentifier;

      // Get the current drag point from the event. This is used as the offset.
      const position = this.getControlPosition(e, touchIdentifier, this);
      if (position == null) return; // not possible but satisfies flow
      const { x, y } = position;

      this.$emit('onUserDragStart', {node: e.target, x: position.x, y:position.y});
      this.dragging = true;
      this.lastX = x;
      this.lastY = y;

      const {ownerDocument} = thisNode;
      addEvent(ownerDocument, this.dragEventFor.move, this.handleDrag);
      addEvent(ownerDocument, this.dragEventFor.stop, this.handleDragStop);
    },

    handleDrag(event) {
      // 防止印章滑动页面也滑动
      if (event.type === 'touchmove') event.preventDefault();

      if (!this.dragging) return false;

      const position = this.getControlPosition(event, this.touchIdentifier, this);
      if (position == null) return;
      const { x, y } = position;

      const deltaX = x - this.lastX;
      const deltaY = y - this.lastY;

      this.lastX = x;
      this.lastY = y;

      const newState = {
        x: this.xPum + deltaX,
        y: this.yPum + deltaY,
      };

      if (this.bounds) {
        const { x, y } = newState;

        newState.x += this.slackX;
        newState.y += this.slackY;

        // Get bound position. This will ceil/floor the x and y within the boundaries.
        const [newStateX, newStateY] = this.getBoundPosition(this, newState.x, newState.y);
        newState.x = newStateX;
        newState.y = newStateY;

        // Recalculate slack by noting how much was shaved by the boundPosition handler.
        newState.slackX = this.slackX + (x - newState.x);
        newState.slackY = this.slackY + (y - newState.y);
      }

      this.xPum = newState.x;
      this.yPum = newState.y;
      this.slackX = newState.slackX;
      this.slackY = newState.slackY;
      return true;
    },

    handleDragStop(e) {
      if (!this.dragging) return;
      this.dragging = false;
      this.lastX = NaN;
      this.lastY = NaN;
      this.$emit('onUserDragEnd', { node: e.target, x: this.xPum, y: this.yPum });
      if (this.$el) {
        removeEvent(this.$el.ownerDocument, this.dragEventFor.move, this.handleDrag);
        removeEvent(this.$el.ownerDocument, this.dragEventFor.stop, this.handleDragStop);
      }
    },
  },
};
</script>
