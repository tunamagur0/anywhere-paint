import { History } from './historyTypes';

export default class ListenerManager {
  private listeners: Map<number, (history: History) => void> = new Map<
    number,
    (history: History) => void
  >();

  private cnt = 0;

  public addEventListener(callback: (history: History) => void): number {
    this.listeners.set(this.cnt, callback);
    this.cnt += 1;
    return this.cnt - 1;
  }

  public removeEventListener(listener: number): void {
    this.listeners.delete(listener);
  }

  public callback(history: History): void {
    for (const listener of this.listeners.values()) {
      listener(history);
    }
  }
}
