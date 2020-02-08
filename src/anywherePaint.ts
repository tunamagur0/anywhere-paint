export default class AnyWherePaint {
  private ctx_: CanvasRenderingContext2D;
  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx_ = ctx;
  }

  /**
   * line
   */
  public line() {
    this.ctx_.beginPath();
    this.ctx_.moveTo(10, 10);
    this.ctx_.lineTo(10, 20);
    this.ctx_.stroke();
  }
}
