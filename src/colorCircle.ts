import * as colorUtil from './colorUtil';

export default class ColorCircle {
  private div_: HTMLDivElement;
  constructor(div: HTMLDivElement) {
    this.div_ = div;
    this.createCircle();
    console.log(colorUtil.hsv2rgb({ h: 0, s: 10, v: 10 }));
    console.log(colorUtil.rgb2hsv({ r: 120, g: 0, b: 0 }));
  }

  private createCircle() {
    const canvas: HTMLCanvasElement = document.createElement('canvas');
    const ctx: CanvasRenderingContext2D = <CanvasRenderingContext2D>(
      canvas.getContext('2d')
    );
    this.div_.appendChild(canvas);
    for (let i = 0; i <= 100; i++) {
      for (let j = 0; j <= 100; j++) {
        ctx.fillStyle = `hsl(10, ${i}%, ${j / 2}%)`;
        ctx.fillRect(i, j, 1, 1);
      }
    }

    ctx.globalCompositeOperation = 'hue';
    ctx.fillStyle = 'hsl(0, 100%, 100%)';
    ctx.fillRect(0, 0, 100, 100);

    // this.div_.style.display = "flex";
    // this.div_.style.justifyContent = "center";
    // this.div_.style.alignItems = "center";
    // this.div_.style.position = "relative";

    // const sv: HTMLDivElement = document.createElement("div");
    // sv.style.width = "30%";
    // sv.style.height = "30%";
    // sv.style.border = "solid 1px black";
    // this.div_.appendChild(sv);

    // const hInner: HTMLDivElement = document.createElement("div");
    // hInner.style.position = "absolute";
    // hInner.style.width = "50%";
    // hInner.style.height = "50%";
    // hInner.style.border = "solid 1px black";
    // hInner.style.borderRadius = "50%";
    // this.div_.appendChild(hInner);
    // const hOuter: HTMLDivElement = document.createElement("div");
    // hOuter.style.position = "absolute";
    // hOuter.style.width = "70%";
    // hOuter.style.height = "70%";
    // hOuter.style.border = "solid 1px black";
    // hOuter.style.borderRadius = "50%";
    // hOuter.style.background = "linear-gradient(white, navy)";
    // this.div_.appendChild(hOuter);
  }
}

// const canvas = document.getElementById("canvas");
// const ctx = canvas.getContext('2d');

// for (let i = 0; i <= 100; i++) {
//   for (let j = 0; j <= 100; j++) {
//     ctx.fillStyle = `hsl(0, ${i}%, ${j / 2}%)`;
//     ctx.fillRect(i, j, 1, 1);
//   }
// }

// ctx.globalCompositeOperation = "hue";
// ctx.fillStyle = 'hsl(0, 100%, 100%)';
// ctx.fillRect(0, 0, 100, 100);
