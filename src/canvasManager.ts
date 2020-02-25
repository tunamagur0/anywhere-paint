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

    const layers = this.layerManager_.getLayers();
    this.lineRender_ = new LineRender(layers.canvas[0], layers.ctx[0], 0);
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
    this.lineRender_.selectLayer(
      layers.canvas[layerNum],
      layers.ctx[layerNum],
      layerNum
    );
  }

  public addLayer() {
    const { canvas, ctx } = this.layerManager_.addLayer();
    //only fire most top canvas
    canvas.addEventListener('mousedown', e => {
      const rect: DOMRect = canvas.getBoundingClientRect();
      const x: number = e.pageX - rect.left;
      const y: number = e.pageY - rect.top;
      this.lineRender_.start({ x: x, y: y }, this.color_);
    });
    window.addEventListener('mouseup', e => {
      const hist = this.lineRender_.end();
      if (hist) this.historyManager_.do(hist);
    });
    window.addEventListener('mousemove', e => {
      const rect: DOMRect = canvas.getBoundingClientRect();
      const x: number = e.pageX - rect.left;
      const y: number = e.pageY - rect.top;
      this.lineRender_.update({ x: x, y: y });
    });
  }

  public undo() {
    const hist: Array<History> | null = this.historyManager_.undo();
    console.log(hist);
    if (hist) {
      const layers = this.layerManager_.getLayers();
      for (const h of hist) {
        const layerNum = h.layerNum;
        this.lineRender_.selectLayer(
          layers.canvas[layerNum],
          layers.ctx[layerNum],
          layerNum
        );
        this.lineRender_.undo(h);
      }
    }
  }

  public redo() {
    const hist: History | null = this.historyManager_.redo();
    if (hist) {
      const layers = this.layerManager_.getLayers();
      const layerNum = hist.layerNum;
      this.lineRender_.selectLayer(
        layers.canvas[layerNum],
        layers.ctx[layerNum],
        layerNum
      );
      this.lineRender_.undo(hist);
    }
  }

  public setColor(color: HSV | RGB) {
    this.color_ = color;
  }
}
