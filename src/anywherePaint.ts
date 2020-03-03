import ColorCircle from './colorCircle';
import { HSV, RGB } from './colorUtil';
import { PenStyle } from './lineRender';
import CanvasManager from './canvasManager';

export default class AnyWherePaint {
  private div_: HTMLDivElement;
  private width_: number;
  private height_: number;
  private colorCircle_: ColorCircle | null = null;
  private canvasManager_: CanvasManager;

  //automatically create layer 0
  constructor(div: HTMLDivElement, width: number, height: number) {
    this.div_ = div;
    this.width_ = width;
    this.height_ = height;
    this.canvasManager_ = new CanvasManager(div, width, height);
  }

  /**
   *
   * @param {number} width line width(px)
   */
  public setLineWidth(width: number) {
    this.canvasManager_.setLineWidth(width);
  }

  public createColorCircle(div: HTMLDivElement) {
    this.colorCircle_ = new ColorCircle(div);
    this.canvasManager_.setColor(this.colorCircle_.getColor(true));
    window.addEventListener('mouseup', e => {
      if (this.colorCircle_)
        this.canvasManager_.setColor(<HSV>this.colorCircle_.getColor(true));
    });
  }

  public changeMode(mode: PenStyle | string) {
    this.canvasManager_.changeMode(mode);
  }

  public undo() {
    this.canvasManager_.undo();
  }

  public redo() {
    this.canvasManager_.redo();
  }

  public get selectingLayer() {
    return this.canvasManager_.selectingLayer;
  }

  public selectLayer(layerNum: number) {
    this.canvasManager_.selectLayer(layerNum);
  }

  public addLayer(): number {
    return this.canvasManager_.addLayer();
  }

  public removeLayer(layerNum: number): number | null {
    return this.canvasManager_.removeLayer(layerNum);
  }

  public renameLayer(layerNum: number, layerName: string) {
    this.canvasManager_.renameLayer(layerNum, layerName);
  }

  public getLayerImages(): Map<number, string> {
    return this.canvasManager_.getLayerImages();
  }

  public getLayerNames(): Map<number, string> {
    return this.canvasManager_.getLayerNames();
  }
}
