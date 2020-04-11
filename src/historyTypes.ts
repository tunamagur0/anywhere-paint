import { PenStyle } from './lineRender';
import { HSV, RGB } from './colorUtil';

export enum HistoryTypes {
  LINE_HISTORY = 'LINE_HISTORY',
  LAYER_HISTORY = 'LAYER_HISTORY',
}

export interface LineHistory {
  target: HistoryTypes.LINE_HISTORY;
  info: {
    path: Array<{ x: number; y: number }>;
    mode: PenStyle;
    color: HSV | RGB;
    lineWidth: number;
    snapshot: ImageData | null;
    layerNum: number;
  };
}

export interface LayerHistory {
  target: HistoryTypes.LAYER_HISTORY;
  info: {
    command: 'add' | 'remove' | 'rename';
    layerName?: [string, string];
    layerNum: number;
    snapshot?: ImageData;
  };
}
export type History = LineHistory | LayerHistory;
