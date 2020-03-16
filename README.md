![Check and build Phetaca](https://github.com/sHooKDT/phetaca/workflows/Check%20and%20build%20Phetaca/badge.svg?branch=master)

# Phetaca

**Phetaca provides high-level API around your REST backend.
Think of it like ORM for REST.**

## Rationale

The common problem state managers like Redux and MobX solves
is handling remote data. We construct a lot of stores, actions, etc.
to keep in sync with our REST backend.

In the world of GraphQL Relay and Apollo provides their own
stores to manage and display the data reactively when you update it.

Phetaca is the same for REST API. It provides a wrapper so-called "resource"
to represent some type of data alongside the way to validate and sync it with server.

## Features

+ Convenient abstraction on top of REST
+ No state-management needed!
+ Runtime validation and type-safety
+ Uses Fetch API under the hood
+ Less than 2KB minified and gzipped
+ First-class React support with hooks and suspense

## Example

```js
const User = Record({
  id: Number,
  name: String
});

const resource = createResource({
  // URLs for CRUD are automatically constructed
  // we assume the following operations available
  // GET /users - to fetch all users as a list
  // POST /users - to create new user, should return created entity
  // DELETE /users/1 - to remove user with id 1
  // UPDATE /users/1 - to update user with id 1, should return updated user
  url: "/users",
  entityType: User,
  getId: user => user.id
});

// Store methods
resource.get(13);
resource.getAll();

// Subscription
resource.subscribe(13, user => {});
resource.subscribeToAll(users => {});

// CRUD
const user = {
  id: 1,
  name: "Smith"
};

resource.create(user);
resource.update(user);
resource.remove(user);
```

## React example

```jsx harmony
import React from "react";
import { useCollection } from "phetaca/react";

function App() {
  // Hooks exposes collection data alongside the CRUD methods
  const { data, remove, create, update } = useCollection(resource, {
    suspense: true
  });

  const createUser = () => {
    create({
      name: "Herald"
    });
  };

  const setUserNameToJohn = user => {
    update({
      ...user,
      name: "John"
    });
  };

  return (
    <div>
      <ul>
        {data.map(user => (
          <li>
            {user.name}
            <button onClick={() => remove(user)}>Delete</button>
            <button onClick={setUserNameToJohn}>Set name to John</button>
          </li>
        ))}
      </ul>
      <button onClick={createUser}>Create</button>
    </div>
  );
}
```
