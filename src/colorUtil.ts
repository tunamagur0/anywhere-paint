export interface RGB {
  r: number;
  g: number;
  b: number;
}

export interface HSV {
  h: number;
  s: number;
  v: number;
}

/**
 *
 * @param {RGB} rgb rgb 0-255
 * @returns {HSV} h:0-360 s:0-100 v:0-100
 */
export function rgb2hsv(rgb: RGB): HSV {
  const ret: HSV = {
    h: 0,
    s: 0,
    v: 0
  };
  const min = Math.min(rgb.r, rgb.g, rgb.b);
  const max = Math.max(rgb.r, rgb.g, rgb.b);

  //calculate h
  if (min === rgb.b) {
    ret.h = (60 * (rgb.g - rgb.r)) / (max - min) + 60;
  }
  if (min === rgb.r) {
    ret.h = (60 * (rgb.b - rgb.g)) / (max - min) + 180;
  }
  if (min === rgb.g) {
    ret.h = (60 * (rgb.r - rgb.b)) / (max - min) + 300;
  }

  //calculate v
  ret.v = (max / 255) * 100;

  //calculate s
  ret.s = ((max - min) / max) * 100;
  return ret;
}

/**
 *
 * @param {HSV} hsv h:0-360 s:0-100 v:0-100
 * @returns {RGB} rgb 0-255
 */
export function hsv2rgb(hsv: HSV): RGB {
  const v = hsv.v / 100;
  const s = hsv.s / 100;
  const ret: RGB = {
    r: v * (1 - s),
    g: v * (1 - s),
    b: v * (1 - s)
  };
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
  }
  ret.r = Math.round(ret.r * 255);
  ret.g = Math.round(ret.g * 255);
  ret.b = Math.round(ret.b * 255);
  return ret;
}
