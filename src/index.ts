import { Runtype } from "runtypes";
import { Resource } from "./Resource";

export function createResource<TID, TEntity>({
  entityType,
  url,
  getId
}: {
  entityType: Runtype<TEntity>;
  url: string;
  getId: (entity: TEntity) => TID;
}) {
  return new Resource({
    entityType,
    url,
    getId
  });
}
