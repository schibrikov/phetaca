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

class HTTPError extends Error {
  name = "HTTP Error";
}

async function superFetch(
  url: string,
  init: {
    method?: "GET" | "POST" | "PUT" | "DELETE";
    json?: {};
  }
) {
  const response = await fetch(url, {
    method: init.method ? init.method : "GET",
    body: init.json ? JSON.stringify(init.json) : undefined,
    headers: {
      "content-type": "application/json"
    }
  });

  if (!response.ok) {
    throw new HTTPError();
  }

  return response.json();
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

  requestCollection(listener: (store: IEntityStore<TID, TEntity>) => void) {
    const unsubscribe = this.store.subscribeToAll(listener);

    if (!this.fulfilled) {
      this.fetchAll();
    }

    return unsubscribe;
  }

  async fetchAll(): AsyncOperationResult<TEntity[]> {
    try {
      const result: TEntity[] = await superFetch(this.url, {});
      this.store.updateEntitiesBatch(result);
      this.fulfilled = true;
      return makeSuccess(result);
    } catch (error) {
      return makeError(error);
    }
  }

  async create(entity: Partial<TEntity>): AsyncOperationResult<TEntity> {
    try {
      const result: TEntity = await superFetch(this.url, {
        method: "POST",
        json: entity
      });

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
      await superFetch(entityUrl, { method: "DELETE" });
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
      const result: TEntity = await superFetch(entityUrl, {
        method: "PUT",
        json: entity
      });
      this.store.updateEntity(result);
      return makeSuccess(result);
    } catch (error) {
      return makeError(error);
    }
  }
}
