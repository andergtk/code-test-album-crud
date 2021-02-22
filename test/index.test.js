/* eslint-disable no-underscore-dangle */
/* eslint-disable no-shadow */
const mongoose = require('mongoose');
const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../index');

const expect = chai.expect;

chai.use(chaiHttp);
mongoose.Promise = global.Promise;

function makeAlbum() {
  return {
    performer: `Random Performer ${new Date().getTime()}`,
    title: `Album Random Name ${new Date().getTime()}`,
    cost: Math.floor(Math.random() * 100) + 1,
  };
}

function postAlbum(callback) {
  chai.request(app)
    .post('/albums')
    .send(makeAlbum())
    .end((err, res) => {
      if (!res.body.data) throw new Error('POST /albums not implemented');
      if (res.status !== 200) throw new Error('POST /albums not working');
      callback(err, res);
    });
}

function makeUser() {
  return {
    name: `Random User Name ${new Date().getTime()}`,
  };
}

function postUser(callback) {
  chai.request(app)
    .post('/users')
    .send(makeUser())
    .end((err, res) => {
      if (!res.body.data) throw new Error('POST /users not implemented');
      if (res.status !== 200) throw new Error('POST /users not working');
      callback(err, res);
    });
}

describe('server', () => {
  before((done) => {
    // connect to Mongoose
    mongoose.connection.on('connected', done);
    mongoose.connect(process.env.MONGODB_URI);
  });

  describe('GET /albums', () => {
    it('should fetch all Albums', (done) => {
      chai.request(app)
        .get('/albums')
        .end((err, res) => {
          expect(res.status).to.equal(200);
          expect(res.body.data).to.be.an('array');
          done();
        });
    });

    it('should fetch created album', (done) => {
      postAlbum((err, res) => {
        const album = res.body.data;
        chai.request(app)
          .get('/albums')
          .end((err, res) => {
            expect(res.status).to.equal(200);
            expect(res.body.data).to.be.an('array').that.includes(album);
            done();
          });
      });
    });

    it('should fetch single Album', (done) => {
      postAlbum((err, res) => {
        const album = res.body.data;
        chai.request(app)
          .get(`/albums/${album._id}`)
          .end((err, res) => {
            expect(res.status).to.equal(200);
            expect(res.body.data).to.deep.include(album);
            done();
          });
      });
    });

    it('should not find single Album', (done) => {
      postAlbum(() => {
        const invalidId = '8s8d9d0h9h78g78f7';
        chai.request(app)
          .get(`/albums/${invalidId}`)
          .end((err, res) => {
            expect(res.status).to.not.equal(200);
            expect(res.body.data).to.equal(undefined);
            done();
          });
      });
    });
  });

  describe('POST /albums', () => {
    it('should create a new Album within the database', (done) => {
      chai.request(app)
        .post('/albums')
        .send({
          title: 'Appetite for Destruction',
          performer: 'Guns N\' Roses',
          cost: 20 })
        .end((err, res) => {
          expect(res.status).to.equal(200);
          expect(res.body.data.title).to.equal('Appetite for Destruction');
          done();
        });
    });

    it('should create a new Album with less data', (done) => {
      chai.request(app)
        .post('/albums')
        .send({ title: 'Random Title Album' })
        .end((err, res) => {
          expect(res.status).to.equal(200);
          expect(res.body.data.title).to.equal('Random Title Album');
          expect(res.body.data).to.not.have.property('performer');
          expect(res.body.data).to.not.have.property('cost');
          done();
        });
    });
  });

  describe('PUT /albums', () => {
    it('should update a Album', (done) => {
      postAlbum((err, res) => {
        const oldAlbum = res.body.data;
        const newAlbumData = makeAlbum();
        chai.request(app)
          .put(`/albums/${oldAlbum._id}`)
          .send(newAlbumData)
          .end((err, res) => {
            expect(res.status).to.equal(200);
            expect(res.body.data).to.deep.include(newAlbumData);
            done();
          });
      });
    });

    it('should not update a Album when id does not exists', (done) => {
      const incorrectId = '123asd123';
      chai.request(app)
        .put(`/albums/${incorrectId}`)
        .send({})
        .end((err, res) => {
          expect(res.status).to.not.equal(200);
          expect(res.body.data).to.equal(undefined);
          done();
        });
    });
  });

  describe('DELETE /albums', () => {
    it('should delete a Album', (done) => {
      // create temp album
      postAlbum((err, res) => {
        const album = res.body.data;

        // make the request to delete the album
        chai.request(app)
          .delete(`/albums/${album._id}`)
          .end((err, res) => {
            expect(res.status).to.equal(204);
            expect(res.body.data).to.equal(undefined);

            // test if the album does not exists anymore
            chai.request(app)
              .get(`/albums/${album._id}`)
              .end((err, res) => {
                expect(res.status).to.not.equal(200);
                expect(res.body.data).to.equal(undefined);
                done();
              });
          });
      });
    });

    it('should faild to delete unexistent album', (done) => {
      const incorrectId = '123asd123';
      chai.request(app)
        .delete(`/albums/${incorrectId}`)
        .send({})
        .end((err, res) => {
          expect(res.status).to.not.equal(200);
          expect(res.body.data).to.equal(undefined);
          done();
        });
    });
  });

  describe('POST /users', () => {
    it('should create a new User', (done) => {
      postUser((err, res) => {
        expect(res.status).to.equal(200);
        // eslint-disable-next-line no-unused-expressions
        expect(res.body.data).to.not.be.empty;
        done();
      });
    });
  });

  describe('POST /purchases', () => {
    it('should create a new Purchase with existent user and album', (done) => {
      // create album
      postAlbum((err, res) => {
        const album = res.body.data;

        // create user
        postUser((req, res) => {
          const user = res.body.data;
          const purchaseData = {
            user: user._id,
            album: album._id,
          };

          chai.request(app)
            .post('/purchases')
            .send(purchaseData)
            .end((err, res) => {
              const purchaseResult = {
                __v: res.body.data.__v,
                _id: res.body.data._id,
                user,
                album,
              };

              expect(res.status).to.equal(200);
              expect(res.body.data).to.deep.equal(purchaseResult);
              done();
            });
        });
      });
    });
  });
});
