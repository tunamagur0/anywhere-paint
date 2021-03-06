import ColorCircle from './colorCircle';
import { RGB, HSV } from './colorUtil';
import { PenStyle } from './penInterface';
import CanvasManager from './canvasManager';
import ListenerManager from './listenerManager';
import { History } from './historyTypes';

export { HSV, RGB } from './colorUtil';
export { PenStyle } from './penInterface';

export default class AnywherePaint {
  private colorCircle: ColorCircle | null = null;

  private canvasManager: CanvasManager;

  private listenerManager: ListenerManager;

  // automatically create layer 0
  constructor(div: HTMLDivElement, width: number, height: number) {
    this.canvasManager = new CanvasManager(div, width, height);
    this.listenerManager = new ListenerManager();
    this.canvasManager.registerListener((history: History) =>
      this.listenerManager.callback(history)
    );
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

  public changeMode(mode: PenStyle): void {
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

  public addLayer(layerNum?: number): number {
    return this.canvasManager.addLayer(layerNum);
  }

  public removeLayer(layerNum: number): number | null {
    return this.canvasManager.removeLayer(layerNum);
  }

  public renameLayer(layerNum: number, layerName: string): void {
    this.canvasManager.renameLayer(layerNum, layerName);
  }

  public getLayerImages(): Map<number, string> {
    return this.canvasManager.getLayerImages();
  }

  public getLayerNames(): Map<number, string> {
    return this.canvasManager.getLayerNames();
  }

  public getIntegratedImage(): string {
    return this.canvasManager.getIntegratedImage();
  }

  public getSortOrder(): number[] {
    return this.canvasManager.getSortOrder();
  }

  public setSortOrder(sortOrder: number[]): boolean {
    return this.canvasManager.setSortOrder(sortOrder);
  }

  public clearLayer(layerNum: number): void {
    this.canvasManager.clearLayer(layerNum);
  }

  public addEventListener(callback: (history: History) => void): number {
    return this.listenerManager.addEventListener(callback);
  }

  public removeEventListener(listener: number): void {
    this.listenerManager.removeEventListener(listener);
  }

  public drawByHistory(history: History): void {
    this.canvasManager.drawByHistory(history);
  }
}
