import * as colorUtil from './colorUtil';

export default class ColorCircle {
  private div_: HTMLDivElement;
  // private ctx_: CanvasRenderingContext2D;
  private canvas_: HTMLCanvasElement;
  private hueSlider_: HTMLDivElement;
  private svSlider_: HTMLDivElement;
  private readonly width_: number = 500;
  private readonly height_: number = 500;
  private readonly size_: number = Math.min(this.width_, this.height_) / 2;
  private readonly rDiff_: number = this.size_ / 10;
  private hsv_: colorUtil.HSV = new colorUtil.HSV(0, 0, 0);
  private worker_: Worker;

  constructor(div: HTMLDivElement) {
    this.div_ = div;
    this.div_.style.position = 'relative';

    this.hueSlider_ = document.createElement('div');
    this.div_.appendChild(this.hueSlider_);
    this.svSlider_ = document.createElement('div');
    this.div_.appendChild(this.svSlider_);

    this.canvas_ = document.createElement('canvas');
    this.canvas_.style.width =
      Math.min(this.div_.clientWidth, this.div_.clientHeight) + 'px';
    this.canvas_.width = this.width_;
    this.canvas_.height = this.height_;
    this.div_.appendChild(this.canvas_);

    this.worker_ = new Worker('colorRender.bundle.js');
    this.initSlider();
    const offcan: any = this.canvas_.transferControlToOffscreen();
    this.worker_.postMessage(
      {
        type: 'init',
        canvas: offcan,
        width: this.width_,
        height: this.height_,
        size: this.size_
      },
      [offcan]
    );
    this.worker_.postMessage({
      type: 'update',
      hue: 0
    });
  }

  public getColor(isHSV: boolean): colorUtil.HSV | colorUtil.RGB {
    if (isHSV) return this.hsv_;
    else return colorUtil.hsv2rgb(this.hsv_);
  }

  private updateHueSlider(angle: number) {
    const r: number = this.size_ - this.rDiff_;

    const sliderSize = this.canvas2div(this.rDiff_);
    this.hueSlider_.style.width = sliderSize - 1 + 'px';
    this.hueSlider_.style.height = sliderSize - 1 + 'px';
    this.hueSlider_.style.transform = `rotate(${angle - 30}deg)`;
    this.hueSlider_.style.left =
      this.canvas2div(
        this.width_ / 2 +
          (r - this.rDiff_ / 2) * Math.cos(this.angle2rad(angle - 120))
      ) -
      sliderSize / 2 +
      'px';
    this.hueSlider_.style.top =
      this.canvas2div(
        this.height_ / 2 +
          (r - this.rDiff_ / 2) * Math.sin(this.angle2rad(angle - 120))
      ) -
      sliderSize / 2 +
      'px';
    this.updateColor(angle);
  }

  private updateSVSlider(s: number, v: number) {
    s = Math.round(s);
    v = Math.round(v);
    const centerX: number = this.div_.clientWidth / 2;
    const centerY: number = this.div_.clientHeight / 2;
    const svSize = this.svSlider_.clientWidth;
    this.svSlider_.style.left =
      centerX +
      (s - 50) * 0.01 * this.canvas2div(this.size_) -
      svSize / 2 +
      'px';
    this.svSlider_.style.top =
      centerY +
      (50 - v) * 0.01 * this.canvas2div(this.size_) -
      svSize / 2 +
      'px';

    this.hsv_.s = s;
    this.hsv_.v = v;
  }

  private initSlider() {
    const hueSliderSize = this.canvas2div(this.rDiff_);
    this.hueSlider_.style.width = hueSliderSize - 1 + 'px';
    this.hueSlider_.style.height = hueSliderSize - 1 + 'px';
    this.hueSlider_.style.position = 'absolute';
    this.hueSlider_.style.border = 'solid 1px black';
    this.hueSlider_.style.background = 'rgba(255, 255, 255, 0.6)';
    this.updateHueSlider(0);

    const svSliderSize = (3 * this.canvas2div(this.size_)) / 100;
    this.svSlider_.style.width = svSliderSize - 1 + 'px';
    this.svSlider_.style.height = svSliderSize - 1 + 'px';
    this.svSlider_.style.position = 'absolute';
    this.svSlider_.style.border = 'solid 1px black';
    this.svSlider_.style.background = 'rgba(255, 255, 255, 0.6)';
    this.updateSVSlider(100, 100);

    let hueFlag = false,
      svFlag = false;
    this.div_.addEventListener('mousedown', e => {
      const centerX: number = this.div_.clientWidth / 2;
      const centerY: number = this.div_.clientHeight / 2;
      const rect: DOMRect = this.div_.getBoundingClientRect();
      const x: number = e.pageX - rect.left;
      const y: number = e.pageY - rect.top;
      if (
        centerX - this.canvas2div(this.size_ / 2) <= x &&
        x <= centerX + this.canvas2div(this.size_ / 2) &&
        centerY - this.canvas2div(this.size_ / 2) <= y &&
        y <= centerY + this.canvas2div(this.size_ / 2)
      ) {
        svFlag = true;
      } else {
        hueFlag = true;
      }
    });
    this.div_.addEventListener('mousemove', e => {
      if (hueFlag) {
        const centerX: number = this.div_.clientWidth / 2;
        const centerY: number = this.div_.clientHeight / 2;
        const rect: DOMRect = this.div_.getBoundingClientRect();
        const x: number = e.pageX - rect.left - centerX;
        const y: number = e.pageY - rect.top - centerY;
        const r: number = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
        const angleC: number = Math.acos(x / r);
        const angleS: number = Math.asin(y / r);
        const sign: 1 | -1 = angleS > 0 ? 1 : -1;
        this.updateHueSlider((this.rad2angle(angleC * sign) + 120 + 360) % 360);
      } else if (svFlag) {
        const centerX: number = this.div_.clientWidth / 2;
        const centerY: number = this.div_.clientHeight / 2;
        const rect: DOMRect = this.div_.getBoundingClientRect();
        const x: number = e.pageX - rect.left;
        const y: number = e.pageY - rect.top;
        const divSize = this.canvas2div(this.size_);
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
      hueFlag = svFlag = false;
    });
  }

  private updateColor(angle: number) {
    angle = Math.round(angle);
    this.worker_.postMessage({ type: 'update', hue: angle });

    this.hsv_.h = angle;
  }

  private rad2angle(rad: number) {
    return (180 * rad) / Math.PI;
  }
  private angle2rad(angle: number) {
    return (Math.PI * angle) / 180;
  }

  private canvas2div(size: number) {
    const divWidth: number = this.div_.clientWidth;
    const divHeight: number = this.div_.clientHeight;
    const min: number = Math.min(divWidth, divHeight);

    return (size / (2 * this.size_)) * min;
  }
}
