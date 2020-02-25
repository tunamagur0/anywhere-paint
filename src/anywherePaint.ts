import ColorCircle from './colorCircle';
import { HSV, RGB } from './colorUtil';
import { LineRender, PenStyle } from './lineRender';
import CanvasManager from './canvasManager';
import LayerManager from './layerManager';

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
    // this.start();
  }

  // private start() {
  //   this.canvas_.addEventListener('mousedown', e => {
  //     const rect: DOMRect = this.canvas_.getBoundingClientRect();
  //     const x: number = e.pageX - rect.left;
  //     const y: number = e.pageY - rect.top;
  //     if (this.colorCircle_) {
  //       const color: HSV | RGB = this.colorCircle_.getColor(true);
  //       if (color) {
  //         this.lineRender_.start({ x: x, y: y }, color);
  //       }
  //     } else {
  //       this.lineRender_.start({ x: x, y: y });
  //     }
  //   });
  //   window.addEventListener('mouseup', e => {
  //     this.lineRender_.end();
  //   });
  //   window.addEventListener('mousemove', e => {
  //     const rect: DOMRect = this.canvas_.getBoundingClientRect();
  //     const x: number = e.pageX - rect.left;
  //     const y: number = e.pageY - rect.top;
  //     this.lineRender_.update({ x: x, y: y });
  //   });
  // }

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
}
