export interface IEntityStore<TID, TEntity> {
  get(id: TID): TEntity;
  getAll(): TEntity[];
  getAllIds(): TID[];

  has(id: TID): boolean;

  invalidate(id?: TID): void;
  invalidateAll(): void;
}

export interface IObservableStore<TID, TEntity> {
  subscribe(
    id: TID,
    onUpdate: (store: IEntityStore<TID, TEntity>) => void
  ): () => void;
  subscribeToAll(
    onUpdate: (store: IEntityStore<TID, TEntity>) => void
  ): () => void;
}

type CrudResult<IRes> = Promise<{ error: Error } | { result: IRes }>;

export interface IOperations<TID, TEntity> {
  remove(entity: TEntity): CrudResult<void>;
  create(entity: Partial<TEntity>): CrudResult<TEntity>;
  update(entity: TEntity): CrudResult<TEntity>;
}
