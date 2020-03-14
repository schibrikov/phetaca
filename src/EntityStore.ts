import { IEntityStore } from "./types";
import { ObservableStore } from "./ObservableStore";

export class EntityStore<TID, TEntity> extends ObservableStore<TID, TEntity>
  implements IEntityStore<TID, TEntity> {
  private entities: Map<TID, TEntity> = new Map();
  private statuses: Map<
    TID,
    { loading: boolean; invalid: boolean }
  > = new Map();
  private readonly getId: (entity: TEntity) => TID;

  constructor({ getId }: { getId: (entity: TEntity) => TID }) {
    super();
    this.getId = getId;
  }

  get(id: TID): TEntity {
    const entity = this.entities.get(id);

    if (!entity) {
      throw new Error(`Entity ${id} not found!`);
    }

    return entity;
  }

  getAll(): TEntity[] {
    return Array.from(this.entities.values());
  }

  getAllIds(): TID[] {
    return Array.from(this.entities.keys());
  }

  has(id: TID): boolean {
    return this.entities.has(id);
  }

  invalidate(id?: TID): void {}

  invalidateAll(): void {}

  updateEntity(entity: TEntity) {
    const id = this.getId(entity);
    this.entities.set(id, entity);
    this.statuses.set(id, {
      loading: false,
      invalid: false
    });
    this.notifyObservers(id, this);
    this.notifyObserversAll(this);
  }

  updateEntitiesBatch(entities: TEntity[]) {
    entities.forEach(entity => {
      const id = this.getId(entity);
      this.entities.set(id, entity);
      this.statuses.set(id, {
        loading: false,
        invalid: false
      });
      this.notifyObservers(id, this);
    });
    this.notifyObserversAll(this);
  }

  removeEntity(entity: TEntity) {
    const id = this.getId(entity);
    this.statuses.delete(id);
    this.entities.delete(id);
    this.notifyObservers(id, this);
    this.notifyObserversAll(this);
  }
}
