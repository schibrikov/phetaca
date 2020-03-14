import { IEntityStore, IObservableStore } from "./types";

export abstract class ObservableStore<TID, TEntity>
  implements IObservableStore<TID, TEntity> {
  private listenersById: Map<
    TID,
    Set<(store: IEntityStore<TID, TEntity>) => void>
  > = new Map();
  private listenersForAll: Set<
    (store: IEntityStore<TID, TEntity>) => void
  > = new Set();

  subscribe(
    id: TID,
    onUpdate: (store: IEntityStore<TID, TEntity>) => void
  ): () => void {
    const existingListeners = this.listenersById.get(id);
    if (existingListeners !== undefined) {
      existingListeners.add(onUpdate);
    } else {
      this.listenersById.set(id, new Set([onUpdate]));
    }

    return () => {
      const listeners = this.listenersById.get(id);
      if (listeners !== undefined) {
        listeners.delete(onUpdate);
      }
    };
  }

  subscribeToAll(
    onUpdate: (store: IEntityStore<TID, TEntity>) => void
  ): () => void {
    this.listenersForAll.add(onUpdate);
    return () => this.listenersForAll.delete(onUpdate);
  }

  notifyObservers(id: TID, store: IEntityStore<TID, TEntity>) {
    const listeners = this.listenersById.get(id);
    if (listeners !== undefined) {
      listeners.forEach(listener => listener(store));
    }
  }

  notifyObserversAll(store: IEntityStore<TID, TEntity>) {
    this.listenersForAll.forEach(listener => listener(store));
  }
}
