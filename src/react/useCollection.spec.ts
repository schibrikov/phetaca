import { renderHook, act } from "@testing-library/react-hooks";
import { Number, Record, String } from "runtypes";
import { createResource } from "../index";
import { useCollection } from "./useCollection";
import fetchMock from "jest-fetch-mock";

function waitALittleBit() {
  return new Promise(resolve => {
    setTimeout(resolve, 10);
  });
}

beforeAll(() => {
  fetchMock.resetMocks();
});

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

test("react / create entity", async () => {
  const { result } = renderHook(() => useCollection(resource));
  expect(result.current.data).toEqual([]);

  fetchMock.mockResponseOnce(req =>
    req.json().then(user => JSON.stringify({ id: 341, ...user }))
  );
  await act(async () => {
    const operationResult = await result.current.create({
      name: "John"
    });

    expect(operationResult.ok).toBeTruthy();
  });
  expect(resource.store.get(341)).toBeTruthy();
  expect(result.current.data).toContainEqual({ id: 341, name: "John" });
});
