import * as colorUtil from './colorUtil';
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
  private lineWidth_: number = 1;

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
    this.ctx_.strokeStyle = color.toString();
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
  }

  public end() {
    this.isDrawing_ = false;
  }
}
