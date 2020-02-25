import { PenStyle } from './lineRender';
import { HSV, RGB } from './colorUtil';
export interface History {
  path: Array<{ x: number; y: number }>;
  mode: PenStyle;
  color: HSV | RGB;
  lineWidth: number;
  snapshot: ImageData | null;
}

export class HistoryManager {
  private stack_: Array<History> = [];
  private pointer_: number = 0;
  private snapshotInterval_: number = 10;
  constructor() {}

  public do(history: History) {
    const hist = { ...history };
    if (hist.color instanceof HSV) {
      hist.color = new HSV(...history.color[Symbol.iterator]());
    }
    this.stack_ = this.stack_.slice(0, this.pointer_);
    if (this.pointer_ % this.snapshotInterval_ !== 0) {
      hist.snapshot = null;
    }
    this.stack_.push(hist);
    this.pointer_++;
  }

  public undo(): Array<History> | null {
    if (this.pointer_ === 0) return null;
    let tmpP: number = --this.pointer_;
    while (!this.stack_[tmpP].snapshot) {
      tmpP--;
    }

    //return only snapshot
    if (tmpP === this.pointer_) {
      const ret: Array<History> = [{ ...this.stack_[this.pointer_] }];
      ret[0].path = [];
      return ret;
    }

    return this.stack_.slice(tmpP, this.pointer_);
  }

  public redo(): History | null {
    if (this.pointer_ === this.stack_.length) return null;
    return this.stack_[this.pointer_++];
  }
}
