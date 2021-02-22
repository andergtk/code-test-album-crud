# Code Test - CRUD Albums

Simple JSON API using Node.js v6 to do CRUD.

## GET /albums

Response headers:

    status: 200

Response body:

```js
{
  "data": [
    {
      "performer": "Performer Name",
      "title": "Album Title",
      "cost": 123,
      "_id": "123abc123"
    }
  ]
}
```

## GET /albums/:id

Response headers:

    status: 200

Response body:

```js
{
  "data": {
    "performer": "Performer Name",
    "title": "Album Title",
    "cost": 123,
    "_id": "123abc123"
  }
}
```

## POST /albums

Request body:

```js
{
  "performer": "Performer Name",
  "title": "Album Title",
  "cost": 123
}
```

Response headers:

    status: 200

Response body:

```js
{
  "data": {
    "performer": "Performer Name",
    "title": "Album Title",
    "cost": 123,
    "_id": "123abc123"
  }
}
```

## PUT /albums/:id

Request body:

```js
{
  "title": "New Album Title",
  "cost": 234
}
```

Response headers:

    status: 200

Response body:

```js
{
  "data": {
    "performer": "Performer Name",
    "title": "New Album Title",
    "cost": 234,
    "_id": "123abc123"
  }
}
```

## DELETE /albums/:id

Response headers:

    status: 204

## POST /users

Request body:

```js
{
  "name": "User Name"
}
```

Response headers:

    status: 200

Response body:

```js
{
  "data": {
    "name": "User Name",
    "_id": "123abc123"
  }
}
```

## POST /purchases

Request body:

```js
{
  "user": "123abc123",
  "album": "456def456"
}
```

Response headers:

    status: 200

Response body:

```js
{
  "data": {
    "_id": "789ghi789",
    "user": {
      "name": "User Name",
      "_id": "123abc123"
    },
    "album": {
      "performer": "Performer Name",
      "title": "Album Title",
      "cost": 123,
      "_id": "123abc123"
    }
  }
}
```

## Download

```sh
git clone https://github.com/andergtk/code-test-authentication.git
```

## Tests

Run tests using Docker:

```sh
npm run test:container
```

Run tests locally:

```sh
npm test
```
