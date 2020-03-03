import { HSV } from './colorUtil';
import { History, HistoryTypes } from './historyTypes';
export class HistoryManager {
  private stack_: Array<History> = [];
  private pointer_: number = 0;
  private cnts_: Map<number, number> = new Map<number, number>();
  private snapshotInterval_: number = 10;
  constructor() {}

  public do(history: History) {
    const hist: History = { ...history };
    hist.info = {
      ...history.info
    };
    switch (hist.target) {
      case HistoryTypes.LINE_HISTORY:
        if (hist.info.color instanceof HSV) {
          hist.info.color = new HSV(...hist.info.color[Symbol.iterator]());
        }
        //reduce cnts
        const rest: Array<History> = this.stack_.slice(
          this.pointer_,
          this.stack_.length
        );
        for (const r of rest) {
          const num: number | undefined = this.cnts_.get(r.info.layerNum);
          if (num !== undefined) this.cnts_.set(r.info.layerNum, num - 1);
        }
        this.stack_ = this.stack_.slice(0, this.pointer_);

        let cnt: number | undefined = this.cnts_.get(hist.info.layerNum);
        if (cnt === undefined) {
          cnt = -1;
        }
        this.cnts_.set(hist.info.layerNum, cnt + 1);
        if ((cnt + 1) % this.snapshotInterval_ !== 0) {
          hist.info.snapshot = null;
        }
        break;
      case HistoryTypes.LAYER_HISTORY:
        break;
      default:
        break;
    }
    this.stack_.push(hist);
    this.pointer_++;
  }

  public undo(): Array<History> | null {
    if (this.pointer_ === 0) return null;
    let tmpP: number = --this.pointer_;
    const ret: Array<History> = [];
    const top: History = { ...this.stack_[this.pointer_] };
    top.info = { ...this.stack_[this.pointer_].info };
    switch (top.target) {
      case HistoryTypes.LINE_HISTORY:
        //if stack top has snapshot
        if (top.info.snapshot) {
          top.info.path = [];
          ret.unshift({ ...top, info: { ...top.info } });
          break;
        }
        do {
          tmpP--;
          const current: History = { ...this.stack_[tmpP] };
          current.info = { ...this.stack_[tmpP].info };
          if (current.target === HistoryTypes.LINE_HISTORY) {
            if (top.info.layerNum === current.info.layerNum)
              ret.unshift(current);
            if (current.info.snapshot) {
              break;
            }
          }
        } while (true);
        break;
      case HistoryTypes.LAYER_HISTORY:
        ret.unshift(top);
        break;
      default:
        break;
    }
    return ret;
  }

  public redo(): History | null {
    if (this.pointer_ === this.stack_.length) return null;
    return this.stack_[this.pointer_++];
  }

  public reset() {
    this.stack_ = [];
    this.pointer_ = 0;
    this.cnts_ = new Map<number, number>();
  }
}
