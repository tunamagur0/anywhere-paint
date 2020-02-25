export default class LayerManager {
  private layers_: Map<number, HTMLCanvasElement> = new Map<
    number,
    HTMLCanvasElement
  >();
  private ctxs_: Map<number, CanvasRenderingContext2D> = new Map<
    number,
    CanvasRenderingContext2D
  >();
  private layerNum2layerName: Map<number, string> = new Map<number, string>();
  private div_: HTMLDivElement;
  private width_: number;
  private height_: number;
  private cnt_: number = -1;
  constructor(div: HTMLDivElement, width: number, height: number) {
    this.div_ = div;
    this.width_ = width;
    this.height_ = height;
  }

  public addLayer(): {
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
  } {
    this.cnt_++;
    const layerName = `layer${this.cnt_}`;
    this.layerNum2layerName.set(this.cnt_, layerName);
    const canvas = document.createElement('canvas');
    canvas.width = this.width_;
    canvas.height = this.height_;
    canvas.style.position = 'absolute';
    this.div_.appendChild(canvas);
    this.layers_.set(this.cnt_, canvas);
    const ctx = <CanvasRenderingContext2D>canvas.getContext('2d');
    this.ctxs_.set(this.cnt_, ctx);
    return { canvas: canvas, ctx: ctx };
  }

  //returns maximum layerNum
  public removeLayer(layerNum: number): number | null {
    const canvas: HTMLCanvasElement | undefined = this.layers_.get(layerNum);
    if (canvas) {
      canvas.remove();
    }
    this.layers_.delete(layerNum);
    this.ctxs_.delete(layerNum);
    this.layerNum2layerName.delete(layerNum);

    if (this.layers_.size === 0) return null;

    let ret = -1;
    for (const k of this.layers_.keys()) {
      ret = Math.max(k, ret);
    }
    return ret;
  }

  public renameLayer(layerNum: number, layerName: string) {
    if (this.layerNum2layerName.has(layerNum)) {
      this.layerNum2layerName.set(layerNum, layerName);
    }
  }

  public getLayers(): {
    canvas: Map<Number, HTMLCanvasElement>;
    ctx: Map<Number, CanvasRenderingContext2D>;
  } {
    return { canvas: this.layers_, ctx: this.ctxs_ };
  }
}
