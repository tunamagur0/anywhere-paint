# anywhere-paint

`anywhere-paint` is a library to create painting apps.
Sample is [here](https://tunamagur0.github.io/anywhere-paint-sample)!

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

Create a ColorCircle obj (only browser which supports OffscreenCanvas):

```
const container = document.getElementById('cc-container');  //The aspect ratio of the container should be 1:1
awPaint.createColorCircle(container);
```

color is automatically picked when you draw lines.

# Methods

### Undo, Redo

```
awPaint.undo();
awPatin.redo();
```

### Layers

This library supports layer.
You can only draw on selected layer.
Unique number is assigned to each layer.

```
awPaint.addLayer(layerNum?);
```

If no arguments are specified, a new layer is added at the top.
Otherwise, a new layer is added on top of the layerNum.
Returns unique number which is assigned to new layer.

```
awPaint.removeLayer(layerNum);
```

Remove specified layer.
Returns newly selected layer number. If there is not any layers, this function returns null.

```
awPaint.renameLayer(layerNum, layerName);
```

You can assign layer name to each layer.

```
awPaint.getLayerNames();
```

Returns Map<layerNum, layerName>.

```
awPaint.selectLayer(layerNum);
```

Select layer which you want to draw.

```
awPaint.getLayerImages();
```

Returns Map<layerNum, DataURI>.

```
awPaint.getSortOrder();
```

Returns an array of layerNum sorted by layer overlap order.

```
awPaint.setSortOrder(sortOrder);
```

`sortOrder` is an array which includes layerNums.

Example ) [0, 2, 1]. At this time, 0 is the top and 1 is the buttom.

If argument is valid, layers are sorted by input.

Returns argument is valid or not.

### Line

```
awPaint.setColor(r, g, b);
```

Set line color by r (0-255), g (0-255), b (0-255).

```
awPaint.setLineWidth(px);
```

Set line width(px).

### Image

```
awPaint.getIntegratedImage();
```

Returns DataURI with a layer-integrated image. (png)

### Mode

```
awPaint.changeMode(style);
```

Change drawing mode.
style is "Pencil" or "Eraser".

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
