import LayerManager from './layerManager';
import HistoryManager from './historyManager';
import { LineRender, PenStyle } from './lineRender';
import { HSV, RGB } from './colorUtil';
import { LayerHistory, LineHistory, History } from './historyTypes';

export default class CanvasManager {
  private div: HTMLDivElement;

  private width: number;

  private height: number;

  private layerManager: LayerManager;

  private historyManager: HistoryManager;

  private lineRender: LineRender;

  private color: HSV | RGB = new HSV(0, 0, 0);

  private pSelectingLayer = 0;

  constructor(div: HTMLDivElement, width: number, height: number) {
    this.div = document.createElement('div');
    this.div.style.width = '100%';
    this.div.style.height = '100%';
    this.div.style.position = 'relative';
    this.div.style.overflow = 'hidden';
    div.appendChild(this.div);
    this.width = width;
    this.height = height;
    this.historyManager = new HistoryManager();
    this.layerManager = new LayerManager(this.div, this.width, this.height);
    this.addLayer();
    this.historyManager.reset();

    const layers = this.layerManager.getLayers();
    const canvas = layers.canvas.get(0) as HTMLCanvasElement;
    const ctx = layers.ctx.get(0) as CanvasRenderingContext2D;
    this.lineRender = new LineRender(canvas, ctx, 0);
    this.selectLayer(0);
  }

  public setLineWidth(width: number): void {
    this.lineRender.setWidth(width);
  }

  public changeMode(mode: PenStyle): void {
    this.lineRender.changeMode(mode);
  }

  public selectLayer(layerNum: number): void {
    const layers = this.layerManager.getLayers();
    const canvas = layers.canvas.get(layerNum);
    const ctx = layers.ctx.get(layerNum);
    if (canvas && ctx) {
      this.lineRender.selectLayer(canvas, ctx, layerNum);
      this.pSelectingLayer = layerNum;
      this.setEvent(canvas);
    }
  }

  public get selectingLayer(): number {
    return this.pSelectingLayer;
  }

  private setEvent(canvas_: HTMLCanvasElement): void {
    const canvas = canvas_;
    canvas.onmousedown = (e: MouseEvent): void => {
      const rect: DOMRect = canvas.getBoundingClientRect();
      const x: number = e.clientX - rect.left;
      const y: number = e.clientY - rect.top;
      this.lineRender.start({ x, y }, this.color);
    };
    window.onmouseup = (): void => {
      const hist = this.lineRender.end();
      if (hist) this.historyManager.do(hist);
    };
    window.onmousemove = (e: MouseEvent): void => {
      const rect: DOMRect = canvas.getBoundingClientRect();
      const x: number = e.clientX - rect.left;
      const y: number = e.clientY - rect.top;
      this.lineRender.update({ x, y });
    };
  }

  public addLayer(layerNumber?: number): number {
    const { canvas, layerNum, history } = this.layerManager.addLayer(
      layerNumber
    );
    this.historyManager.do(history);
    this.setEvent(canvas);
    return layerNum;
  }

  // returns layerNum which is automatically selected
  // return -1 when there is no layer
  public removeLayer(layerNum: number): number | null {
    const ret: {
      selectedLayerNum: number;
      history: LayerHistory;
    } | null = this.layerManager.removeLayer(layerNum);
    if (ret === null) {
      return null;
    }

    this.selectLayer(ret.selectedLayerNum);
    this.historyManager.do(ret.history);
    return ret.selectedLayerNum;
  }

  public undo(): void {
    const hist: History[] | null = this.historyManager.undo();
    if (hist) {
      const top: History = hist[0];
      switch (top.target) {
        case 'LINE_HISTORY': {
          const layers: {
            canvas: Map<number, HTMLCanvasElement>;
            ctx: Map<number, CanvasRenderingContext2D>;
          } = this.layerManager.getLayers();
          for (const h of hist) {
            const { layerNum } = h.info;
            const canvas = layers.canvas.get(layerNum);
            const ctx = layers.ctx.get(layerNum);

            if (canvas && ctx) {
              this.lineRender.selectLayer(canvas, ctx, layerNum);
              this.lineRender.undo(h as LineHistory);
            }
          }
          break;
        }

        case 'LAYER_HISTORY': {
          const ret: number | null = this.layerManager.undo(top);
          if (ret !== null) this.selectLayer(ret);

          break;
        }
        default:
          break;
      }
    }
  }

  public redo(): void {
    const hist: History | null = this.historyManager.redo();
    if (hist) {
      switch (hist.target) {
        case 'LINE_HISTORY': {
          const layers = this.layerManager.getLayers();
          const { layerNum } = hist.info;
          const canvas = layers.canvas.get(layerNum);
          const ctx = layers.ctx.get(layerNum);

          if (canvas && ctx) {
            this.lineRender.selectLayer(canvas, ctx, layerNum);
            this.lineRender.redo(hist);
          }
          break;
        }
        case 'LAYER_HISTORY': {
          const ret: number | null = this.layerManager.redo(hist);
          if (ret !== null) this.selectLayer(ret);
          break;
        }
        default:
          break;
      }
    }
  }

  public setColor(color: HSV | RGB): void {
    this.color = color;
  }

  public renameLayer(layerNum: number, layerName: string): void {
    this.layerManager.renameLayer(layerNum, layerName);
  }

  public getLayerImages(): Map<number, string> {
    return this.layerManager.getLayerImages();
  }

  public getSortOrder(): number[] {
    return this.layerManager.getSortOrder();
  }

  public getLayerNames(): Map<number, string> {
    return this.layerManager.getLayerNames();
  }

  public getIntegratedImage(): string {
    return this.layerManager.getImage();
  }

  public clearLayer(layerNum: number): void {
    const hist: LayerHistory | null = this.layerManager.clearLayer(layerNum);
    if (hist) {
      this.historyManager.do(hist);
    }
  }

  public setSortOrder(sortOrder: number[]): boolean {
    const { isValid, hist } = this.layerManager.setSortOrder(
      sortOrder,
      this.selectingLayer
    );
    if (isValid) {
      this.historyManager.do(hist);
    }
    return isValid;
  }
}
