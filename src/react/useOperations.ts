import { useMemo } from "react";
import { Resource } from "../Resource";

export function useOperations<TID, TEntity>(resource: Resource<TID, TEntity>) {
  return useMemo(
    () => ({
      remove: resource.remove.bind(resource),
      create: resource.create.bind(resource),
      update: resource.update.bind(resource)
    }),
    []
  );
}
