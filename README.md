# anywhere-paint

anywhere-paint is a library to create painting apps.

## Installation

`npm install --save anywhere-paint`

# How to use

Create an AnywherePaint obj:

```
const container = document.getElementById('container');
const width = 600;  //width resolution
const height = 400; //height resolution
const awPaint = new AnywherePaint(container, width, height);
```

now you can draw lines.

Create a ColorCircle obj (only browser which supports OffscreenCanvas):

```
const container = document.getElementById('cc-container');
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
awPaint.addLayer();
```

Add a new on top and select that.
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

### Line

```
awPaint.setColor(r, g, b);
```

Set line color by r (0-255), g (0-255), b (0-255).

```
awPaint.setLineWidth(px);
```

Set line width(px).

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

# Lisence

MIT

```

```
