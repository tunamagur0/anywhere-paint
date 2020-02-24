import { hsv2rgb, HSV, RGB } from './colorUtil';

class Renderer {
  private canvas_: OffscreenCanvas;
  private ctx_: OffscreenCanvasRenderingContext2D;
  private width_: number;
  private height_: number;
  private size_: number;
  private rDiff_: number;
  constructor(
    canvas: OffscreenCanvas,
    width: number,
    height: number,
    size: number
  ) {
    this.canvas_ = canvas;
    this.ctx_ = <OffscreenCanvasRenderingContext2D>canvas.getContext('2d');
    this.width_ = width;
    this.height_ = height;
    this.size_ = size;
    this.rDiff_ = this.size_ / 10;
    this.initHue();
  }

  private initHue() {
    const r: number = this.size_ - this.rDiff_;
    const rIn: number = r - this.rDiff_;
    const centerX: number = this.width_ / 2;
    const centerY: number = this.height_ / 2;
    const angle2x = (angle: number): number => {
      return r * Math.cos(this.angle2rad(angle - 120));
    };
    const angle2y = (angle: number): number => {
      return r * Math.sin(this.angle2rad(angle - 120));
    };

    //draw Hue circle
    for (let i = 0; i <= 360; i += 0.1) {
      this.ctx_.fillStyle = `hsl(${i}, 100%, 50%)`;
      this.ctx_.moveTo(centerX, centerY);
      this.ctx_.beginPath();
      this.ctx_.lineTo(centerX + angle2x(i - 1), centerY + angle2y(i - 1));
      this.ctx_.lineTo(centerX + angle2x(i), centerY + angle2y(i));
      this.ctx_.lineTo(centerX, centerY);
      this.ctx_.closePath();
      this.ctx_.fill();
    }

    //draw inner circle
    this.ctx_.beginPath();
    this.ctx_.arc(centerX, centerY, rIn, 0, Math.PI * 2, true);
    this.ctx_.fillStyle = 'rgb(255, 255, 255)';
    this.ctx_.fill();

    //draw border
    this.ctx_.strokeStyle = 'rgb(0, 0, 0)';
    this.ctx_.lineWidth = 1;
    this.ctx_.beginPath();
    this.ctx_.arc(centerX, centerY, r, 0, Math.PI * 2, true);
    this.ctx_.closePath();
    this.ctx_.stroke();

    this.ctx_.strokeStyle = 'rgb(0, 0, 0)';
    this.ctx_.lineWidth = 1;
    this.ctx_.beginPath();
    this.ctx_.arc(centerX, centerY, rIn, 0, Math.PI * 2, true);
    this.ctx_.closePath();
    this.ctx_.stroke();
  }

  public render(hue: number) {
    const offsetX: number = this.width_ / 2 - this.size_ / 2;
    const offsetY: number = this.height_ / 2 - this.size_ / 2;
    const imgData: ImageData = this.ctx_.createImageData(
      this.size_,
      this.size_
    );
    const buf: Uint8ClampedArray = imgData.data;
    for (let i = 0; i < this.size_; i++) {
      for (let j = 0; j < this.size_; j++) {
        const rgb: RGB = hsv2rgb(
          new HSV(hue, (j / this.size_) * 100, 100 - (i / this.size_) * 100)
        );
        buf[(i * this.size_ + j) * 4] = rgb.r;
        buf[(i * this.size_ + j) * 4 + 1] = rgb.g;
        buf[(i * this.size_ + j) * 4 + 2] = rgb.b;
        buf[(i * this.size_ + j) * 4 + 3] = 255;
      }
    }
    this.ctx_.putImageData(imgData, offsetX, offsetY);
  }
  private rad2angle(rad: number) {
    return (180 * rad) / Math.PI;
  }
  private angle2rad(angle: number) {
    return (Math.PI * angle) / 180;
  }
}

let renderer: Renderer | null = null;
onmessage = event => {
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
      const hue = event.data.hue;
      if (renderer) {
        renderer.render(hue);
      }
      break;
    default:
      break;
  }
};
