import { LayerHistory, HistoryTypes } from './historyTypes';

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
    layerNum: number;
    history: LayerHistory;
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
    return {
      canvas: canvas,
      ctx: ctx,
      layerNum: this.cnt_,
      history: {
        target: HistoryTypes.LAYER_HISTORY,
        info: {
          command: 'add',
          layerNum: this.cnt_
        }
      }
    };
  }

  //returns maximum layerNum
  public removeLayer(
    layerNum: number
  ): { selectedLayerNum: number; history: LayerHistory } | null {
    const canvas: HTMLCanvasElement | undefined = this.layers_.get(layerNum);
    if (!canvas) return null;
    const ctx: CanvasRenderingContext2D = <CanvasRenderingContext2D>(
      this.ctxs_.get(layerNum)
    );
    const snapshot: ImageData = ctx.getImageData(
      0,
      0,
      canvas.width,
      canvas.height
    );
    canvas.remove();
    this.layers_.delete(layerNum);
    this.ctxs_.delete(layerNum);
    this.layerNum2layerName.delete(layerNum);

    let ret = -1;
    for (const k of this.layers_.keys()) {
      ret = Math.max(k, ret);
    }
    return {
      selectedLayerNum: ret,
      history: {
        target: HistoryTypes.LAYER_HISTORY,
        info: {
          command: 'remove',
          layerNum: layerNum,
          snapshot: snapshot
        }
      }
    };
  }

  public renameLayer(layerNum: number, layerName: string): LayerHistory | null {
    if (!this.layerNum2layerName.has(layerNum)) {
      return null;
    }
    const previousName: string = <string>this.layerNum2layerName.get(layerNum);
    this.layerNum2layerName.set(layerNum, layerName);

    return {
      target: HistoryTypes.LAYER_HISTORY,
      info: {
        command: 'rename',
        layerName: [previousName, layerName],
        layerNum: layerNum
      }
    };
  }

  public undo(hist: LayerHistory): number | null {
    let ret: number | null = null;
    switch (hist.info.command) {
      case 'add':
        const param = this.removeLayer(hist.info.layerNum);
        ret = param ? param.selectedLayerNum : null;
        break;
      case 'remove':
        const layerName = `layer${hist.info.layerNum}`;
        this.layerNum2layerName.set(hist.info.layerNum, layerName);
        const canvas = document.createElement('canvas');
        canvas.width = this.width_;
        canvas.height = this.height_;
        canvas.style.position = 'absolute';
        this.div_.appendChild(canvas);
        this.layers_.set(hist.info.layerNum, canvas);
        const ctx = <CanvasRenderingContext2D>canvas.getContext('2d');
        this.ctxs_.set(hist.info.layerNum, ctx);
        if (hist.info.snapshot) ctx.putImageData(hist.info.snapshot, 0, 0);

        ret = hist.info.layerNum;
        break;
      case 'rename':
        if (hist.info.layerName)
          this.renameLayer(hist.info.layerNum, hist.info.layerName[1]);
        break;
      default:
        break;
    }
    return ret;
  }

  public redo(hist: LayerHistory): number | null {
    let ret: number | null = null;
    switch (hist.info.command) {
      case 'add':
        const layerName = `layer${hist.info.layerNum}`;
        this.layerNum2layerName.set(hist.info.layerNum, layerName);
        const canvas = document.createElement('canvas');
        canvas.width = this.width_;
        canvas.height = this.height_;
        canvas.style.position = 'absolute';
        this.div_.appendChild(canvas);
        this.layers_.set(hist.info.layerNum, canvas);
        const ctx = <CanvasRenderingContext2D>canvas.getContext('2d');
        this.ctxs_.set(hist.info.layerNum, ctx);
        if (hist.info.snapshot) ctx.putImageData(hist.info.snapshot, 0, 0);

        ret = hist.info.layerNum;
        break;
      case 'remove':
        const param = this.removeLayer(hist.info.layerNum);
        ret = param ? param.selectedLayerNum : null;
        break;
      case 'rename':
        if (hist.info.layerName)
          this.renameLayer(hist.info.layerNum, hist.info.layerName[1]);
        break;
      default:
        break;
    }
    return ret;
  }

  public getLayers(): {
    canvas: Map<Number, HTMLCanvasElement>;
    ctx: Map<Number, CanvasRenderingContext2D>;
  } {
    return { canvas: this.layers_, ctx: this.ctxs_ };
  }

  //return Map<layerNum, base64Image>
  public getLayerImages(): Map<number, string> {
    const ret: Map<number, string> = new Map<number, string>();
    for (const [k, v] of this.layers_.entries()) {
      ret.set(k, v.toDataURL());
    }
    return ret;
  }

  public getLayerNames(): Map<number, string> {
    return new Map<number, string>(this.layerNum2layerName);
  }
}
