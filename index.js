/* eslint-disable no-shadow */
/* eslint-disable no-underscore-dangle */
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const app = express();

const userSchema = new mongoose.Schema({
  name: String,
});

const albumSchema = new mongoose.Schema({
  performer: String,
  title: String,
  cost: Number,
});

const puchaseSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  album: { type: mongoose.Schema.Types.ObjectId, ref: 'Album' },
});

const User = mongoose.model('User', userSchema);
const Album = mongoose.model('Album', albumSchema);
const Purchase = mongoose.model('Purchase', puchaseSchema);


app.use(bodyParser.json());
app.listen(3000);

app.get('/albums', (req, res) => {
  Album.find({}, (err, albums) => {
    res.json({ data: albums });
  });
});

app.get('/albums/:id', (req, res) => {
  Album.findById(req.params.id, (err, album) => {
    if (!album) {
      res.sendStatus(404);
      return;
    }

    res.json({ data: album });
  });
});

app.post('/albums', (req, res) => {
  new Album(req.body).save((err, album) => {
    res.json({ data: album });
  });
});

app.put('/albums/:id', (req, res) => {
  Album.findById(req.params.id, (err, album) => {
    if (!album) {
      res.sendStatus(404);
      return;
    }

    Album.findByIdAndUpdate(album._id, req.body, { new: true }, (err, album) => {
      if (!album) {
        res.sendStatus(400);
        return;
      }

      res.json({ data: album });
    });
  });
});

app.delete('/albums/:id', (req, res) => {
  Album.findByIdAndRemove(req.params.id, (err) => {
    if (err) {
      res.sendStatus(400);
      return;
    }

    res.sendStatus(204);
  });
});

app.post('/users', (req, res) => {
  new User(req.body).save((err, user) => {
    res.json({ data: user });
  });
});

app.post('/purchases', (req, res) => {
  const { user, album } = req.body;
  const purchaseData = {
    user,
    album,
  };

  new Purchase(purchaseData).save((err, purchase) => {
    if (err || !purchase) {
      res.sendStatus(400);
      return;
    }

    const opts = [{ path: 'user' }, { path: 'album' }];
    Purchase.populate(purchase, opts, (err, purchase) => {
      res.json({ data: purchase });
    });
  });
});

module.exports = app;
