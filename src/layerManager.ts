import { LayerHistory } from './historyTypes';

export default class LayerManager {
  private layers: Map<number, HTMLCanvasElement> = new Map<
    number,
    HTMLCanvasElement
  >();

  private ctxs: Map<number, CanvasRenderingContext2D> = new Map<
    number,
    CanvasRenderingContext2D
  >();

  private sortOrder: number[] = [];

  private layerNum2layerName: Map<number, string> = new Map<number, string>();

  private div: HTMLDivElement;

  private width: number;

  private height: number;

  private cnt = -1;

  constructor(div: HTMLDivElement, width: number, height: number) {
    this.div = div;
    this.width = width;
    this.height = height;
  }

  public addLayer(
    layerNum?: number
  ): {
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    layerNum: number;
    history: LayerHistory;
  } {
    this.cnt += 1;
    const index = this.sortOrder.findIndex((v) => v === layerNum);
    const preOrder = [...this.sortOrder];
    if (layerNum !== undefined && index > 0) {
      this.sortOrder.splice(index, 0, this.cnt);
    } else {
      this.sortOrder.unshift(this.cnt);
    }

    const history: LayerHistory = {
      target: 'LAYER_HISTORY',
      info: {
        command: 'add',
        layerNum: this.cnt,
        order: [preOrder, [...this.sortOrder]],
      },
    };
    this.add(history);
    this.sortCanvas();
    const canvas = [...this.layers.entries()].slice(-1)[0][1];
    const ctx = [...this.ctxs.entries()].slice(-1)[0][1];
    return {
      canvas,
      ctx,
      layerNum: this.cnt,
      history,
    };
  }

  private add(hist: LayerHistory): void {
    const layerName = `layer${hist.info.layerNum}`;
    this.layerNum2layerName.set(hist.info.layerNum, layerName);
    const canvas = this.createCanvas(hist.info.layerNum);
    canvas.style.touchAction = 'none';
    this.layers.set(hist.info.layerNum, canvas);
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
    this.ctxs.set(hist.info.layerNum, ctx);
    if (hist.info.snapshot) ctx.putImageData(hist.info.snapshot, 0, 0);
  }

  // returns maximum layerNum
  public removeLayer(
    layerNum: number
  ): { selectedLayerNum: number; history: LayerHistory } | null {
    const canvas: HTMLCanvasElement | undefined = this.layers.get(layerNum);
    if (!canvas) return null;
    const ctx: CanvasRenderingContext2D = this.ctxs.get(
      layerNum
    ) as CanvasRenderingContext2D;

    const snapshot: ImageData = ctx.getImageData(
      0,
      0,
      canvas.width,
      canvas.height
    );
    canvas.remove();
    this.layers.delete(layerNum);
    this.ctxs.delete(layerNum);
    this.layerNum2layerName.delete(layerNum);

    let ret = -1;
    for (const k of this.layers.keys()) {
      ret = Math.max(k, ret);
    }
    const order = [...this.sortOrder];
    this.sortOrder.splice(
      this.sortOrder.findIndex((v) => v === layerNum),
      1
    );
    this.sortCanvas();
    return {
      selectedLayerNum: ret,
      history: {
        target: 'LAYER_HISTORY',
        info: {
          command: 'remove',
          layerNum,
          snapshot,
          order: [order, [...this.sortOrder]],
        },
      },
    };
  }

  public renameLayer(layerNum: number, layerName: string): LayerHistory | null {
    if (!this.layerNum2layerName.has(layerNum)) {
      return null;
    }
    const previousName: string = this.layerNum2layerName.get(
      layerNum
    ) as string;
    this.layerNum2layerName.set(layerNum, layerName);

    return {
      target: 'LAYER_HISTORY',
      info: {
        command: 'rename',
        layerName: [previousName, layerName],
        layerNum,
      },
    };
  }

