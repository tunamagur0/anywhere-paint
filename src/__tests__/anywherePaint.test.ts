import { check } from 'prettier';
import AnyWherePaint from '../anywherePaint';

describe('test lib', () => {
  let awPaint: AnyWherePaint | null = null;
  let div: HTMLDivElement | null = null;
  beforeEach(() => {
    div = document.createElement('div');
    document.body.appendChild(div);
    awPaint = new AnyWherePaint(div, 640, 480);
  });

  afterEach(() => {
    if (!div) return;
    document.body.removeChild(div);
    div = null;
  });

  it('add layer', () => {
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

    expect(awPaint.addLayer()).toBe(2);
    // add layer above layer1
    expect(awPaint.addLayer(1)).toBe(3);
    expect(awPaint.getLayerNames().size).toBe(4);
    expect(awPaint.getLayerImages().size).toBe(4);
    expect(awPaint.getSortOrder()).toStrictEqual([2, 3, 1, 0]);
  });

  it('select layer', () => {
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

  it('remove layer when there exists 2 layers', () => {
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

  it('remove layer when there exists 3 layers', () => {
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

  it('rename layer', () => {
    if (!awPaint) return;
    awPaint.renameLayer(0, 'hoge');
    expect(awPaint.getLayerNames()).toStrictEqual(
      new Map<number, string>([[0, 'hoge']])
    );
    awPaint.renameLayer(1, 'hoge');
    expect(awPaint.getLayerNames()).toStrictEqual(
      new Map<number, string>([[0, 'hoge']])
    );
  });

  it('sort layer', () => {
    if (!awPaint) return;

    const checkDOM = () => {
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
});
