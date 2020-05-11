import { LineHistory } from './historyTypes';

export type PenStyle = 'Pencil' | 'Eraser' | 'Fill';

export interface PenInterface {
  end(): LineHistory | null;
  redo(
    hist: LineHistory,
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement
  ): void;
  start(
    info: { x: number; y: number; pressure: number },
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D,
    history: LineHistory
  ): void;
  undo(
    hist: LineHistory,
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement
  ): void;
  update(info: { x: number; y: number; pressure: number }): void;
  drawByHistory(hist: LineHistory, ctx: CanvasRenderingContext2D): void;
}
