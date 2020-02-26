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
checkBox.onclick = e => {
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

let currentLayer = 0;
const remove = <HTMLButtonElement>document.getElementById('remove-layer');
remove.onclick = () => {
  removeLayerDiv(currentLayer);
};

const select = <HTMLSelectElement>document.getElementById('select');
select.addEventListener('change', () => {
  const selected = <HTMLOptionElement>document.querySelector('option:checked');
  const val = selected.value;
  if (val) {
    awPaint.selectLayer(parseInt(val));
    currentLayer = parseInt(val);
  }
});

const add = <HTMLButtonElement>document.getElementById('add-layer');
add.onclick = () => {
  const num: number = awPaint.addLayer();
  awPaint.selectLayer(num);
  createLayerOption(num);
};

const removeLayerDiv = (layerNum: number) => {
  const num: number | null = awPaint.removeLayer(layerNum);
  const option = document.querySelector('option:checked');
  if (!option) return;
  option.remove();
  if (num === null) {
    currentLayer = -1;
  } else {
    currentLayer = num;
    select.childNodes.forEach((v, i) => {
      if ((<HTMLOptionElement>v).value === num.toString()) {
        select.selectedIndex = i;
      }
    });
  }
};

const createLayerOption = (layerNum: number) => {
  const option = document.createElement('option');
  option.value = layerNum.toString();
  option.textContent = layerNum.toString();
  currentLayer = layerNum;
  select.appendChild(option);
  select.selectedIndex = select.childElementCount - 1;
};

createLayerOption(0);
