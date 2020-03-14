import ky from "ky";
import { Runtype } from "runtypes";
import { IEntityStore, IOperations } from "./types";
import { EntityStore } from "./EntityStore";

type OperationResult<T, E = Error> =
  | {
      ok: true;
      result: T;
      map<U>(fn: (result: T) => U): OperationResult<U>;
    }
  | { ok: false; error: E };

type AsyncOperationResult<T, E = Error> = Promise<OperationResult<T, E>>;

function makeSuccess<T>(result: T) {
  return {
    ok: true as const,
    result,
    map<U>(fn: (result: T) => U): OperationResult<U> {
      try {
        return makeSuccess(fn(this.result));
      } catch (e) {
        return makeError(e);
      }
    }
  };
}

function makeError<T>(result: T) {
  return {
    ok: false as const,
    error: result
  };
}

export class Resource<TID, TEntity> implements IOperations<TID, TEntity> {
  private readonly entityType: Runtype<TEntity>;
  private readonly url: string;
  private readonly getId: (entity: TEntity) => TID;
  public readonly store: EntityStore<TID, TEntity>;

  private fulfilled: boolean = false;

  constructor({
    entityType,
    url,
    getId
  }: {
    entityType: Runtype<TEntity>;
    url: string;
    getId: (entity: TEntity) => TID;
  }) {
    this.store = new EntityStore({
      getId
    });
    this.entityType = entityType;
    this.url = url;
    this.getId = getId;
  }

  async requestCollection(
    listener: (store: IEntityStore<TID, TEntity>) => void
  ) {
    const unsubscribe = this.store.subscribeToAll(listener);

    if (!this.fulfilled) {
      const fetchResult = await this.fetchAll();

      if (fetchResult.ok) {
        return fetchResult.map(() => unsubscribe);
      }
    }

    return makeSuccess(unsubscribe);
  }

  async fetchAll(): AsyncOperationResult<TEntity[]> {
    try {
      const result: TEntity[] = await ky.get(this.url).json();
      this.store.updateEntitiesBatch(result);
      return makeSuccess(result);
    } catch (error) {
      return makeError(error);
    }
  }

  async create(entity: Partial<TEntity>): AsyncOperationResult<TEntity> {
    try {
      const result: TEntity = await ky.post(this.url, { json: entity }).json();
      this.store.updateEntity(result);
      return makeSuccess(result);
    } catch (error) {
      return makeError(error);
    }
  }

  async remove(entity: TEntity): AsyncOperationResult<void> {
    try {
      const id = this.getId(entity);
      const entityUrl = `${this.url}/${id}`;
      await ky.delete(entityUrl);
      this.store.removeEntity(entity);
      return makeSuccess(undefined);
    } catch (error) {
      return makeError(error);
    }
  }

  async update(entity: TEntity): AsyncOperationResult<TEntity> {
    try {
      const id = this.getId(entity);
      const entityUrl = `${this.url}/${id}`;
      const result: TEntity = await ky.put(entityUrl, { json: entity }).json();
      this.store.updateEntity(result);
      return makeSuccess(result);
    } catch (error) {
      return makeError(error);
    }
  }
}
