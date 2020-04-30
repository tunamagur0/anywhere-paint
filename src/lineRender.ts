import * as colorUtil from './colorUtil';
import { LineHistory } from './historyTypes';
import { PenInterface, PenStyle } from './penInterface';
import PencilRender from './pencilRender';
import EraserRender from './eraserRender';

export default class LineRender {
  private canvas: HTMLCanvasElement;

  private ctx: CanvasRenderingContext2D;

  private isDrawing = false;

  private mode: PenStyle = 'Pencil';

  private pre: { x: number; y: number } = { x: 0, y: 0 };

  private color: colorUtil.HSV | colorUtil.RGB = new colorUtil.HSV(0, 0, 0);

  private lineWidth = 1;

  private layerNum = 0;

  private penRenders: Map<PenStyle, PenInterface> = new Map<
    PenStyle,
    PenInterface
  >();

  private history: LineHistory = {
    target: 'LINE_HISTORY',
    info: {
      path: [],
      mode: this.mode,
      color: this.color,
      lineWidth: this.lineWidth,
      snapshot: null,
      layerNum: this.layerNum,
    },
  };

  constructor(
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D,
    layerNum: number
  ) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.layerNum = layerNum;
    this.penRenders.set('Pencil', new PencilRender());
    this.penRenders.set('Eraser', new EraserRender());
  }

  public selectLayer(
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D,
    layerNum: number
  ): void {
    this.canvas = canvas;
    this.ctx = ctx;
    this.layerNum = layerNum;
  }

  public changeMode(mode: PenStyle): void {
    this.mode = mode;
  }

  public setWidth(width: number): void {
    this.ctx.lineWidth = width;
    this.lineWidth = width;
  }

  public start(
    pos: { x: number; y: number },
    color: colorUtil.HSV | colorUtil.RGB = new colorUtil.HSV(0, 0, 0)
  ): void {
    const penRender: PenInterface | undefined = this.penRenders.get(this.mode);
    if (!penRender) {
      throw new Error(`cannot find ${this.mode}`);
    }
    const history: LineHistory = {
      target: 'LINE_HISTORY',
      info: {
        path: [pos],
        mode: this.mode,
        color,
        lineWidth: this.lineWidth,
        snapshot: this.ctx.getImageData(
          0,
          0,
          this.canvas.width,
          this.canvas.height
        ),
        layerNum: this.layerNum,
      },
    };
    penRender.start(pos, this.canvas, this.ctx, history);
  }

  public update(pos: { x: number; y: number }): void {
    const penRender: PenInterface | undefined = this.penRenders.get(this.mode);
    if (!penRender) {
      throw new Error(`cannot find ${this.mode}`);
    }
    penRender.update(pos);
  }

  public end(): LineHistory | null {
    const penRender: PenInterface | undefined = this.penRenders.get(this.mode);
    if (!penRender) {
      throw new Error(`cannot find ${this.mode}`);
    }
    const ret = penRender.end();
    return ret;
  }

  public undo(hist: LineHistory): void {
    const penRender: PenInterface | undefined = this.penRenders.get(this.mode);
    if (!penRender) {
      throw new Error(`cannot find ${this.mode}`);
    }
    penRender.undo(hist, this.ctx, this.canvas);
  }

  public redo(hist: LineHistory): void {
    const penRender: PenInterface | undefined = this.penRenders.get(this.mode);
    if (!penRender) {
      throw new Error(`cannot find ${this.mode}`);
    }
    penRender.redo(hist, this.ctx, this.canvas);
  }
}
