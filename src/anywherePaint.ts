import ColorCircle from './colorCircle';
import { HSV, RGB } from './colorUtil';
import { PenStyle } from './lineRender';
import CanvasManager from './canvasManager';

export default class AnyWherePaint {
  private div_: HTMLDivElement;
  private width_: number;
  private height_: number;
  private colorCircle_: ColorCircle | null = null;
  private canvasManager: CanvasManager;
  constructor(div: HTMLDivElement, width: number, height: number) {
    this.div_ = div;
    this.width_ = width;
    this.height_ = height;
    this.canvasManager = new CanvasManager(div, width, height);
  }

  /**
   *
   * @param {number} width line width(px)
   */
  public setLineWidth(width: number) {
    this.canvasManager.setLineWidth(width);
  }

  public createColorCircle(div: HTMLDivElement) {
    this.colorCircle_ = new ColorCircle(div);
    this.canvasManager.setColor(this.colorCircle_.getColor(true));
    window.addEventListener('mouseup', e => {
      if (this.colorCircle_)
        this.canvasManager.setColor(<HSV>this.colorCircle_.getColor(true));
    });
  }

  public changeMode(mode: PenStyle | string) {
    this.canvasManager.changeMode(mode);
  }

  public undo() {
    this.canvasManager.undo();
  }

  public redo() {
    this.canvasManager.redo();
  }

  public selectLayer(layerNum: number) {
    this.canvasManager.selectLayer(layerNum);
  }

  public addLayer() {
    this.canvasManager.addLayer();
  }

  public removeLayer(layerNum: number) {
    this.canvasManager.removeLayer(layerNum);
  }
}
