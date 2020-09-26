import { PenInterface } from './penInterface';
import { LineHistory } from './historyTypes';
import { HSV } from './colorUtil';

export default class PencilRender implements PenInterface {
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
      mode: 'Pencil',
      color: new HSV(0, 0, 0),
      lineWidth: 1,
      snapshot: null,
      layerNum: 0,
    },
  };

  private ctx: CanvasRenderingContext2D | null = null;

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
    this.pre = { ...info, width: history.info.lineWidth };
    this.ctx.strokeStyle = history.info.color.toString();
    this.ctx.lineWidth = PencilRender.getWidth(
      history.info.lineWidth,
      info.pressure
    );

    this.history.info.path.push(info);
    this.history.info.mode = 'Pencil';
    this.history.info.snapshot = this.ctx.getImageData(
      0,
      0,
      canvas.width,
      canvas.height
    );
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

  update(info: { x: number; y: number; pressure: number }): void {
    if (!this.isDrawing || !this.ctx) return;
    this.ctx.lineWidth = PencilRender.getWidth(this.pre.width, info.pressure);
    this.ctx.beginPath();
    this.ctx.moveTo(this.pre.x, this.pre.y);
    this.ctx.lineTo(info.x, info.y);
    this.ctx.stroke();
    this.pre = { ...info, width: this.pre.width };
    this.history.info.path.push(info);
  }

  // eslint-disable-next-line class-methods-use-this
  drawByHistory(hist: LineHistory, ctx: CanvasRenderingContext2D): void {
    ctx.globalCompositeOperation = 'source-over';
    ctx.strokeStyle = hist.info.color.toString();
    ctx.lineWidth = hist.info.lineWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    for (let i = 0; i < hist.info.path.length - 1; i += 1) {
      ctx.beginPath();
      ctx.lineWidth = PencilRender.getWidth(
        hist.info.lineWidth,
        hist.info.path[i].pressure
      );
      ctx.moveTo(hist.info.path[i].x, hist.info.path[i].y);
      ctx.lineTo(hist.info.path[i + 1].x, hist.info.path[i + 1].y);
      ctx.stroke();
    }
  }

  static getWidth(width: number, pressure: number): number {
    return width * pressure;
  }
}
