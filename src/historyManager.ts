import { HSV } from './colorUtil';
import { History } from './historyTypes';

export default class HistoryManager {
  private stack: History[] = [];

  private pointer = 0;

  private cnts: Map<number, number> = new Map<number, number>();

  private snapshotInterval = 10;

  private listener: ((history: History) => void) | null = null;

  public do(history: History): void {
    const hist: History = { ...history };
    hist.info = {
      ...history.info,
    };
    switch (hist.target) {
      case 'LINE_HISTORY': {
        if (hist.info.color instanceof HSV) {
          hist.info.color = new HSV(...hist.info.color);
        }

        const rest: History[] = this.stack.slice(
          this.pointer,
          this.stack.length
        );
        // reduce cnts
        for (const r of rest) {
          const num: number | undefined = this.cnts.get(r.info.layerNum);
          if (num !== undefined) this.cnts.set(r.info.layerNum, num - 1);
        }

        let cnt: number | undefined = this.cnts.get(hist.info.layerNum);
        if (cnt === undefined) {
          cnt = -1;
        }
        this.cnts.set(hist.info.layerNum, cnt + 1);
        if ((cnt + 1) % this.snapshotInterval !== 0) {
          hist.info.snapshot = null;
        }
        break;
      }
      case 'LAYER_HISTORY':
        break;
      default:
        break;
    }

    this.stack = this.stack.slice(0, this.pointer);
    this.stack.push(hist);
    this.pointer += 1;
    if (this.listener !== null && hist !== null) {
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
          if (current.target === 'LINE_HISTORY') {
            if (top.info.layerNum === current.info.layerNum)
              ret.unshift(current);
            if (current.info.snapshot) {
              break;
            }
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
  }

  public registerListener(listener: (history: History) => void): void {
    this.listener = listener;
  }

  public unregisterListener(): void {
    this.listener = null;
  }
}
