import AnyWherePaint from "./anywherePaint";

const canvas: HTMLCanvasElement = <HTMLCanvasElement>(
  document.getElementById("canvas")
);
const ctx: CanvasRenderingContext2D = <CanvasRenderingContext2D>(
  canvas.getContext("2d")
);

const awPaint: AnyWherePaint = new AnyWherePaint(ctx);
awPaint.line();
console.log("hello world");
