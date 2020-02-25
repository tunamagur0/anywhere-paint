import * as colorUtil from './colorUtil';
import { HistoryManager, History } from './historyManager';
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
  private historyManager_: HistoryManager = new HistoryManager();
  private lineWidth_: number = 1;
  private history_: History = {
    path: [],
    mode: this.mode_,
    color: this.color_,
    lineWidth: this.lineWidth_,
    snapshot: null
  };

  constructor(canvas: HTMLCanvasElement) {
    this.canvas_ = canvas;
    this.ctx_ = <CanvasRenderingContext2D>canvas.getContext('2d');
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

  public end() {
    if (this.isDrawing_) {
      this.isDrawing_ = false;
      this.historyManager_.do(this.history_);
      this.history_.path = [];
    }
  }

  public undo() {
    const hist: Array<History> | null = this.historyManager_.undo();
    if (hist) {
      this.ctx_.clearRect(0, 0, this.canvas_.width, this.canvas_.height);
      this.ctx_.putImageData(<ImageData>hist[0].snapshot, 0, 0);

      for (const h of hist) {
        this.drawLineByHistory(h);
      }
    }
  }

  public redo() {
    const hist: History | null = this.historyManager_.redo();
    if (hist) {
      this.drawLineByHistory(hist);
    }
  }

  public drawLineByHistory(hist: History) {
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
