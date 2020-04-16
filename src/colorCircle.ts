import Worker from './circle.worker';
import * as colorUtil from './colorUtil';

export default class ColorCircle {
  private div: HTMLDivElement;

  // private ctx: CanvasRenderingContext2D;
  private canvas: HTMLCanvasElement;

  private hueSlider: HTMLDivElement;

  private svSlider: HTMLDivElement;

  private readonly width: number = 500;

  private readonly height: number = 500;

  private readonly size: number = Math.min(this.width, this.height) / 2;

  private readonly rDiff: number = this.size / 10;

  private hsv: colorUtil.HSV = new colorUtil.HSV(0, 0, 0);

  private worker: Worker;

  constructor(div: HTMLDivElement) {
    this.div = document.createElement('div');
    div.appendChild(this.div);
    this.div.style.position = 'relative';
    this.div.style.top = '50%';
    this.div.style.left = '50%';
    this.div.style.transform = 'translate(-50%, -50%)';
    const min = `${Math.min(div.clientWidth, div.clientHeight)}px`;
    this.div.style.width = min;
    this.div.style.height = min;

    this.hueSlider = document.createElement('div');
    this.div.appendChild(this.hueSlider);
    this.svSlider = document.createElement('div');
    this.div.appendChild(this.svSlider);

    this.canvas = document.createElement('canvas');
    this.canvas.style.width = min;
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    this.div.appendChild(this.canvas);

    this.worker = new Worker(); // new Worker('./colorRender.ts', { type: 'module' });
    this.initSlider();
    const offcan: OffscreenCanvas = this.canvas.transferControlToOffscreen();
    this.worker.postMessage(
      {
        type: 'init',
        canvas: offcan,
        width: this.width,
        height: this.height,
        size: this.size,
      },
      [offcan]
    );
    this.worker.postMessage({
      type: 'update',
      hue: 0,
    });

    window.addEventListener('resize', () => {
      const minWH = `${Math.min(div.clientWidth, div.clientHeight)}px`;
      this.div.style.width = minWH;
      this.div.style.height = minWH;
      this.updateHueSlider(this.hsv.h);
      this.updateSVSlider(this.hsv.s, this.hsv.v);
      this.canvas.style.width = minWH;
      this.canvas.style.height = minWH;
    });
  }

  public getColor(isHSV: boolean): colorUtil.HSV | colorUtil.RGB {
    if (isHSV) return this.hsv;
    return colorUtil.hsv2rgb(this.hsv);
  }

  private updateHueSlider(angle: number): void {
    const r: number = this.size - this.rDiff;

    const sliderSize = this.canvas2div(this.rDiff);
    this.hueSlider.style.width = `${sliderSize - 1}px`;
    this.hueSlider.style.height = `${sliderSize - 1}px`;
    this.hueSlider.style.transform = `rotate(${angle - 30}deg)`;
    this.hueSlider.style.left = `${
      this.canvas2div(
        this.width / 2 +
          (r - this.rDiff / 2) * Math.cos(ColorCircle.angle2rad(angle - 120))
      ) -
      sliderSize / 2
    }px`;
    this.hueSlider.style.top = `${
      this.canvas2div(
        this.height / 2 +
          (r - this.rDiff / 2) * Math.sin(ColorCircle.angle2rad(angle - 120))
      ) -
      sliderSize / 2
    }px`;
    this.updateColor(angle);
  }

  private updateSVSlider(s_: number, v_: number): void {
    const s = Math.round(s_);
    const v = Math.round(v_);
    const centerX: number = this.div.clientWidth / 2;
    const centerY: number = this.div.clientHeight / 2;
    const svSize = (3 * this.canvas2div(this.size)) / 100;
    this.svSlider.style.width = `${svSize - 1}px`;
    this.svSlider.style.height = `${svSize - 1}px`;
    this.svSlider.style.left = `${
      centerX + (s - 50) * 0.01 * this.canvas2div(this.size) - svSize / 2
    }px`;
    this.svSlider.style.top = `${
      centerY + (50 - v) * 0.01 * this.canvas2div(this.size) - svSize / 2
    }px`;

    this.hsv.s = s;
    this.hsv.v = v;
  }

