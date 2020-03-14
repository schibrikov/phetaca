import fetchMock from "jest-fetch-mock";
import { createResource } from "./index";
import { Number, Record, String } from "runtypes";

function createNewResource() {
  const CustomerType = Record({
    id: Number,
    name: String
  });

  return createResource({
    url: "http://localhost/customer",
    entityType: CustomerType,
    getId: entity => entity.id
  });
}

beforeAll(() => {
  fetchMock.resetMocks();
});

const correctCustomers = [
  { id: 1, name: "John" },
  { id: 2, name: "Smith" }
];

test("subscription works with correct data", async () => {
  const resource = createNewResource();
  fetchMock.mockResponseOnce(JSON.stringify(correctCustomers));
  const fn = jest.fn();

  resource.store.subscribeToAll(fn);
  await resource.fetchAll();

  expect(fn).toBeCalled();
  expect(fn).toBeCalledWith(resource.store);
  expect(resource.store.getAllIds()).toEqual([1, 2]);
});

test("creation with subscription works", async () => {
  const resource = createNewResource();
  fetchMock.mockResponseOnce(req => req.json().then(JSON.stringify));
  const fn = jest.fn();

  resource.store.subscribe(51, fn);
  const result = await resource.create({
    id: 51,
    name: "Kek"
  });

  expect(result.ok).toBeTruthy();
  expect(fn).toBeCalled();
  expect(resource.store.get(51)).toBeTruthy();
  expect(resource.store.getAllIds()).toContain(51);
});

test("highlevel request data immediately tries to fetch data", async () => {
  const resource = createNewResource();
  const fn = jest.fn();

  fetchMock.mockResponseOnce(JSON.stringify(correctCustomers));
  const subscription = await resource.requestCollection(fn);

  expect(subscription.ok).toBeTruthy();
  expect(subscription.ok && subscription.result).toBeInstanceOf(Function);
  expect(fn).toBeCalledTimes(1);
});

test("subscription works after crud ops", async () => {
  const resource = createNewResource();
  const collectionSubscriber = jest.fn();
  const idSubscriber = jest.fn();

  fetchMock.mockResponseOnce(JSON.stringify([]));

  await resource.requestCollection(collectionSubscriber);
  await resource.store.subscribe(1, idSubscriber);
  expect(collectionSubscriber).toBeCalled();
  expect(idSubscriber).not.toBeCalled();
  expect(resource.store.getAllIds()).toEqual([]);

  const user = {
    id: 1,
    name: "Hello, world"
  };
  fetchMock.mockResponseOnce(req => req.json().then(JSON.stringify));
  await resource.create(user);
  expect(resource.store.get(1)).toEqual(user);

  fetchMock.mockResponseOnce(req => req.json().then(JSON.stringify));
  await resource.update({
    id: 1,
    name: "John Smithie"
  });
  expect(resource.store.get(1).name).toBe("John Smithie");
  // Should be called on creation and on update
  expect(idSubscriber).toBeCalledTimes(2);

  await resource.remove(user);
  expect(resource.store.getAll()).toEqual([]);
  expect(idSubscriber).toBeCalledTimes(3);
});
