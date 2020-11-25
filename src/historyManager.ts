import { HSV } from './colorUtil';
import { History } from './historyTypes';

export default class HistoryManager {
  private stack: History[] = [];

  private pointer = 0;

  private cnts: Map<number, number> = new Map<number, number>();

  private cntHistories: Map<number, number[]> = new Map<number, number[]>();

  private snapshotInterval = 10;

  private listener: ((history: History) => void) | null = null;

  public do(history: History, listen = true): void {
    const hist: History = { ...history };
    hist.info = {
      ...history.info,
    };

    const rest: History[] = this.stack
      .slice(this.pointer, this.stack.length)
      .reverse();

    // reduce cnts
    for (const r of rest) {
      const numHist: number[] | undefined = this.cntHistories.get(
        r.info.layerNum
      );

      if (numHist !== undefined && numHist.length !== 0) {
        numHist.pop();
        const prevCnt = numHist[numHist.length - 1];
        this.cnts.set(r.info.layerNum, prevCnt);
        this.cntHistories.set(r.info.layerNum, numHist);
      }
    }

    let cnt: number | undefined = this.cnts.get(hist.info.layerNum);
    let cntHistory: number[] | undefined = this.cntHistories.get(
      hist.info.layerNum
    );

    if (cntHistory === undefined) {
      cntHistory = [0];
    }
    if (cnt === undefined) {
      cnt = 0;
    }

    switch (hist.target) {
      case 'LINE_HISTORY': {
        if (hist.info.color instanceof HSV) {
          hist.info.color = new HSV(...hist.info.color);
        }

        if (cnt % this.snapshotInterval !== 0) {
          hist.info.snapshot = null;
        }
        cnt += 1;
        break;
      }
      case 'LAYER_HISTORY': {
        cnt += this.snapshotInterval - (cnt % this.snapshotInterval);
        break;
      }
      default:
        break;
    }

    cntHistory.push(cnt);
    this.cnts.set(hist.info.layerNum, cnt);
    this.cntHistories.set(hist.info.layerNum, cntHistory);
    this.stack = this.stack.slice(0, this.pointer);
    this.stack.push(hist);
    this.pointer += 1;
    if (listen && this.listener !== null && hist !== null) {
      this.listener(hist);
    }
  }

  public undo(): Array<History> | null {
    if (this.pointer === 0) return null;
    let tmpP: number = this.pointer - 1;
    this.pointer -= 1;
    const ret: Array<History> = [];
    const top: History = { ...this.stack[this.pointer] };
    top.info = { ...this.stack[this.pointer].info };
    switch (top.target) {
      case 'LINE_HISTORY':
        // if stack top has snapshot
        if (top.info.snapshot) {
          top.info.path = [];
          ret.unshift({ ...top, info: { ...top.info } });
          break;
        }
        do {
          tmpP -= 1;
          const current: History = { ...this.stack[tmpP] };
          current.info = { ...this.stack[tmpP].info };
          if (top.info.layerNum === current.info.layerNum) ret.unshift(current);
          if (current.info.snapshot) {
            break;
          }
          // eslint-disable-next-line no-constant-condition
        } while (true);
        break;
      case 'LAYER_HISTORY':
        ret.unshift(top);
        break;
      default:
        break;
    }
    return ret;
  }

  public redo(): History | null {
    if (this.pointer === this.stack.length) return null;
    // eslint-disable-next-line no-plusplus
    return this.stack[this.pointer++];
  }

  public reset(): void {
    this.stack = [];
    this.pointer = 0;
    this.cnts = new Map<number, number>();
    this.cntHistories = new Map<number, number[]>();
  }

  public registerListener(listener: (history: History) => void): void {
    this.listener = listener;
  }

  public unregisterListener(): void {
    this.listener = null;
  }
}
