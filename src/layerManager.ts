import { LineRender } from './lineRender';

export default class LayerManager {
  private layers_: Array<HTMLCanvasElement> = [];
  private ctxs_: Array<CanvasRenderingContext2D> = [];
  private div_: HTMLDivElement;
  private width_: number;
  private height_: number;
  constructor(div: HTMLDivElement, width: number, height: number) {
    this.div_ = div;
    this.width_ = width;
    this.height_ = height;
  }

  public addLayer(): {
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
  } {
    const canvas = document.createElement('canvas');
    canvas.width = this.width_;
    canvas.height = this.height_;
    canvas.style.position = 'absolute';
    this.div_.appendChild(canvas);
    this.layers_.push(canvas);
    const ctx = <CanvasRenderingContext2D>canvas.getContext('2d');
    this.ctxs_.push(ctx);
    return { canvas: canvas, ctx: ctx };
  }

  public getLayers(): {
    canvas: Array<HTMLCanvasElement>;
    ctx: Array<CanvasRenderingContext2D>;
  } {
    return { canvas: this.layers_, ctx: this.ctxs_ };
  }
}
