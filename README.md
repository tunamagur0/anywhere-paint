# anywhere-paint

![Test](https://github.com/tunamagur0/anywhere-paint/workflows/Test/badge.svg)
[![npm version](https://badge.fury.io/js/anywhere-paint.svg)](https://badge.fury.io/js/anywhere-paint)

`anywhere-paint` is a library to create painting apps.
Sample is [here](https://tunamagur0.github.io/anywhere-paint-sample)!

## DEMO

![demo](/screenshot.gif?raw=true, 'demo')

## Installation

`npm install --save anywhere-paint`

# How to use

Create an AnywherePaint obj:

```
const container = document.getElementById('container'); //The aspect ratio of the container should be equal to the resolution.
const width = 600;  //width resolution
const height = 400; //height resolution
const awPaint = new AnywherePaint(container, width, height);
```

now you can draw lines.

Create a ColorCircle obj:

```
const container = document.getElementById('cc-container');  //The aspect ratio of the container should be 1:1
awPaint.createColorCircle(container);
```

color is automatically picked when you draw lines.

# Methods

### Undo, Redo

```
awPaint.undo(): void;
awPaint.redo(): void;
```

### Layers

This library supports layer.
You can only draw on selected layer.
Unique number is assigned to each layer.

```
awPaint.addLayer(layerNum?: undefined | number): number;
```

If no arguments are specified, a new layer is added at the top.
Otherwise, a new layer is added on top of the layerNum.
Returns unique number which is assigned to new layer.

```
awPaint.removeLayer(layerNum: number): number | null;
```

Remove specified layer.
Returns newly selected layer number. If there is not any layers, this function returns null.

```
awPaint.renameLayer(layerNum: number, layerName: string): void;
```

You can assign layer name to each layer.

```
awPaint.getLayerNames(): Map<number, string>;
```

Returns Map<layerNum, layerName>.

```
awPaint.selectLayer(layerNum: number): void;
```

Select layer which you want to draw.

```
awPaint.getLayerImages(): Map<number, string>;
```

Returns Map<layerNum, DataURI>.

```
awPaint.getSortOrder(): number[];
```

Returns an array of layerNum sorted by layer overlap order.

```
awPaint.setSortOrder(sortOrder: number[]): boolean;
```

`sortOrder` is an array which includes layerNums.

Example ) [0, 2, 1]. At this time, 0 is the top and 1 is the buttom.

If argument is valid, layers are sorted by input.

Returns argument is valid or not.

### Line

```
awPaint.setColor(r: number, g: number, b: number): void;
```

Set line color by r (0-255), g (0-255), b (0-255).

```
awPaint.setLineWidth(px: number): void;
```

Set line width(px).

### Image

```
awPaint.getIntegratedImage(): string;
```

Returns DataURI with a layer-integrated image. (png)

### Mode

```
awPaint.changeMode(style: "Pencil" | "Eraser" | "Fill"): void;
```

Change drawing mode.
style is "Pencil", "Eraser" or "Fill".

### History

```
awPaint.addEventListener(callback: (history: History) => void);
```

Add callback that will be called when canvas is edited.
The parameter of callback is command object of canvas operation.
Returns listenerID.

```
awPaint.removeEventListener(listener: number): void;
```

Remove eventListener.

```
awPaint.drawByHistory(history: History): void;
```

Operate canvas using history.

# Properties

```
awPaint.selectingLayer

```

layerNum which is selecting.

## TypeScript

Write this in tsconfig.json.

```
{
    "compilerOptions": {
        "moduleResolution": "node",
        "esModuleInterop": true,
    }
}
```

# Lisence

MIT
