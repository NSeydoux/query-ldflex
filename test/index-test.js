import data from '../src';
import auth from 'solid-auth-client';
import ComunicaUpdateEngine from '../src/ComunicaUpdateEngine';
import FindActivityHandler from '../src/FindActivityHandler';
import CreateActivityHandler from '../src/CreateActivityHandler';
import { namedNode } from '@rdfjs/data-model';

jest.mock('../src/ComunicaUpdateEngine');
async function* noResults() { /* empty */ }
ComunicaUpdateEngine.prototype.execute = jest.fn(noResults);

FindActivityHandler.prototype.handle = jest.fn(() => jest.fn());
CreateActivityHandler.prototype.handle = jest.fn(() => jest.fn());

describe('The @solid/ldflex module', () => {
  it('is an ES6 module with a default export', () => {
    expect(require('../src').default).toBe(data);
  });

  it('the default export itself does not identify as an ES6 module', () => {
    expect(data.__esModule).toBeUndefined();
  });

  describe('an URL path', () => {
    const url = 'https://ex.org/#this';

    it('executes the query', async () => {
      await data[url].firstName;
      const { constructor, execute } = ComunicaUpdateEngine.prototype;
      expect(constructor).toHaveBeenCalledTimes(1);
      expect(constructor.mock.calls[0][0]).toEqual(namedNode(url));
      expect(execute).toHaveBeenCalledTimes(1);
      expect(execute).toHaveBeenCalledWith(urlQuery);
    });

    it('can retrieve likes', async () => {
      const activity = 'https://www.w3.org/ns/activitystreams#Like';
      const { handle } = FindActivityHandler.prototype;
      await data[url].likes;
      expect(handle).toHaveBeenCalledTimes(1);
      expect(handle.mock.results[0].value).toHaveBeenCalledTimes(1);
      expect(handle.mock.results[0].value).toHaveBeenCalledWith(activity);
    });

    it('can retrieve dislikes', async () => {
      const activity = 'https://www.w3.org/ns/activitystreams#Dislike';
      const { handle } = FindActivityHandler.prototype;
      await data[url].dislikes;
      expect(handle).toHaveBeenCalledTimes(1);
      expect(handle.mock.results[0].value).toHaveBeenCalledTimes(1);
      expect(handle.mock.results[0].value).toHaveBeenCalledWith(activity);
    });

    it('can retrieve follows', async () => {
      const activity = 'https://www.w3.org/ns/activitystreams#Follow';
      const { handle } = FindActivityHandler.prototype;
      await data[url].follows;
      expect(handle).toHaveBeenCalledTimes(1);
      expect(handle.mock.results[0].value).toHaveBeenCalledTimes(1);
      expect(handle.mock.results[0].value).toHaveBeenCalledWith(activity);
    });

    it('can create likes', async () => {
      const activity = 'https://www.w3.org/ns/activitystreams#Like';
      const { handle } = CreateActivityHandler.prototype;
      await data[url].like();
      expect(handle).toHaveBeenCalledTimes(1);
      expect(handle.mock.results[0].value).toHaveBeenCalledTimes(1);
      expect(handle.mock.results[0].value).toHaveBeenCalledWith(activity);
    });

    it('can create dislikes', async () => {
      const activity = 'https://www.w3.org/ns/activitystreams#Dislike';
      const { handle } = CreateActivityHandler.prototype;
      await data[url].dislike();
      expect(handle).toHaveBeenCalledTimes(1);
      expect(handle.mock.results[0].value).toHaveBeenCalledTimes(1);
      expect(handle.mock.results[0].value).toHaveBeenCalledWith(activity);
    });

    it('can create follows', async () => {
      const activity = 'https://www.w3.org/ns/activitystreams#Follow';
      const { handle } = CreateActivityHandler.prototype;
      await data[url].follow();
      expect(handle).toHaveBeenCalledTimes(1);
      expect(handle.mock.results[0].value).toHaveBeenCalledTimes(1);
      expect(handle.mock.results[0].value).toHaveBeenCalledWith(activity);
    });
  });

  describe('the user path', () => {
    describe('when not logged in', () => {
      it('throws an error', async () => {
        await expect(data.user.firstName).rejects
          .toThrow('Cannot resolve user path: no user logged in');
      });
    });

    describe('when logged in', () => {
      const webId = 'https://ex.org/#me';
      beforeEach(async () => {
        auth.currentSession.mockReturnValue({ webId });
        await data.user.firstName;
      });

      it('executes the query', async () => {
        const { constructor, execute } = ComunicaUpdateEngine.prototype;
        expect(constructor).toHaveBeenCalledTimes(1);
        await expect(constructor.mock.calls[0][0]).resolves.toEqual(namedNode(webId));
        expect(execute).toHaveBeenCalledTimes(1);
        expect(execute).toHaveBeenCalledWith(userQuery);
      });
    });
  });

  describe('the resolve path', () => {
    it('resolves to the root when no expression is passed', () => {
      expect(data.resolve()).toBe(data);
    });
  });

  describe('the root path', () => {
    it('resolves to the root', () => {
      expect(data.user.root.root.user.root).toBe(data);
    });
  });

  describe('the clearCache path', () => {
    it('returns a function to clear the cache', () => {
      const document = {};
      data.clearCache(document);
      expect(ComunicaUpdateEngine.prototype.clearCache).toHaveBeenCalledTimes(1);
      expect(ComunicaUpdateEngine.prototype.clearCache).toHaveBeenCalledWith(document);
    });
  });
});

const urlQuery = `SELECT ?firstName WHERE {
  <https://ex.org/#this> <http://xmlns.com/foaf/0.1/givenName> ?firstName.
}`;

const userQuery = `SELECT ?firstName WHERE {
  <https://ex.org/#me> <http://xmlns.com/foaf/0.1/givenName> ?firstName.
}`;
