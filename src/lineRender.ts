import * as colorUtil from './colorUtil';
import { History } from './historyManager';
export enum PenStyle {
  Pencil,
  Eraser
}

export class LineRender {
  private canvas_: HTMLCanvasElement;
  private ctx_: CanvasRenderingContext2D;
  private isDrawing_: boolean = false;
  private mode_: PenStyle = PenStyle.Pencil;
  private pre_: { x: number; y: number } = { x: 0, y: 0 };
  private color_: colorUtil.HSV | colorUtil.RGB = new colorUtil.HSV(0, 0, 0);
  private lineWidth_: number = 1;
  private layerNum_: number = 0;
  private history_: History = {
    path: [],
    mode: this.mode_,
    color: this.color_,
    lineWidth: this.lineWidth_,
    snapshot: null,
    layerNum: this.layerNum_
  };

  constructor(
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D,
    layerNum: number
  ) {
    this.canvas_ = canvas;
    this.ctx_ = ctx;
    this.layerNum_ = layerNum;
  }

  public selectLayer(
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D,
    layerNum: number
  ) {
    this.canvas_ = canvas;
    this.ctx_ = ctx;
    this.layerNum_ = layerNum;
  }

  public changeMode(mode: PenStyle | string) {
    const tmp: PenStyle | undefined = (PenStyle as any)[mode];
    if (tmp !== undefined) {
      this.mode_ = tmp;
    }
  }

  public setWidth(width: number) {
    this.ctx_.lineWidth = this.lineWidth_ = width;
  }

  public start(
    pos: { x: number; y: number },
    color: colorUtil.HSV | colorUtil.RGB = new colorUtil.HSV(0, 0, 0)
  ) {
    this.ctx_.lineCap = 'round';
    this.ctx_.lineJoin = 'round';
    this.isDrawing_ = true;
    this.pre_ = pos;
    this.color_ = color;
    this.ctx_.strokeStyle = color.toString();

    this.history_.path.push(pos);
    this.history_.color = color;
    this.history_.mode = this.mode_;
    this.history_.snapshot = this.ctx_.getImageData(
      0,
      0,
      this.canvas_.width,
      this.canvas_.height
    );
    this.history_.lineWidth = this.lineWidth_;
    this.history_.layerNum = this.layerNum_;
  }

  public update(pos: { x: number; y: number }) {
    if (!this.isDrawing_) return;

    switch (this.mode_) {
      case PenStyle.Pencil:
        this.ctx_.globalCompositeOperation = 'source-over';
        break;
      case PenStyle.Eraser:
        this.ctx_.globalCompositeOperation = 'destination-out';
        break;
      default:
        this.ctx_.globalCompositeOperation = 'source-over';
        break;
    }

    this.ctx_.beginPath();
    this.ctx_.moveTo(this.pre_.x, this.pre_.y);
    this.ctx_.lineTo(pos.x, pos.y);
    this.ctx_.stroke();
    this.pre_ = pos;
    this.history_.path.push(pos);
  }

  public end(): History | null {
    let ret = null;
    if (this.isDrawing_) {
      this.isDrawing_ = false;
      ret = { ...this.history_ };
      this.history_.path = [];
    }
    return ret;
  }

  public undo(hist: History) {
    if (hist.snapshot) {
      this.ctx_.clearRect(0, 0, this.canvas_.width, this.canvas_.height);
      this.ctx_.putImageData(<ImageData>hist.snapshot, 0, 0);
    }

    this.drawLineByHistory(hist);
  }

  public redo(hist: History) {
    this.drawLineByHistory(hist);
  }

  private drawLineByHistory(hist: History) {
    switch (hist.mode) {
      case PenStyle.Pencil:
        this.ctx_.globalCompositeOperation = 'source-over';
        break;
      case PenStyle.Eraser:
        this.ctx_.globalCompositeOperation = 'destination-out';
        break;
      default:
        this.ctx_.globalCompositeOperation = 'source-over';
        break;
    }
    this.ctx_.strokeStyle = hist.color.toString();
    this.ctx_.lineWidth = hist.lineWidth;
    this.ctx_.lineCap = 'round';
    this.ctx_.lineJoin = 'round';

    this.ctx_.beginPath();
    for (let i = 0; i < hist.path.length - 1; i++) {
      this.ctx_.moveTo(hist.path[i].x, hist.path[i].y);
      this.ctx_.lineTo(hist.path[i + 1].x, hist.path[i + 1].y);
    }
    this.ctx_.stroke();
  }
}
