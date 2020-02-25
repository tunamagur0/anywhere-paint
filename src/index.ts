import AnyWherePaint from './anywherePaint';

const canvas: HTMLDivElement = <HTMLDivElement>(
  document.getElementById('canvas')
);

const awPaint: AnyWherePaint = new AnyWherePaint(canvas, 600, 400);
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

const layer = <HTMLInputElement>document.getElementById('is-eraser');
layer.onchange = e => {
  const target = <HTMLInputElement>e.target;
  awPaint.selectLayer(target.checked ? 1 : 0);
};

const undo = <HTMLButtonElement>document.getElementById('undo');
undo.onclick = () => {
  awPaint.undo();
};
const redo = <HTMLButtonElement>document.getElementById('redo');
redo.onclick = () => {
  awPaint.redo();
};

const remove = <HTMLButtonElement>document.getElementById('remove');
remove.onclick = () => {
  awPaint.removeLayer(1);
};
