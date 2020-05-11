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

  private fillDiff = 10;

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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
    this.bfs(this.history.info.snapshot, { x: info.x, y: info.y });
    this.drawByHistory(this.history, ctx);
  }

  undo(
    hist: LineHistory,
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement
  ): void {
    if (hist.info.snapshot) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.putImageData(hist.info.snapshot as ImageData, 0, 0);
    }

    this.drawByHistory(hist, ctx);
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  update(info: { x: number; y: number; pressure: number }): void {}

  // eslint-disable-next-line class-methods-use-this
  drawByHistory(hist: LineHistory, ctx: CanvasRenderingContext2D): void {
    if (this.width === -1 || this.height === -1) {
      throw new Error('cannot call drawByHistory before start called');
    }

    const img = ctx.getImageData(0, 0, this.width, this.height);
    let color: RGB;
    if (hist.info.color instanceof HSV) {
      color = hsv2rgb(hist.info.color);
    } else {
      color = hist.info.color;
    }

    for (const path of hist.info.path) {
      const index = (path.x + path.y * this.width) * 4;
      img.data[index] = color.r;
      img.data[index + 1] = color.g;
      img.data[index + 2] = color.b;
      img.data[index + 3] = 255;
    }
    ctx.putImageData(img, 0, 0);
  }

  static getWidth(width: number, pressure: number): number {
    return width * pressure;
  }

  private bfs(imgData: ImageData, point: { x: number; y: number }): void {
    const queue: { x: number; y: number }[] = [];
    const { width, height } = imgData;
    const index: number = (point.x + point.y * width) * 4;
    const color: RGB = new RGB(
      imgData.data[index],
      imgData.data[index + 1],
      imgData.data[index + 2]
    );
    const dxdy: [number, number][] = [
      [-1, 0],
      [0, -1],
      [1, 0],
      [0, 1],
    ];
    const isVisited: boolean[][] = new Array(width);
    for (let w = 0; w < width; w += 1) {
      isVisited[w] = new Array(height).fill(false);
    }

    const colorabs = (a: RGB, b: RGB): number =>
      Math.sqrt((a.r - b.r) ** 2 + (a.g - b.g) ** 2 + (a.b - b.b) ** 2);
    queue.unshift(point);
    while (queue.length !== 0) {
      const top = queue[queue.length - 1];
      queue.pop();
      const r = imgData.data[(top.x + top.y * width) * 4];
      const g = imgData.data[(top.x + top.y * width) * 4 + 1];
      const b = imgData.data[(top.x + top.y * width) * 4 + 2];

      this.history.info.path.push({
        ...top,
        pressure: 1,
      });
      // if pixel color is white
      if (colorabs(color, new RGB(r, g, b)) < this.fillDiff) {
        for (const d of dxdy) {
          const nx = top.x + d[0];
          const ny = top.y + d[1];
          if (
            nx >= 0 &&
            nx < width &&
            ny >= 0 &&
            ny < height &&
            !isVisited[nx][ny]
          ) {
            isVisited[nx][ny] = true;
            queue.unshift({
              x: nx,
              y: ny,
            });
          }
        }
      }
    }
  }
}
