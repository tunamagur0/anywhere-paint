import LayerManager from './layerManager';
import { History, HistoryManager } from './historyManager';
import { LineRender, PenStyle } from './lineRender';
import { HSV, RGB } from './colorUtil';

export default class CanvasManager {
  private div_: HTMLDivElement;
  private width_: number;
  private height_: number;
  private layerManager_: LayerManager;
  private historyManager_: HistoryManager;
  private lineRender_: LineRender;
  private color_: HSV | RGB = new HSV(0, 0, 0);

  constructor(div: HTMLDivElement, width: number, height: number) {
    this.div_ = div;
    this.width_ = width;
    this.height_ = height;
    this.historyManager_ = new HistoryManager();
    this.layerManager_ = new LayerManager(this.div_, this.width_, this.height_);
    this.addLayer();
    this.addLayer();

    const layers = this.layerManager_.getLayers();
    const canvas = <HTMLCanvasElement>layers.canvas.get(0);
    const ctx = <CanvasRenderingContext2D>layers.ctx.get(0);
    this.lineRender_ = new LineRender(canvas, ctx, 0);
    this.selectLayer(0);
  }

  public setLineWidth(width: number) {
    this.lineRender_.setWidth(width);
  }

  public changeMode(mode: PenStyle | string) {
    this.lineRender_.changeMode(mode);
  }

  public selectLayer(layerNum: number) {
    const layers = this.layerManager_.getLayers();
    const canvas = layers.canvas.get(layerNum);
    const ctx = layers.ctx.get(layerNum);

    if (canvas && ctx) {
      this.lineRender_.selectLayer(canvas, ctx, layerNum);
      this.setEvent(canvas);
    }
  }

  private setEvent(canvas: HTMLCanvasElement) {
    canvas.onmousedown = (e: MouseEvent) => {
      const rect: DOMRect = canvas.getBoundingClientRect();
      const x: number = e.pageX - rect.left;
      const y: number = e.pageY - rect.top;
      this.lineRender_.start({ x: x, y: y }, this.color_);
    };
    window.onmouseup = (e: MouseEvent) => {
      const hist = this.lineRender_.end();
      if (hist) this.historyManager_.do(hist);
    };
    window.onmousemove = (e: MouseEvent) => {
      const rect: DOMRect = canvas.getBoundingClientRect();
      const x: number = e.pageX - rect.left;
      const y: number = e.pageY - rect.top;
      this.lineRender_.update({ x: x, y: y });
    };
  }

  public addLayer() {
    const { canvas, ctx } = this.layerManager_.addLayer();
    this.setEvent(canvas);
  }

  public removeLayer(layerNum: number) {
    this.historyManager_.removeLayer(layerNum);
    const num: number | null = this.layerManager_.removeLayer(layerNum);
    if (num !== null) {
      this.selectLayer(num);
    }
  }

  public undo() {
    const hist: Array<History> | null = this.historyManager_.undo();
    if (hist) {
      const layers: {
        canvas: Map<Number, HTMLCanvasElement>;
        ctx: Map<Number, CanvasRenderingContext2D>;
      } = this.layerManager_.getLayers();
      for (const h of hist) {
        const layerNum = h.layerNum;
        const canvas = layers.canvas.get(layerNum);
        const ctx = layers.ctx.get(layerNum);

        if (canvas && ctx) {
          this.lineRender_.selectLayer(canvas, ctx, layerNum);
          this.lineRender_.undo(h);
        }
      }
    }
  }

  public redo() {
    const hist: History | null = this.historyManager_.redo();
    if (hist) {
      const layers = this.layerManager_.getLayers();
      const layerNum = hist.layerNum;
      const canvas = layers.canvas.get(layerNum);
      const ctx = layers.ctx.get(layerNum);

      if (canvas && ctx) {
        this.lineRender_.selectLayer(canvas, ctx, layerNum);
        this.lineRender_.redo(hist);
      }
    }
  }

  public setColor(color: HSV | RGB) {
    this.color_ = color;
  }

  public renameLayer(layerNum: number, layerName: string) {
    this.layerManager_.renameLayer(layerNum, layerName);
  }
}
