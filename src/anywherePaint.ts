import ColorCircle from './colorCircle';
import { RGB, HSV } from './colorUtil';
import { PenStyle } from './lineRender';
import CanvasManager from './canvasManager';

export default class AnywherePaint {
  private colorCircle: ColorCircle | null = null;

  private canvasManager: CanvasManager;

  // automatically create layer 0
  constructor(div: HTMLDivElement, width: number, height: number) {
    this.canvasManager = new CanvasManager(div, width, height);
  }

  /**
   *
   * @param {number} width line width(px)
   */
  public setLineWidth(width: number): void {
    this.canvasManager.setLineWidth(width);
  }

  public createColorCircle(div: HTMLDivElement): void {
    this.colorCircle = new ColorCircle(div);
    this.canvasManager.setColor(this.colorCircle.getColor(true));
    window.addEventListener('mouseup', () => {
      if (this.colorCircle)
        this.canvasManager.setColor(this.colorCircle.getColor(true) as HSV);
    });
  }

  public setColor(r: number, g: number, b: number): void {
    this.canvasManager.setColor(new RGB(r, g, b));
  }

  public changeMode(mode: PenStyle | string): void {
    this.canvasManager.changeMode(mode);
  }

  public undo(): void {
    this.canvasManager.undo();
  }

  public redo(): void {
    this.canvasManager.redo();
  }

  public get selectingLayer(): number {
    return this.canvasManager.selectingLayer;
  }

  public selectLayer(layerNum: number): void {
    this.canvasManager.selectLayer(layerNum);
  }

  public addLayer(): number {
    return this.canvasManager.addLayer();
  }

  public removeLayer(layerNum: number): number | null {
    return this.canvasManager.removeLayer(layerNum);
  }

  public renameLayer(layerNum: number, layerName: string) {
    this.canvasManager.renameLayer(layerNum, layerName);
  }

  public getLayerImages(): Map<number, string> {
    return this.canvasManager.getLayerImages();
  }

  public getLayerNames(): Map<number, string> {
    return this.canvasManager.getLayerNames();
  }
}
