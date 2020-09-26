import { History } from './historyTypes';
import AnywherePaint from './anywherePaint';

const canvas: HTMLDivElement = document.getElementById(
  'canvas'
) as HTMLDivElement;

const awPaint: AnywherePaint = new AnywherePaint(canvas, 600, 400);
const listener = awPaint.addEventListener((history: History) => {
  console.log(history);
});
let currentLayer = 0;

const button = document.getElementById('button') as HTMLButtonElement;
button.onclick = () => {
  const output = document.getElementById('output1') as HTMLOutputElement;
  const width = parseInt(output.value, 10);

  awPaint.setLineWidth(width);
};
awPaint.createColorCircle(document.getElementById('circle') as HTMLDivElement);
const pen = document.getElementById('pen') as HTMLSelectElement;
pen.onchange = (e) => {
  const target = e.target as HTMLSelectElement;
  console.log(target.selectedIndex);
  const ma: Map<number, string> = new Map([
    [0, 'Pencil'],
    [1, 'Eraser'],
    [2, 'Fill'],
  ]);
  awPaint.changeMode(
    ma.get(target.selectedIndex) as 'Pencil' | 'Eraser' | 'Fill'
  );
};

const select = document.getElementById('select') as HTMLSelectElement;

const createLayerOption = (layerNum: number) => {
  if (layerNum === -1) return;
  const option = document.createElement('option');
  option.value = layerNum.toString();
  option.textContent = layerNum.toString();
  const sibling = document.querySelector(`option[value="${currentLayer}"]`);
  currentLayer = layerNum;
  if (sibling) {
    select.insertBefore(option, sibling);
    for (let i = 0; i < select.children.length; i += 1) {
      if (select.children[i].textContent === option.textContent) {
        select.selectedIndex = i;
      }
    }
  } else {
    select.appendChild(option);
    select.selectedIndex = select.childElementCount - 1;
  }
};

const sortOption = () => {
  const sortOrder = awPaint.getSortOrder();
  for (const o of sortOrder) {
    const elem = document.querySelector(
      `option[value="${o}"]`
    ) as HTMLOptionElement;
    elem.remove();
    select.appendChild(elem);
  }
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
  sortOption();
};
const redo = document.getElementById('redo') as HTMLButtonElement;
redo.onclick = () => {
  awPaint.redo();
  currentLayer = awPaint.selectingLayer;
  selectLayer();
  sortOption();
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
  const num: number = awPaint.addLayer(currentLayer);
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

const clear = document.getElementById('clear') as HTMLButtonElement;
clear.onclick = () => {
  awPaint.clearLayer(currentLayer);
};

const shuffle = document.getElementById('shuffle') as HTMLButtonElement;
shuffle.onclick = () => {
  const sortOrder = awPaint.getSortOrder();
  sortOrder.sort(() => Math.random() - 0.5);
  awPaint.setSortOrder(sortOrder);
  sortOption();
};
