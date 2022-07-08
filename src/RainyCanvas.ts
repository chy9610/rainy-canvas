import { createImageElement, getCtx } from "./helpers/element";
import { RainyOptions } from "./type";

class RainyCanvas {
  img!: HTMLImageElement;
  backgroundCanvas!: HTMLCanvasElement;
  glassCanvas!: HTMLCanvasElement;
  reflection!: HTMLCanvasElement;

  constructor(
    public targetEl: HTMLElement,
    public url: string,
    private options: RainyOptions = { baseZIndex: 10, minification: 0.2, blurLength: 4, maxDropRadian: 10 }
  ) {
    this.prepare();
  }

  async prepare(): Promise<void> {
    // 格式化样式
    this.formatTargetElStyle();
    // 创建图片节点
    this.img = await createImageElement(this.url);
    // 创建背景画布
    this.backgroundCanvas = this.createBackgroundCanvas();
  }

  // 格式化样式
  formatTargetElStyle() {
    const computedStyle = window.getComputedStyle(this.targetEl);
    if (!["relative", "fixed"].includes(computedStyle.position)) {
      console.warn("target element should be  relative or fixed...");
      this.targetEl.style.position = "relative";
    }
  }

  // 创建完整 canvas 节点
  createFullFilledCanvas() {
    const { clientHeight, clientWidth } = this.targetEl;
    const width = this.options.width ?? clientWidth;
    const height = this.options.height ?? clientHeight;
    const canvasEl = document.createElement("canvas");
    canvasEl.width = width;
    canvasEl.height = height;
    canvasEl.style.position = "relative";
    canvasEl.style.top = "0";
    canvasEl.style.left = "0";
    return canvasEl;
  }

  // 创建背景层 canvas 节点
  createBackgroundCanvas() {
    const canvasEl = this.createFullFilledCanvas();
    canvasEl.style.zIndex = String(this.options.baseZIndex);
    const ctx = getCtx(canvasEl);
    ctx.filter = `blur(${this.options.blurLength}px)`;
    return canvasEl;
  }

  // 创建玻璃层 canvas
  createGlassCanvas() {
    const canvasEl = this.createFullFilledCanvas();
    canvasEl.style.zIndex = String(this.options.baseZIndex + 1);
    return canvasEl;
  }

  // 添加背景层 canvas 至目标节点
  appendBackgroundCanvas() {
    this.targetEl.appendChild(this.backgroundCanvas);
  }

  // 添加玻璃层 canvas 至目标节点
  appendGlassCanvas() {
    this.targetEl.appendChild(this.glassCanvas);
  }

  // 描绘背景层 canvas（铺图片）
  drawBackgroundCanvas() {
    const ctx = getCtx(this.backgroundCanvas);
    ctx.drawImage(this.img, 0, 0, this.backgroundCanvas.width, this.backgroundCanvas.height);
  }

  // 创建雨点
  createReflection() {
    const canvas = document.createElement("canvas");
    const ctx = getCtx(canvas);
    canvas.width = this.backgroundCanvas.width * this.options.minification;
    canvas.height = this.backgroundCanvas.height * this.options.minification;
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate(Math.PI);
    ctx.drawImage(this.img, -canvas.width / 2, -canvas.height / 2, canvas.width, canvas.height);
    return canvas;
  }

  // 雨点运动
  createDropKeeper() {}
}

export { RainyCanvas };