  private initSlider(): void {
    const hueSliderSize = this.canvas2div(this.rDiff);
    this.hueSlider.style.width = `${hueSliderSize - 1}px`;
    this.hueSlider.style.height = `${hueSliderSize - 1}px`;
    this.hueSlider.style.position = 'absolute';
    this.hueSlider.style.border = 'solid 1px black';
    this.hueSlider.style.background = 'rgba(255, 255, 255, 0.6)';
    this.updateHueSlider(0);

    const svSliderSize = (3 * this.canvas2div(this.size)) / 100;
    this.svSlider.style.width = `${svSliderSize - 1}px`;
    this.svSlider.style.height = `${svSliderSize - 1}px`;
    this.svSlider.style.position = 'absolute';
    this.svSlider.style.border = 'solid 1px black';
    this.svSlider.style.background = 'rgba(255, 255, 255, 0.6)';
    this.updateSVSlider(100, 100);

    let hueFlag = false;
    let svFlag = false;
    this.div.addEventListener('mousedown', (e) => {
      const centerX: number = this.div.clientWidth / 2;
      const centerY: number = this.div.clientHeight / 2;
      const rect: DOMRect = this.div.getBoundingClientRect();
      const x: number = e.clientX - rect.left;
      const y: number = e.clientY - rect.top;
      if (
        centerX - this.canvas2div(this.size / 2) <= x &&
        x <= centerX + this.canvas2div(this.size / 2) &&
        centerY - this.canvas2div(this.size / 2) <= y &&
        y <= centerY + this.canvas2div(this.size / 2)
      ) {
        svFlag = true;
      } else {
        hueFlag = true;
      }
    });
    this.div.addEventListener('mousemove', (e) => {
      if (hueFlag) {
        const centerX: number = this.div.clientWidth / 2;
        const centerY: number = this.div.clientHeight / 2;
        const rect: DOMRect = this.div.getBoundingClientRect();
        const x: number = e.clientX - rect.left - centerX;
        const y: number = e.clientY - rect.top - centerY;
        const r: number = Math.sqrt(x ** 2 + y ** 2);
        const angleC: number = Math.acos(x / r);
        const angleS: number = Math.asin(y / r);
        const sign: 1 | -1 = angleS > 0 ? 1 : -1;
        this.updateHueSlider(
          (ColorCircle.rad2angle(angleC * sign) + 120 + 360) % 360
        );
      } else if (svFlag) {
        const centerX: number = this.div.clientWidth / 2;
        const centerY: number = this.div.clientHeight / 2;
        const rect: DOMRect = this.div.getBoundingClientRect();
        const x: number = e.clientX - rect.left;
        const y: number = e.clientY - rect.top;
        const divSize = this.canvas2div(this.size);
        const left: number = centerX - divSize / 2;
        const top: number = centerY - divSize / 2;
        const s: number = Math.min(
          100,
          Math.max(((x - left) / divSize) * 100, 0)
        );
        const v: number =
          100 - Math.min(100, Math.max(((y - top) / divSize) * 100, 0));
        this.updateSVSlider(s, v);
      }
    });
    window.addEventListener('mouseup', () => {
      hueFlag = false;
      svFlag = false;
    });
  }

  private updateColor(angle_: number): void {
    const angle = Math.round(angle_);
    this.worker.postMessage({ type: 'update', hue: angle });

    this.hsv.h = angle;
  }

  private static rad2angle(rad: number): number {
    return (180 * rad) / Math.PI;
  }

  private static angle2rad(angle: number): number {
    return (Math.PI * angle) / 180;
  }

  private canvas2div(size: number): number {
    const divWidth: number = this.div.clientWidth;
    const divHeight: number = this.div.clientHeight;
    const min: number = Math.min(divWidth, divHeight);

    return (size / (2 * this.size)) * min;
  }
}
