import PouchDB from 'pouchdb';
import pouchdbFind from 'pouchdb-find';
import pouchdbAuthentication from 'pouchdb-authentication';

import { Buffer}  from 'buffer'
import { Environment } from "../environment.js"
import { User } from "../user.js";

PouchDB.plugin(pouchdbFind);
PouchDB.plugin(pouchdbAuthentication);

interface CouchDbUserInfo {
  username: string;
  password: string;
  targetCouchDbUrl: string; // host:port
}


class Database {

  _cloudDb: PouchDB.Database;
  _localDb: PouchDB.Database;

  static dbName(username) {
    return 'userdb-' + Buffer.from(username).toString('hex');
  }

  // REFACTOR: rename to remoteDbUrl

  static dbUrlWithHostname(username, hostname) {
    const dbName = Database.dbName(username)
    return hostname + "/" + dbName
  }

  static dbUrl (username) {
    const hostname = (() => {
      if (Environment.isDev()) {
        // FIXME: This should probably be localhost for other devs.
        //        It should default to localhost, with a local
        //        override.
        return "http://rk-devbox1:5984"
      }
      else {
        return "https://db.pkm.venerablesystems.com"
      }
    })()

    return Database.dbUrlWithHostname(username, hostname)
  }

  // The token persists between refreshes.
  // Pouchdb stores the token as a Cookie named "AuthSession"
  // getSession() uses the cookie to connect to the remote database.
  static async isSessionValid(username) {
    let cloudDb = new PouchDB(Database.dbUrl(username), {skip_setup: true});

    const session = await cloudDb.getSession()

    if (session.userCtx.name) {
      return true
    } else {
      return false
    }
  }

  async isCloudReachable() {
    // If we can fetch a doc, we are connected.
    try {
      await this.getCloudDb().allDocs({ limit: 1 });
      return true
    } catch (err) {
      return false
    }

  }

  setCloudDb(pouchDb)  {
    this._cloudDb = pouchDb
  }

  setLocalDb(pouchDb)  {
    this._localDb = pouchDb

    this.createIndexes()
  }

  getCloudDb() {
    return this._cloudDb
  }

  getLocalDb () {
    if (!this._localDb) {
      const db =  new PouchDB("local_pkm")
      this.setLocalDb(db)
    }

    return this._localDb
  }

  sync() {
    const cloud_db = this.getCloudDb()
    const local_db = this.getLocalDb()

    local_db.sync(cloud_db, {live: false, retry: false})
  }

  enableLiveSync() {
    const cloud_db = this.getCloudDb()
    const local_db = this.getLocalDb()

    local_db.sync(cloud_db, {live: true, retry: true})
  }

  replicate(target: CouchDbUserInfo) {

    const { username, password, targetCouchDbUrl } = target


    const targetDb = new PouchDB(Database.dbUrlWithHostname(username,
      targetCouchDbUrl),
                                 { skip_setup: true })

    window.pkmdev.targetDb = targetDb

    // TODO: perform sync after connect
    // login() is provided by pouchdb-authentication
    // @ts-ignore
    targetDb.login(username, password)

    return new Promise((res, rej) => {
      console.log("Attempting replication")

      this.getLocalDb().replicate.to(targetDb, {
        live: false, // One-shot replication
        retry: false // No retries
      }).then(result => {
        console.log('Replication successful:', result);
        res()
      }).catch(error => {
        console.error('Replication failed:', error);
        rej(error)
      });
    })
  }

  createIndexes() {
    const local_db = this.getLocalDb()

    const typeIndexPromise = local_db.createIndex({
      index: { fields: ['type'] }
    });

    const nameIndexPromise = local_db.createIndex({
      index: { fields: ['name'] }
    });

    const contentAsTextIndexPromise = local_db.createIndex({
      index: { fields: ['contentAsText'] }
    });

    const lastUpdatedPromise = local_db.createIndex({
      index: { fields: ['lastUpdated'] }
    });

    Promise.all([typeIndexPromise, nameIndexPromise, contentAsTextIndexPromise,
      lastUpdatedPromise])
      .then(() => {
        console.log("Indexes created successfully");
        return local_db.getIndexes();
      })
      .then((indexes) => {
        console.log(indexes);
      })
      .catch((error) => {
        console.error("Error creating indexes:", error);
      });
}

  static async connectWithExistingSession(): Promise < Database | null > {
  // Get the username from localStorage.
  const username = User.getUsernameFromLocalStorage()

    if (!username)
    {
      console.log("username is not set in the local storage. Don't try to restore an existing session.")
      return null
    }

    const isSessionValid = await Database.isSessionValid(username)

    if (!isSessionValid) {
      console.log("the session is not valid")
      return null
    }

    // The session is valid
    console.log("the session is valid")
    const cloudDb = new PouchDB(Database.dbUrl(username), {skip_setup: true})

    const db = new Database()
    db.setCloudDb(cloudDb)

    if (!db.isCloudReachable()) {
      throw new Error("Cloud db is not reachable after restoring session.")
    }

    console.log(await cloudDb.allDocs())

    return db
  }

  static connect(username, password) {

    let cloudDb = new PouchDB(Database.dbUrl(username), {skip_setup: true});

    // TODO: perform sync after connect
    // TODO: save local state saying the user has logged in
    // login() is provided by pouchdb-authentication
    // @ts-ignore
    cloudDb.login(username, password)

    const db = new Database()

    db.setCloudDb(cloudDb)

    if (!db.isCloudReachable()) {
      throw new Error("Cloud db is not reachable after login")
    }

    return db
  }
}

export { Database } 