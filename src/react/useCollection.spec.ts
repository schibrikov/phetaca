import { renderHook, act } from "@testing-library/react-hooks";
import { Number, Record, String } from "runtypes";
import { createResource } from "../index";
import { useCollection } from "./useCollection";

const correctCustomers = [
  { id: 1, name: "John" },
  { id: 2, name: "Smith" }
];

const CustomerType = Record({
  id: Number,
  name: String
});

let resource = createResource({
  url: "http://localhost/customer",
  entityType: CustomerType,
  getId: entity => entity.id
});

test("react / use empty collection", async () => {
  const { result } = renderHook(() => useCollection(resource));
  expect(result.current.data).toEqual([]);
});
