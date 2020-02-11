import AnyWherePaint from "./anywherePaint";

const canvas: HTMLCanvasElement = <HTMLCanvasElement>(
  document.getElementById("canvas")
);

const awPaint: AnyWherePaint = new AnyWherePaint(canvas);
console.log("hello world");
