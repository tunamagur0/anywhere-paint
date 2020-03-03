import LayerManager from './layerManager';
import { HistoryManager } from './historyManager';
import { LineRender, PenStyle } from './lineRender';
import { HSV, RGB } from './colorUtil';
import {
  LayerHistory,
  HistoryTypes,
  LineHistory,
  History
} from './historyTypes';

export default class CanvasManager {
  private div_: HTMLDivElement;
  private width_: number;
  private height_: number;
  private layerManager_: LayerManager;
  private historyManager_: HistoryManager;
  private lineRender_: LineRender;
  private color_: HSV | RGB = new HSV(0, 0, 0);
  private selectingLayer_ = 0;

  constructor(div: HTMLDivElement, width: number, height: number) {
    this.div_ = div;
    this.width_ = width;
    this.height_ = height;
    this.historyManager_ = new HistoryManager();
    this.layerManager_ = new LayerManager(this.div_, this.width_, this.height_);
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
      this.selectingLayer_ = layerNum;
      this.setEvent(canvas);
    }
  }

  public get selectingLayer() {
    return this.selectingLayer_;
  }

  private setEvent(canvas: HTMLCanvasElement) {
    canvas.onmousedown = (e: MouseEvent) => {
      const rect: DOMRect = canvas.getBoundingClientRect();
      const x: number = e.clientX - rect.left;
      const y: number = e.clientY - rect.top;
      this.lineRender_.start({ x: x, y: y }, this.color_);
    };
    window.onmouseup = (e: MouseEvent) => {
      const hist = this.lineRender_.end();
      if (hist) this.historyManager_.do(hist);
    };
    window.onmousemove = (e: MouseEvent) => {
      const rect: DOMRect = canvas.getBoundingClientRect();
      const x: number = e.clientX - rect.left;
      const y: number = e.clientY - rect.top;
      this.lineRender_.update({ x: x, y: y });
    };
  }

  public addLayer(): number {
    const { canvas, ctx, layerNum, history } = this.layerManager_.addLayer();
    this.historyManager_.do(history);
    this.setEvent(canvas);
    return layerNum;
  }

  //returns layerNum which is automatically selected
  //return -1 when there is no layer
  public removeLayer(layerNum: number): number | null {
    const ret: {
      selectedLayerNum: number;
      history: LayerHistory;
    } | null = this.layerManager_.removeLayer(layerNum);
    if (ret === null) {
      return null;
    }

    this.selectLayer(ret.selectedLayerNum);
    this.historyManager_.do(ret.history);
    return ret.selectedLayerNum;
  }

  public undo() {
    const hist: History[] | null = this.historyManager_.undo();
    if (hist) {
      const top: History = hist[0];
      switch (top.target) {
        case HistoryTypes.LINE_HISTORY:
          const layers: {
            canvas: Map<Number, HTMLCanvasElement>;
            ctx: Map<Number, CanvasRenderingContext2D>;
          } = this.layerManager_.getLayers();
          for (const h of hist) {
            const layerNum = h.info.layerNum;
            const canvas = layers.canvas.get(layerNum);
            const ctx = layers.ctx.get(layerNum);

            if (canvas && ctx) {
              this.lineRender_.selectLayer(canvas, ctx, layerNum);
              this.lineRender_.undo(<LineHistory>h);
            }
          }
          break;

        case HistoryTypes.LAYER_HISTORY:
          const ret: number | null = this.layerManager_.undo(top);
          if (top.info.command === 'add') {
            this.selectLayer(<number>ret);
          }
          if (top.info.command === 'remove') {
            this.selectLayer(top.info.layerNum);
          }
          break;
        default:
          break;
      }
    }
  }

  public redo() {
    const hist: History | null = this.historyManager_.redo();
    if (hist) {
      const layers = this.layerManager_.getLayers();
      const layerNum = hist.info.layerNum;
      const canvas = layers.canvas.get(layerNum);
      const ctx = layers.ctx.get(layerNum);

      if (canvas && ctx) {
        this.lineRender_.selectLayer(canvas, ctx, layerNum);
        // this.lineRender_.redo(hist);
      }
    }
  }

  public setColor(color: HSV | RGB) {
    this.color_ = color;
  }

  public renameLayer(layerNum: number, layerName: string) {
    this.layerManager_.renameLayer(layerNum, layerName);
  }

  public getLayerImages(): Map<number, string> {
    return this.layerManager_.getLayerImages();
  }

  public getLayerNames(): Map<number, string> {
    return this.layerManager_.getLayerNames();
  }
}
