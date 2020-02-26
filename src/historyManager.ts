import { PenStyle } from './lineRender';
import { HSV, RGB } from './colorUtil';
export interface History {
  path: Array<{ x: number; y: number }>;
  mode: PenStyle;
  color: HSV | RGB;
  lineWidth: number;
  snapshot: ImageData | null;
  layerNum: number;
}

export class HistoryManager {
  private stack_: Array<History> = [];
  private pointer_: number = 0;
  private cnts_: Map<number, number> = new Map<number, number>();
  private snapshotInterval_: number = 10;
  constructor() {}

  public do(history: History) {
    const hist = { ...history };
    if (hist.color instanceof HSV) {
      hist.color = new HSV(...history.color[Symbol.iterator]());
    }
    //reduce cnts
    const rest: Array<History> = this.stack_.slice(
      this.pointer_,
      this.stack_.length
    );
    for (const r of rest) {
      const num: number | undefined = this.cnts_.get(r.layerNum);
      if (num !== undefined) this.cnts_.set(r.layerNum, num - 1);
    }
    this.stack_ = this.stack_.slice(0, this.pointer_);

    let cnt: number | undefined = this.cnts_.get(hist.layerNum);
    if (cnt === undefined) {
      cnt = -1;
    }
    this.cnts_.set(hist.layerNum, cnt + 1);
    if ((cnt + 1) % this.snapshotInterval_ !== 0) {
      hist.snapshot = null;
    }
    this.stack_.push(hist);
    this.pointer_++;
  }

  public undo(): Array<History> | null {
    if (this.pointer_ === 0) return null;
    let tmpP: number = --this.pointer_;
    const ret: Array<History> = [];

    //if stack top has snapshot
    if (
      this.stack_[this.pointer_].layerNum === this.stack_[tmpP].layerNum &&
      this.stack_[tmpP].snapshot
    ) {
      ret.unshift({ ...this.stack_[tmpP] });
      ret[0].path = [];
      return ret;
    }

    do {
      tmpP--;
      if (this.stack_[this.pointer_].layerNum === this.stack_[tmpP].layerNum) {
        ret.unshift({ ...this.stack_[tmpP] });
      }
    } while (
      this.stack_[this.pointer_].layerNum !== this.stack_[tmpP].layerNum ||
      !this.stack_[tmpP].snapshot
    );

    return ret;
  }

  public redo(): History | null {
    if (this.pointer_ === this.stack_.length) return null;
    return this.stack_[this.pointer_++];
  }

  public removeLayer(layerNum: number) {
    this.cnts_.delete(layerNum);
    let cnt: number = 0;
    let diff: number = 0;
    for (let i = 0; i < this.stack_.length; i++) {
      if (this.stack_[i].layerNum === layerNum) {
        this.stack_.splice(i, 1);
        i--;
        cnt++;
        if (i + cnt < this.pointer_) diff++;
      }
      // this.stack_.forEach((value, index) => {
      //   console.log(value.layerNum, index, this.stack_.length);
      //   }
      // });
    }
    this.pointer_ -= diff;
  }
}
