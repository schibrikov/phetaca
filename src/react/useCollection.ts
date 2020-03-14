import { useLayoutEffect, useState } from "react";
import { Resource } from "../Resource";

export function useCollection<TID, TEntity>(resource: Resource<TID, TEntity>) {
  const [collection, setCollection] = useState<TEntity[]>([]);

  useLayoutEffect(() => {
    return resource.store.subscribeToAll(store => {
      setCollection(store.getAll());
    });
  }, []);

  return { data: collection };
}
