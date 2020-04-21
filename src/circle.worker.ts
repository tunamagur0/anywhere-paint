import { hsv2rgb, HSV, RGB } from './colorUtil';

class Renderer {
  private canvas: OffscreenCanvas;

  private ctx: OffscreenCanvasRenderingContext2D;

  private width: number;

  private height: number;

  private size: number;

  private rDiff: number;

  constructor(
    canvas: OffscreenCanvas,
    width: number,
    height: number,
    size: number
  ) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d') as OffscreenCanvasRenderingContext2D;
    this.width = width;
    this.height = height;
    this.size = size;
    this.rDiff = this.size / 10;
    this.initHue();
  }

  private initHue(): void {
    const r: number = this.size - this.rDiff;
    const rIn: number = r - this.rDiff;
    const centerX: number = this.width / 2;
    const centerY: number = this.height / 2;
    const angle2x = (radius: number, angle: number): number => {
      return radius * Math.cos(Renderer.angle2rad(angle - 120));
    };
    const angle2y = (radius: number, angle: number): number => {
      return radius * Math.sin(Renderer.angle2rad(angle - 120));
    };

    // draw Hue circle
    for (let i = 0; i <= 360; i += 0.1) {
      this.ctx.fillStyle = `hsl(${i}, 100%, 50%)`;
      this.ctx.moveTo(
        centerX + angle2x(rIn, i - 1),
        centerY + angle2y(rIn, i - 1)
      );
      this.ctx.beginPath();
      this.ctx.lineTo(centerX + angle2x(r, i - 1), centerY + angle2y(r, i - 1));
      this.ctx.lineTo(centerX + angle2x(r, i), centerY + angle2y(r, i));
      this.ctx.lineTo(centerX + angle2x(rIn, i), centerY + angle2y(rIn, i));
      this.ctx.closePath();
      this.ctx.fill();
    }

    // draw border
    this.ctx.strokeStyle = 'rgb(0, 0, 0)';
    this.ctx.lineWidth = 1;
    this.ctx.beginPath();
    this.ctx.arc(centerX, centerY, r, 0, Math.PI * 2, true);
    this.ctx.closePath();
    this.ctx.stroke();

    this.ctx.strokeStyle = 'rgb(0, 0, 0)';
    this.ctx.lineWidth = 1;
    this.ctx.beginPath();
    this.ctx.arc(centerX, centerY, rIn, 0, Math.PI * 2, true);
    this.ctx.closePath();
    this.ctx.stroke();
  }

  public render(hue: number): void {
    const offsetX: number = this.width / 2 - this.size / 2;
    const offsetY: number = this.height / 2 - this.size / 2;
    const imgData: ImageData = this.ctx.createImageData(this.size, this.size);
    const buf: Uint8ClampedArray = imgData.data;
    for (let i = 0; i < this.size; i += 1) {
      for (let j = 0; j < this.size; j += 1) {
        const rgb: RGB = hsv2rgb(
          new HSV(hue, (j / this.size) * 100, 100 - (i / this.size) * 100)
        );
        buf[(i * this.size + j) * 4] = rgb.r;
        buf[(i * this.size + j) * 4 + 1] = rgb.g;
        buf[(i * this.size + j) * 4 + 2] = rgb.b;
        buf[(i * this.size + j) * 4 + 3] = 255;
      }
    }
    this.ctx.putImageData(imgData, offsetX, offsetY);
  }

  private static angle2rad(angle: number): number {
    return (Math.PI * angle) / 180;
  }
}

let renderer: Renderer | null = null;
declare const self: Worker;
self.onmessage = (event: MessageEvent): void => {
  switch (event.data.type) {
    case 'init':
      renderer = new Renderer(
        event.data.canvas,
        event.data.width,
        event.data.height,
        event.data.size
      );
      break;
    case 'update':
      if (renderer) {
        renderer.render(event.data.hue);
      }
      break;
    default:
      break;
  }
};
export default {} as typeof Worker & { new (): Worker };