  // returns selected layerNum
  public undo(hist: LayerHistory): number | null {
    let ret: number | null = null;
    switch (hist.info.command) {
      case 'add': {
        const param = this.removeLayer(hist.info.layerNum);
        ret = param ? param.selectedLayerNum : null;
        break;
      }
      case 'remove': {
        this.add(hist);
        ret = hist.info.layerNum;
        break;
      }
      case 'rename':
        if (hist.info.layerName)
          this.renameLayer(hist.info.layerNum, hist.info.layerName[0]);
        break;
      case 'clear': {
        const ctx = this.ctxs.get(hist.info.layerNum);
        if (ctx && hist.info.snapshot)
          ctx.putImageData(hist.info.snapshot, 0, 0);
        break;
      }
      case 'sort':
        break;
      default:
        break;
    }

    if (hist.info.order) this.sortOrder = [...hist.info.order[0]];
    this.sortCanvas();

    return ret;
  }

  // returns selected layerNum
  public redo(hist: LayerHistory): number | null {
    let ret: number | null = null;
    switch (hist.info.command) {
      case 'add': {
        this.add(hist);
        ret = hist.info.layerNum;
        break;
      }
      case 'remove': {
        const param = this.removeLayer(hist.info.layerNum);
        ret = param ? param.selectedLayerNum : null;
        break;
      }
      case 'rename':
        if (hist.info.layerName)
          this.renameLayer(hist.info.layerNum, hist.info.layerName[1]);
        break;
      case 'clear': {
        this.clearLayer(hist.info.layerNum);
        break;
      }
      case 'sort':
        break;
      default:
        break;
    }
    if (hist.info.order) this.sortOrder = [...hist.info.order[1]];
    this.sortCanvas();

    return ret;
  }

  private createCanvas(layerNum: number): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    canvas.width = this.width;
    canvas.height = this.height;
    canvas.style.position = 'absolute';
    canvas.style.top = '50%';
    canvas.style.left = '50%';
    canvas.style.transform = 'translate(-50%, -50%)';
    canvas.id = `anywhere-paint-layer${layerNum}`;
    this.div.appendChild(canvas);

    return canvas;
  }

  private sortCanvas(): void {
    for (const o of [...this.sortOrder].reverse()) {
      const elem = document.getElementById(
        `anywhere-paint-layer${o}`
      ) as HTMLCanvasElement;
      elem.remove();
      this.div.appendChild(elem);
    }
  }

  public getLayers(): {
    canvas: Map<number, HTMLCanvasElement>;
    ctx: Map<number, CanvasRenderingContext2D>;
  } {
    return { canvas: this.layers, ctx: this.ctxs };
  }

  // return Map<layerNum, base64Image>
  public getLayerImages(): Map<number, string> {
    const ret: Map<number, string> = new Map<number, string>();
    for (const [k, v] of this.layers.entries()) {
      ret.set(k, v.toDataURL());
    }
    return ret;
  }

  public getLayerNames(): Map<number, string> {
    return new Map<number, string>(this.layerNum2layerName);
  }

  public getSortOrder(): number[] {
    return [...this.sortOrder];
  }

  // return base64Image
  public getImage(): string {
    const canvas: HTMLCanvasElement = document.createElement('canvas');
    canvas.width = this.width;
    canvas.height = this.height;
    const ctx: CanvasRenderingContext2D = canvas.getContext(
      '2d'
    ) as CanvasRenderingContext2D;
    for (const [, v] of this.layers.entries()) {
      ctx.drawImage(v, 0, 0);
    }
    return canvas.toDataURL();
  }

  public clearLayer(layerNum: number): LayerHistory | null {
    const ctx = this.ctxs.get(layerNum);
    if (!ctx) return null;
    const image = ctx.getImageData(0, 0, this.width, this.height);
    ctx.clearRect(0, 0, this.width, this.height);
    return {
      target: 'LAYER_HISTORY',
      info: {
        command: 'clear',
        layerNum,
        snapshot: image,
      },
    };
  }

  public setSortOrder(
    sortOrder: number[],
    selecting: number
  ): { isValid: boolean; hist: LayerHistory } {
    const isValid =
      sortOrder.filter((v) => !this.layers.has(v)).length === 0 &&
      this.layers.size === new Set(sortOrder).size &&
      this.layers.size === sortOrder.length;
    const hist: LayerHistory = {
      target: 'LAYER_HISTORY',
      info: {
        command: 'sort',
        layerNum: selecting,
        order: [[...this.sortOrder], [...sortOrder]],
      },
    };
    if (isValid) {
      this.sortOrder = [...sortOrder];
      this.sortCanvas();
    }
    return { isValid, hist };
  }
}
