import AnyWherePaint from './anywherePaint';

const canvas: HTMLCanvasElement = <HTMLCanvasElement>(
  document.getElementById('canvas')
);

const awPaint: AnyWherePaint = new AnyWherePaint(canvas);
const button = <HTMLButtonElement>document.getElementById('button');
button.onclick = () => {
  const output = <HTMLOutputElement>document.getElementById('output1');
  const width = parseInt(output.value);

  awPaint.setLineWidth(width);
};
awPaint.createColorCircle(<HTMLDivElement>document.getElementById('circle'));
const checkBox = <HTMLInputElement>document.getElementById('is-eraser');
checkBox.onchange = e => {
  const target = <HTMLInputElement>e.target;
  awPaint.changeMode(target.checked ? 'Eraser' : 'Pencil');
};
