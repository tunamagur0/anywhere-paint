import * as colorUtil from './colorUtil';
import { LineHistory } from './historyTypes';

export type PenStyle = 'Pencil' | 'Eraser';

export class LineRender {
  private canvas: HTMLCanvasElement;

  private ctx: CanvasRenderingContext2D;

  private isDrawing = false;

  private mode: PenStyle = 'Pencil';

  private pre: { x: number; y: number } = { x: 0, y: 0 };

  private color: colorUtil.HSV | colorUtil.RGB = new colorUtil.HSV(0, 0, 0);

  private lineWidth = 1;

  private layerNum = 0;

  private history: LineHistory = {
    target: 'LINE_HISTORY',
    info: {
      path: [],
      mode: this.mode,
      color: this.color,
      lineWidth: this.lineWidth,
      snapshot: null,
      layerNum: this.layerNum,
    },
  };

  constructor(
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D,
    layerNum: number
  ) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.layerNum = layerNum;
  }

  public selectLayer(
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D,
    layerNum: number
  ): void {
    this.canvas = canvas;
    this.ctx = ctx;
    this.layerNum = layerNum;
  }

  public changeMode(mode: PenStyle): void {
    const tmp: PenStyle = mode;
    this.mode = tmp;
  }

  public setWidth(width: number): void {
    this.ctx.lineWidth = width;
    this.lineWidth = width;
  }

  public start(
    pos: { x: number; y: number },
    color: colorUtil.HSV | colorUtil.RGB = new colorUtil.HSV(0, 0, 0)
  ): void {
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';
    this.isDrawing = true;
    this.pre = pos;
    this.color = color;
    this.ctx.strokeStyle = color.toString();
    this.ctx.lineWidth = this.lineWidth;

    this.history.info.path.push(pos);
    this.history.info.color = color;
    this.history.info.mode = this.mode;
    this.history.info.snapshot = this.ctx.getImageData(
      0,
      0,
      this.canvas.width,
      this.canvas.height
    );
    this.history.info.lineWidth = this.lineWidth;
    this.history.info.layerNum = this.layerNum;
  }

  public update(pos: { x: number; y: number }): void {
    if (!this.isDrawing) return;

    switch (this.mode) {
      case 'Pencil':
        this.ctx.globalCompositeOperation = 'source-over';
        break;
      case 'Eraser':
        this.ctx.globalCompositeOperation = 'destination-out';
        break;
      default:
        this.ctx.globalCompositeOperation = 'source-over';
        break;
    }

    this.ctx.beginPath();
    this.ctx.moveTo(this.pre.x, this.pre.y);
    this.ctx.lineTo(pos.x, pos.y);
    this.ctx.stroke();
    this.pre = pos;
    this.history.info.path.push(pos);
  }

  public end(): LineHistory | null {
    let ret = null;
    if (this.isDrawing) {
      this.isDrawing = false;
      ret = { ...this.history };
      ret.info = { ...this.history.info };
      this.history.info.path = [];
    }
    return ret;
  }

  public undo(hist: LineHistory): void {
    if (hist.info.snapshot) {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.ctx.putImageData(hist.info.snapshot as ImageData, 0, 0);
    }

    this.drawLineByHistory(hist);
  }

  public redo(hist: LineHistory): void {
    this.drawLineByHistory(hist);
  }

  private drawLineByHistory(hist: LineHistory): void {
    switch (hist.info.mode) {
      case 'Pencil':
        this.ctx.globalCompositeOperation = 'source-over';
        break;
      case 'Eraser':
        this.ctx.globalCompositeOperation = 'destination-out';
        break;
      default:
        this.ctx.globalCompositeOperation = 'source-over';
        break;
    }
    this.ctx.strokeStyle = hist.info.color.toString();
    this.ctx.lineWidth = hist.info.lineWidth;
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';

    this.ctx.beginPath();
    for (let i = 0; i < hist.info.path.length - 1; i += 1) {
      this.ctx.moveTo(hist.info.path[i].x, hist.info.path[i].y);
      this.ctx.lineTo(hist.info.path[i + 1].x, hist.info.path[i + 1].y);
    }
    this.ctx.stroke();
  }
}
