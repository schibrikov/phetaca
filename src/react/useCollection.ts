import { useLayoutEffect, useMemo, useState } from "react";
import { Resource } from "../Resource";

export function useCollection<TID, TEntity>(resource: Resource<TID, TEntity>) {
  const [collection, setCollection] = useState<TEntity[]>([]);

  useLayoutEffect(() => {
    return resource.store.subscribeToAll(store => {
      setCollection(store.getAll());
    });
  }, []);

  const crud = useMemo(
    () => ({
      remove: resource.remove.bind(resource),
      create: resource.create.bind(resource),
      update: resource.update.bind(resource)
    }),
    []
  );

  return { data: collection, ...crud };
}
