import AnywherePaint from '../anywherePaint';

const drawByPath = (
  awPaint: AnywherePaint,
  paths: { clientX: number; clientY: number; pressure?: number }[]
): void => {
  const canvas = document.getElementById(
    `anywhere-paint-layer${awPaint.selectingLayer}`
  ) as HTMLCanvasElement;

  (canvas as any).onpointerdown(new PointerEvent('pointerdown', paths[0]));
  for (const path of paths) {
    (window as any).onpointermove(new PointerEvent('pointermove', path));
  }
  (window as any).onpointerup(
    new PointerEvent('pointerup', paths[paths.length - 1])
  );
};

const getLayerInfo = (
  awPaint: AnywherePaint
): {
  order: number[];
  images: Map<number, string>;
  names: Map<number, string>;
} => ({
  order: awPaint.getSortOrder(),
  images: awPaint.getLayerImages(),
  names: awPaint.getLayerNames(),
});

const width = 640;
const height = 480;
describe('test lib', () => {
  let awPaint: AnywherePaint | null = null;
  let div: HTMLDivElement | null = null;
  beforeEach(() => {
    div = document.createElement('div');
    document.body.appendChild(div);
    awPaint = new AnywherePaint(div, width, height);
  });

  afterEach(() => {
    if (!div) return;
    document.body.removeChild(div);
    div = null;
  });

  describe('layer manipulation', () => {
    describe('add layer', () => {
      it('add on top', () => {
        if (!awPaint) return;
        expect(awPaint.selectingLayer).toBe(0);
        expect(awPaint.getLayerNames().size).toBe(1);
        expect(awPaint.getLayerImages().size).toBe(1);
        expect(awPaint.getSortOrder().length).toBe(1);

        expect(awPaint.addLayer()).toBe(1);
        expect(awPaint.selectingLayer).toBe(0);
        expect(awPaint.getLayerNames().size).toBe(2);
        expect(awPaint.getLayerImages().size).toBe(2);
        expect(awPaint.getSortOrder().length).toBe(2);
      });

      it('insert', () => {
        if (!awPaint) return;
        expect(awPaint.addLayer()).toBe(1);
        expect(awPaint.addLayer()).toBe(2);
        // add layer above layer1
        expect(awPaint.addLayer(1)).toBe(3);
        expect(awPaint.getLayerNames().size).toBe(4);
        expect(awPaint.getLayerImages().size).toBe(4);
        expect(awPaint.getSortOrder()).toStrictEqual([2, 3, 1, 0]);
      });
    });

    describe('select layer', () => {
      it('select', () => {
        if (!awPaint) return;
        expect(awPaint.selectingLayer).toBe(0);

        awPaint.addLayer();
        expect(awPaint.selectingLayer).toBe(0);
        awPaint.selectLayer(1);
        expect(awPaint.selectingLayer).toBe(1);

        // select non-existent layer and nothing changes
        awPaint.selectLayer(2);
        expect(awPaint.selectingLayer).toBe(1);
      });
    });

    describe('remove layer', () => {
      it('2 layers', () => {
        if (!awPaint) return;
        awPaint.addLayer();
        expect(awPaint.getLayerNames().size).toBe(2);
        expect(awPaint.getLayerImages().size).toBe(2);
        expect(awPaint.getSortOrder().length).toBe(2);

        expect(awPaint.removeLayer(1)).toBe(0);
        expect(awPaint.selectingLayer).toBe(0);
        expect(awPaint.getLayerNames().size).toBe(1);
        expect(awPaint.getLayerImages().size).toBe(1);
        expect(awPaint.getSortOrder().length).toBe(1);

        expect(awPaint.removeLayer(0)).toBe(-1);
        expect(awPaint.getLayerNames().size).toBe(0);
        expect(awPaint.getSortOrder().length).toBe(0);
      });

      it('3 layers', () => {
        if (!awPaint) return;
        awPaint.addLayer();
        awPaint.addLayer();
        expect(awPaint.getLayerNames().size).toBe(3);
        expect(awPaint.getLayerImages().size).toBe(3);
        expect(awPaint.getSortOrder().length).toBe(3);

        expect(awPaint.removeLayer(1)).toBe(2);
        expect(awPaint.selectingLayer).toBe(2);
        expect(awPaint.getLayerNames().size).toBe(2);
        expect(awPaint.getLayerImages().size).toBe(2);
        expect(awPaint.getSortOrder().length).toBe(2);

        // select non-existent layer and nothing changes
        expect(awPaint.removeLayer(1)).toBe(null);
        expect(awPaint.getLayerNames().size).toBe(2);
        expect(awPaint.getLayerNames().size).toBe(2);
        expect(awPaint.getSortOrder().length).toBe(2);
      });
    });

    describe('rename layer', () => {
      it('exist', () => {
        if (!awPaint) return;
        awPaint.renameLayer(0, 'hoge');
        expect(awPaint.getLayerNames()).toStrictEqual(
          new Map<number, string>([[0, 'hoge']])
        );
      });
      it('not exist', () => {
        if (!awPaint) return;
        awPaint.renameLayer(1, 'hoge');
        expect(awPaint.getLayerNames()).toStrictEqual(
          new Map<number, string>([[0, 'layer0']])
        );
      });
    });

    describe('clear layer', () => {
      it('exist', () => {
        if (!awPaint) return;
        const layerImages = awPaint.getLayerImages();
        awPaint.clearLayer(0);
        expect(awPaint.getLayerImages()).toStrictEqual(layerImages);
      });
      it('not exist', () => {
        if (!awPaint) return;
        const layerImages = awPaint.getLayerImages();
        awPaint.clearLayer(1);
        expect(awPaint.getLayerImages()).toStrictEqual(layerImages);
      });
    });

    describe('sort layer', () => {
      it('sort', () => {
        if (!awPaint) return;

        const checkDOM = (): void => {
          const children = (div?.firstChild as HTMLElement)
            .children as HTMLCollection;
          const canvasOrder = [];
          for (let i = 0; i < children?.length; i += 1) {
            const item = children?.item(i) as HTMLElement;
            const layerNum = item.id.split('layer')[1];
            canvasOrder.unshift(parseInt(layerNum, 10));
          }
          expect(awPaint?.getSortOrder()).toStrictEqual(canvasOrder);
        };

        awPaint.addLayer();
        awPaint.addLayer();
        awPaint.addLayer();
        awPaint.addLayer();
        const validOrder = [0, 1, 2, 4, 3];
        expect(awPaint.setSortOrder(validOrder)).toStrictEqual(true);
        expect(awPaint.getSortOrder()).toStrictEqual(validOrder);
        checkDOM();

        const smallSizeOrder = [0, 1];
        expect(awPaint.setSortOrder(smallSizeOrder)).toStrictEqual(false);
        expect(awPaint.getSortOrder()).toStrictEqual(validOrder);

        const bigSizeOrder = [0, 2, 3, 4, 1, 5];
        expect(awPaint.setSortOrder(bigSizeOrder)).toStrictEqual(false);
        expect(awPaint.getSortOrder()).toStrictEqual(validOrder);

        const sameNumOrder = [0, 0, 0, 0, 0];
        expect(awPaint.setSortOrder(sameNumOrder)).toStrictEqual(false);
        expect(awPaint.getSortOrder()).toStrictEqual(validOrder);
      });

      describe('get image', () => {
        it('one layer image equals to integrated image', () => {
          if (!awPaint) return;
          const images = awPaint.getLayerImages();
          const image = images.get(0);
          expect(awPaint.getIntegratedImage()).toBe(image);
        });
      });
    });
  });

  describe('draw', () => {
    it('draw line freely', () => {
      if (!awPaint) return;
      const paths = [
        { clientX: 10, clientY: 10 },
        { clientX: 20, clientY: 20 },
        { clientX: 30, clientY: 30 },
      ];
      const images = awPaint.getLayerImages();
      drawByPath(awPaint, paths);
      expect(awPaint.getLayerImages()).not.toStrictEqual(images);
    });

    it('fill', () => {
      if (!awPaint) return;
      // create black filled image
      const dummy = document.createElement('canvas') as HTMLCanvasElement;
      const dummyCtx = dummy.getContext('2d') as CanvasRenderingContext2D;
      dummy.width = width;
      dummy.height = height;
      const filledImage = dummyCtx.createImageData(width, height);
      const { data } = filledImage;
      for (let i = 0; i < data.byteLength; i += 1)
        data[i] = (i + 1) % 4 === 0 ? 255 : 0;
      dummyCtx.putImageData(filledImage, 0, 0);
      const imageURL = dummy.toDataURL();

      const paths = [{ clientX: 10, clientY: 10 }];
      awPaint.changeMode('Fill');
      drawByPath(awPaint, paths);
      expect(awPaint.getLayerImages().get(0)).toStrictEqual(imageURL);
    });

    it('erase same path', () => {
      if (!awPaint) return;
      const paths = [
        { clientX: 10, clientY: 10 },
        { clientX: 20, clientY: 20 },
        { clientX: 30, clientY: 30 },
      ];
      const images = awPaint.getLayerImages();
      drawByPath(awPaint, paths);
      awPaint.changeMode('Eraser');
      awPaint.setLineWidth(3);
      drawByPath(awPaint, paths);
      expect(awPaint.getLayerImages()).toStrictEqual(images);
    });
  });

  describe('undo', () => {
    it('there is no history', () => {
      if (!awPaint) return;
      awPaint.addLayer();
      awPaint.undo();
      expect(awPaint.undo()).toBe(undefined);
    });

    describe('layer', () => {
      it('add layer', () => {
        if (!awPaint) return;
        awPaint.addLayer();
        const pre = getLayerInfo(awPaint);
        awPaint.addLayer(1);
        awPaint.undo();
        const after = getLayerInfo(awPaint);
        expect(pre).toStrictEqual(after);
      });
      it('remove layer', () => {
        if (!awPaint) return;
        awPaint.addLayer();
        const pre = getLayerInfo(awPaint);
        awPaint.removeLayer(1);
        awPaint.undo();
        const after = getLayerInfo(awPaint);
        expect(pre).toStrictEqual(after);
      });
      it('rename layer', () => {
        if (!awPaint) return;
        const pre = getLayerInfo(awPaint);
        awPaint.renameLayer(0, 'hoge');
        awPaint.undo();
        const after = getLayerInfo(awPaint);
        expect(pre).toStrictEqual(after);
      });
      // This test is meaningless
      it('clear layer', () => {
        if (!awPaint) return;
        const pre = getLayerInfo(awPaint);
        awPaint.clearLayer(0);
        awPaint.undo();
        const after = getLayerInfo(awPaint);
        expect(pre).toStrictEqual(after);
      });

      it('draw once and undo', () => {
        if (!awPaint) return;
        const paths = [
          { clientX: 10, clientY: 10 },
          { clientX: 15, clientY: 20 },
          { clientX: 20, clientY: 30 },
        ];
        drawByPath(awPaint, paths);
        const images = awPaint.getLayerImages();
        awPaint.undo();

        // Unfortunately, image rendered by ctx.lineTo is different from by ctx.putImage
        expect(awPaint.getLayerImages()).not.toStrictEqual(images);
      });

      it('draw twice and undo', () => {
        if (!awPaint) return;
        const paths = [
          { clientX: 10, clientY: 10 },
          { clientX: 15, clientY: 20 },
          { clientX: 20, clientY: 30 },
          { clientX: 20, clientY: 10 },
          { clientX: 15, clientY: 20 },
          { clientX: 10, clientY: 30 },
        ];
        drawByPath(awPaint, paths.slice(0, 3));
        const images = awPaint.getLayerImages();
        drawByPath(awPaint, paths.slice(3, 5));
        awPaint.undo();

        // Unfortunately, image rendered by ctx.lineTo is different from by ctx.putImage
        expect(awPaint.getLayerImages()).not.toStrictEqual(images);
      });

      it('fill and undo', () => {
        if (!awPaint) return;
        const paths = [{ clientX: 10, clientY: 10 }];
        awPaint.changeMode('Fill');
        const images = awPaint.getLayerImages();
        drawByPath(awPaint, paths);
        awPaint.undo();
        expect(awPaint.getLayerImages()).toStrictEqual(images);
      });
    });
  });

  describe('redo', () => {
    it('there is no history', () => {
      if (!awPaint) return;
      awPaint.addLayer();
      awPaint.undo();
      awPaint.redo();
      expect(awPaint.redo()).toBe(undefined);
    });

    describe('layer', () => {
      it('add layer', () => {
        if (!awPaint) return;
        awPaint.addLayer();
        awPaint.addLayer(1);
        const pre = getLayerInfo(awPaint);
        awPaint.undo();
        awPaint.redo();
        const after = getLayerInfo(awPaint);
        expect(pre).toStrictEqual(after);
      });
      it('remove layer', () => {
        if (!awPaint) return;
        awPaint.addLayer();
        awPaint.removeLayer(1);
        const pre = getLayerInfo(awPaint);
        awPaint.undo();
        awPaint.redo();
        const after = getLayerInfo(awPaint);
        expect(pre).toStrictEqual(after);
      });
      it('rename layer', () => {
        if (!awPaint) return;
        awPaint.renameLayer(0, 'hoge');
        const pre = getLayerInfo(awPaint);
        awPaint.undo();
        awPaint.redo();
        const after = getLayerInfo(awPaint);
        expect(pre).toStrictEqual(after);
      });
      // This test is meaningless
      it('clear layer', () => {
        if (!awPaint) return;
        awPaint.clearLayer(0);
        const pre = getLayerInfo(awPaint);
        awPaint.undo();
        awPaint.redo();
        const after = getLayerInfo(awPaint);
        expect(pre).toStrictEqual(after);
      });

      it('draw and undo and redo', () => {
        if (!awPaint) return;
        const paths = [
          { clientX: 10, clientY: 10 },
          { clientX: 15, clientY: 20 },
          { clientX: 20, clientY: 30 },
          { clientX: 20, clientY: 10 },
          { clientX: 15, clientY: 20 },
          { clientX: 10, clientY: 30 },
        ];
        drawByPath(awPaint, paths.slice(0, 3));
        drawByPath(awPaint, paths.slice(3, 5));
        awPaint.undo();
        const images = awPaint.getLayerImages();
        awPaint.undo();
        awPaint.redo();
        expect(awPaint.getLayerImages()).toStrictEqual(images);
      });

      it('fill and undo and redo', () => {
        if (!awPaint) return;
        // create black filled image
        const dummy = document.createElement('canvas') as HTMLCanvasElement;
        const dummyCtx = dummy.getContext('2d') as CanvasRenderingContext2D;
        dummy.width = width;
        dummy.height = height;
        const filledImage = dummyCtx.createImageData(width, height);
        const { data } = filledImage;
        for (let i = 0; i < data.byteLength; i += 1)
          data[i] = (i + 1) % 4 === 0 ? 255 : 0;
        dummyCtx.putImageData(filledImage, 0, 0);
        const imageURL = dummy.toDataURL();

        const paths = [{ clientX: 10, clientY: 10 }];
        awPaint.changeMode('Fill');
        drawByPath(awPaint, paths);
        awPaint.undo();
        awPaint.redo();
        expect(awPaint.getLayerImages().get(0)).toStrictEqual(imageURL);
      });
    });
  });
});
