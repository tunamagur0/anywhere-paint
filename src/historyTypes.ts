import { PenStyle } from './penInterface';
import { HSV, RGB } from './colorUtil';

export type HistoryTypes = 'LINE_HISTORY' | 'LAYER_HISTORY';

interface HistoryInterface {
  target: HistoryTypes;
  info: object;
}

export interface LineHistory extends HistoryInterface {
  target: 'LINE_HISTORY';
  info: {
    path: Array<{ x: number; y: number }>;
    mode: PenStyle;
    color: HSV | RGB;
    lineWidth: number;
    snapshot: ImageData | null;
    layerNum: number;
  };
}

export interface LayerHistory extends HistoryInterface {
  target: 'LAYER_HISTORY';
  info: {
    command: 'add' | 'remove' | 'rename' | 'clear' | 'sort';
    layerName?: [string, string];
    layerNum: number;
    snapshot?: ImageData;
    order?: number[][];
  };
}

export type History = LineHistory | LayerHistory;
