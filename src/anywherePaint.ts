export default class AnyWherePaint {
  private canvas_: HTMLCanvasElement;
  private ctx_: CanvasRenderingContext2D;
  constructor(canvas: HTMLCanvasElement) {
    this.canvas_ = canvas;
    this.ctx_ = <CanvasRenderingContext2D>canvas.getContext("2d");
    this.start();
  }

  private start() {
    const pre: { x: number; y: number } = { x: 0, y: 0 };
    let isDrawing: boolean = false;
    this.canvas_.addEventListener("mousedown", e => {
      isDrawing = true;
      pre.x = e.offsetX;
      pre.y = e.offsetY;
    });
    this.canvas_.addEventListener("mouseup", e => {
      isDrawing = false;
    });
    this.canvas_.addEventListener("mousemove", e => {
      if (isDrawing) {
        const x: number = e.offsetX;
        const y: number = e.offsetY;
        this.drawLine(pre.x, pre.y, x, y);
        pre.x = x;
        pre.y = y;
      }
    });
  }

  private drawLine(
    preX: number,
    preY: number,
    currentX: number,
    currentY: number
  ) {
    this.ctx_.beginPath();
    this.ctx_.moveTo(preX, preY);
    this.ctx_.lineTo(currentX, currentY);
    this.ctx_.stroke();
  }
}
