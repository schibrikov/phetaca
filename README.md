# Phetaca

## Complete JavaScript REST fetching solution

```js
const User = Record({
  id: Number,
  name: String
});

const resource = createResource({
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

resource.remove(user);
resource.create(user);
resource.update(user);
```
