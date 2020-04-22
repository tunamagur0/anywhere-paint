import AnywherePaint from './anywherePaint';

const canvas: HTMLDivElement = document.getElementById(
  'canvas'
) as HTMLDivElement;

const awPaint: AnywherePaint = new AnywherePaint(canvas, 600, 400);
let currentLayer = 0;

const button = document.getElementById('button') as HTMLButtonElement;
button.onclick = () => {
  const output = document.getElementById('output1') as HTMLOutputElement;
  const width = parseInt(output.value, 10);

  awPaint.setLineWidth(width);
};
awPaint.createColorCircle(document.getElementById('circle') as HTMLDivElement);
const checkBox = document.getElementById('is-eraser') as HTMLInputElement;
checkBox.onclick = (e) => {
  const target = e.target as HTMLInputElement;
  awPaint.changeMode(target.checked ? 'Eraser' : 'Pencil');
};

const layer = document.getElementById('is-eraser') as HTMLInputElement;
layer.onchange = (e) => {
  const target = e.target as HTMLInputElement;
  awPaint.selectLayer(target.checked ? 1 : 0);
};

const select = document.getElementById('select') as HTMLSelectElement;

const createLayerOption = (layerNum: number) => {
  const option = document.createElement('option');
  option.value = layerNum.toString();
  option.textContent = layerNum.toString();
  currentLayer = layerNum;
  select.appendChild(option);
  select.selectedIndex = select.childElementCount - 1;
};

createLayerOption(0);

const selectLayer = () => {
  let flag = true;
  select.childNodes.forEach((v, i) => {
    if ((v as HTMLOptionElement).value === currentLayer.toString()) {
      select.selectedIndex = i;
      flag = false;
    }
  });
  if (flag) {
    createLayerOption(currentLayer);
  }
};

const undo = document.getElementById('undo') as HTMLButtonElement;
undo.onclick = () => {
  awPaint.undo();
  currentLayer = awPaint.selectingLayer;
  selectLayer();
};
const redo = document.getElementById('redo') as HTMLButtonElement;
redo.onclick = () => {
  awPaint.redo();
  currentLayer = awPaint.selectingLayer;
  selectLayer();
};

const remove = document.getElementById('remove-layer') as HTMLButtonElement;
const removeLayerDiv = (layerNum: number) => {
  const num: number | null = awPaint.removeLayer(layerNum);
  const option = document.querySelector('option:checked');
  if (!option) return;
  option.remove();
  if (num === null) {
    currentLayer = -1;
  } else {
    currentLayer = num;
    selectLayer();
  }
};

remove.onclick = () => {
  removeLayerDiv(currentLayer);
};

select.addEventListener('change', () => {
  const selected = document.querySelector(
    'option:checked'
  ) as HTMLOptionElement;
  const val = selected.value;
  if (val) {
    awPaint.selectLayer(parseInt(val, 10));
    currentLayer = parseInt(val, 10);
  }
});

const add = document.getElementById('add-layer') as HTMLButtonElement;
add.onclick = () => {
  const num: number = awPaint.addLayer();
  awPaint.selectLayer(num);
  createLayerOption(num);
};

const download = document.getElementById('download') as HTMLButtonElement;
download.onclick = () => {
  const a = document.createElement('a');
  a.download = 'image.png';
  a.href = awPaint.getIntegratedImage();
  a.click();
};
