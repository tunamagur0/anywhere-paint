/* eslint-disable max-classes-per-file */
interface RGBInterFace {
  r: number;
  g: number;
  b: number;
  toString(): string;
}

interface HSVInterface {
  h: number;
  s: number;
  v: number;
}

export class RGB implements RGBInterFace {
  public r = 0;

  public g = 0;

  public b = 0;

  constructor(...args: number[]) {
    if (args.length !== 3) throw new Error('argment num is not 3');
    [this.r, this.g, this.b] = args;
  }

  public *[Symbol.iterator](): Generator<number, void, void> {
    yield this.r;
    yield this.g;
    yield this.b;
  }

  public toString(): string {
    return `rgb(${this.r}, ${this.g}, ${this.b})`;
  }
}

/**
 *
 * @param {HSV} hsv h:0-360 s:0-100 v:0-100
 * @returns {RGB} rgb 0-255
 */
export function hsv2rgb(hsv: HSV): RGB {
  const v = hsv.v / 100;
  const s = hsv.s / 100;
  const ret: RGB = new RGB(v * (1 - s), v * (1 - s), v * (1 - s));
  const hPrime: number = hsv.h / 60;
  const i: number = Math.floor(hPrime);
  const x: number = v * s * (1 - Math.abs((hPrime % 2) - 1));

  switch (i) {
    case 0:
      ret.r += v * s;
      ret.g += x;
      break;
    case 1:
      ret.r += x;
      ret.g += v * s;
      break;
    case 2:
      ret.g += v * s;
      ret.b += x;
      break;
    case 3:
      ret.g += x;
      ret.b += v * s;
      break;
    case 4:
      ret.r += x;
      ret.b += v * s;
      break;
    case 5:
      ret.r += v * s;
      ret.b += x;
      break;
    default:
      break;
  }
  ret.r = Math.round(ret.r * 255);
  ret.g = Math.round(ret.g * 255);
  ret.b = Math.round(ret.b * 255);
  return ret;
}

export class HSV implements HSVInterface {
  public h = 0;

  public s = 0;

  public v = 0;

  constructor(...args: number[]) {
    if (args.length !== 3) throw new Error('argment num is not 3');
    [this.h, this.s, this.v] = args;
  }

  public *[Symbol.iterator](): Generator<number, void, void> {
    yield this.h;
    yield this.s;
    yield this.v;
  }

  public toString(): string {
    const rgb = hsv2rgb(new HSV(this.h, this.s, this.v));
    return `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
  }
}
/**
 *
 * @param {RGB} rgb rgb 0-255
 * @returns {HSV} h:0-360 s:0-100 v:0-100
 */
export function rgb2hsv(rgb: RGB): HSV {
  const ret: HSV = new HSV(0, 0, 0);
  const min = Math.min(rgb.r, rgb.g, rgb.b);
  const max = Math.max(rgb.r, rgb.g, rgb.b);

  // calculate h
  if (min === rgb.b) {
    ret.h = (60 * (rgb.g - rgb.r)) / (max - min) + 60;
  }
  if (min === rgb.r) {
    ret.h = (60 * (rgb.b - rgb.g)) / (max - min) + 180;
  }
  if (min === rgb.g) {
    ret.h = (60 * (rgb.r - rgb.b)) / (max - min) + 300;
  }
  ret.h = Math.round(ret.h);

  // calculate v
  ret.v = Math.round((max / 255) * 100);

  // calculate s
  ret.s = Math.round(((max - min) / max) * 100);
  return ret;
}
