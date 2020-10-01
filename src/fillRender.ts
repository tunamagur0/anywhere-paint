/* eslint-disable no-param-reassign */
/* eslint-disable class-methods-use-this */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { PenInterface } from './penInterface';
import { LineHistory } from './historyTypes';
import { HSV, RGB, hsv2rgb } from './colorUtil';

export default class FillRender implements PenInterface {
  private pre: { x: number; y: number; pressure: number; width: number } = {
    x: 0,
    y: 0,
    pressure: 1,
    width: 1,
  };

  private history: LineHistory = {
    target: 'LINE_HISTORY',
    info: {
      path: [],
      mode: 'Fill',
      color: new HSV(0, 0, 0),
      lineWidth: 1,
      snapshot: null,
      layerNum: 0,
    },
  };

  private ctx: CanvasRenderingContext2D | null = null;

  private width = -1;

  private height = -1;

  private isDrawing = false;

  end(): LineHistory | null {
    let ret = null;
    if (this.isDrawing) {
      this.isDrawing = false;
      ret = { ...this.history };
      ret.info = { ...this.history.info };
      this.history.info.path = [];
    }
    return ret;
  }

  redo(
    hist: LineHistory,
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement
  ): void {
    this.drawByHistory(hist, ctx);
  }

  start(
    info: { x: number; y: number; pressure: number },
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D,
    history: LineHistory
  ): void {
    this.history = history;
    this.ctx = ctx;
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';
    this.ctx.globalCompositeOperation = 'source-over';
    this.isDrawing = true;

    this.history.info.mode = 'Fill';
    this.history.info.lineWidth = 1;
    this.history.info.snapshot = this.ctx.getImageData(
      0,
      0,
      canvas.width,
      canvas.height
    );
    this.width = canvas.width;
    this.height = canvas.height;
    this.drawByHistory(history, ctx);
  }

  undo(
    hist: LineHistory,
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement
  ): void {
    if (hist.info.snapshot) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.putImageData(hist.info.snapshot as ImageData, 0, 0);
      return;
    }

    this.drawByHistory(hist, ctx);
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  update(info: { x: number; y: number; pressure: number }): void {}

  drawByHistory(hist: LineHistory, ctx: CanvasRenderingContext2D): void {
    const { width, height } = ctx.canvas;
    const imgData = ctx.getImageData(0, 0, width, height);
    this.seedFill(imgData, hist.info.path[0], hist.info.color);
    ctx.putImageData(imgData, 0, 0);
  }

  private seedFill(
    imgData: ImageData,
    point: { x: number; y: number },
    _targetColor: HSV | RGB
  ): void {
    const stack: { x: number; y: number; dy: number }[] = [];
    const { width, height } = imgData;
    const index: number = (point.x + point.y * width) * 4;
    const targetColor: RGB =
      _targetColor instanceof RGB ? _targetColor : hsv2rgb(_targetColor);
    const color: RGB = new RGB(
      imgData.data[index],
      imgData.data[index + 1],
      imgData.data[index + 2]
    );

    stack.unshift({ ...point, dy: 0 });
    while (stack.length !== 0) {
      const top = stack[0];
      stack.shift();
      // eslint-disable-next-line no-continue
      if (this.isSameColor(targetColor, top, imgData)) continue;
      let lx = top.x;
      let rx = top.x;
      while (lx >= 0) {
        if (!this.isSameColor(color, { x: lx, y: top.y }, imgData)) {
          lx += 1;
          break;
        }
        lx -= 1;
      }
      lx = Math.max(0, lx);
      while (rx < width) {
        if (!this.isSameColor(color, { x: rx, y: top.y }, imgData)) {
          rx -= 1;
          break;
        }
        rx += 1;
      }
      rx = Math.min(width - 1, rx);

      // fill line
      for (let i = lx - 1; i <= rx + 1; i += 1) {
        const pIndex = (i + top.y * width) * 4;
        imgData.data[pIndex] = targetColor.r;
        imgData.data[pIndex + 1] = targetColor.g;
        imgData.data[pIndex + 2] = targetColor.b;
        imgData.data[pIndex + 3] = 255;
      }

      // scan next line
      if (top.dy >= 0 && top.y < height - 1) {
        this.scanLine(imgData, stack, lx, rx, top.y + 1, 0, color);
      }
      if (top.dy <= 0 && top.y > 0) {
        this.scanLine(imgData, stack, lx, rx, top.y - 1, 0, color);
      }
    }
  }

  private scanLine(
    imgData: ImageData,
    stack: { x: number; y: number; dy: number }[],
    lx: number,
    rx: number,
    y: number,
    dy: number,
    color: RGB
  ): void {
    let isIn = this.isSameColor(color, { x: lx, y }, imgData);
    for (let i = lx + 1; i < rx; i += 1) {
      if (isIn && !this.isSameColor(color, { x: i, y }, imgData)) {
        stack.unshift({ x: i - 1, y, dy });
        isIn = false;
      } else if (!isIn && this.isSameColor(color, { x: i, y }, imgData)) {
        isIn = true;
      }
    }
    if (isIn) {
      stack.unshift({ x: rx - 1, y, dy });
    }
  }

  private isSameColor(
    color: RGB,
    point: { x: number; y: number },
    imgData: ImageData
  ): boolean {
    const index = (point.x + point.y * imgData.width) * 4;
    const r = imgData.data[index];
    const g = imgData.data[index + 1];
    const b = imgData.data[index + 2];
    const color2 = new RGB(r, g, b);
    return color.r === color2.r && color.g === color2.g && color.b === color2.b;
  }
}
