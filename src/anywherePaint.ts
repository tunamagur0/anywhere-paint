import ColorCircle from './colorCircle';
import { HSV, RGB } from './colorUtil';
import { LineRender, PenStyle } from './lineRender';

export default class AnyWherePaint {
  private canvas_: HTMLCanvasElement;
  private colorCircle_: ColorCircle | null = null;
  private lineRender_: LineRender;
  constructor(canvas: HTMLCanvasElement) {
    this.canvas_ = canvas;
    this.lineRender_ = new LineRender(canvas);
    this.start();
  }

  private start() {
    this.canvas_.addEventListener('mousedown', e => {
      const rect: DOMRect = this.canvas_.getBoundingClientRect();
      const x: number = e.pageX - rect.left;
      const y: number = e.pageY - rect.top;
      if (this.colorCircle_) {
        const color: HSV | RGB = this.colorCircle_.getColor(true);
        if (color) {
          this.lineRender_.start({ x: x, y: y }, color);
        }
      } else {
        this.lineRender_.start({ x: x, y: y });
      }
    });
    window.addEventListener('mouseup', e => {
      this.lineRender_.end();
    });
    window.addEventListener('mousemove', e => {
      const rect: DOMRect = this.canvas_.getBoundingClientRect();
      const x: number = e.pageX - rect.left;
      const y: number = e.pageY - rect.top;
      this.lineRender_.update({ x: x, y: y });
    });
  }

  /**
   *
   * @param {number} width line width(px)
   */
  public setLineWidth(width: number) {
    this.lineRender_.setWidth(width);
  }

  public createColorCircle(div: HTMLDivElement) {
    this.colorCircle_ = new ColorCircle(div);
  }

  public changeMode(mode: PenStyle | string) {
    this.lineRender_.changeMode(mode);
  }

  public undo() {
    this.lineRender_.undo();
  }

  public redo() {
    this.lineRender_.redo();
  }
}
