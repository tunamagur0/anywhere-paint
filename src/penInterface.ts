import { LineHistory } from './historyTypes';

export type PenStyle = 'Pencil' | 'Eraser';

export interface PenInterface {
  end(): LineHistory | null;
  redo(
    hist: LineHistory,
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement
  ): void;
  start(
    pos: { x: number; y: number },
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D,
    history: LineHistory
  ): void;
  undo(
    hist: LineHistory,
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement
  ): void;
  update(pos: { x: number; y: number }): void;
  drawByHistory(hist: LineHistory, ctx: CanvasRenderingContext2D): void;
}
