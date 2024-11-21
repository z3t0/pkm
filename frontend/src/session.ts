import { Database } from "./db/db"
import { User } from "./user.js"

class Session {

  // Singleton
  static _currentSession: Session | null

  private _database: Database | null

  setDatabase(database) {
    this._database = database
  }

  getDatabase() {
    return this._database
  }

  setSessionSingleton () {
    // TODO: Log warning if installing a second time or throw an error.
    Session._currentSession = this

    // DEV Hack
    window.pkmdev = {}
    window.pkmdev.session = Session.getSessionSingleton()
  }

  // If we can reach the cloud db then we are logged in.
  async isLoggedIn(): Promise<boolean>  {
    if (!User.getUsernameFromLocalStorage()) {
      return false
    }

    return this.getDatabase().isCloudReachable()
  }

  // Used for logging out of a user.
  async destroyDatabase() {
    await this.getDatabase().getCloudDb().logOut()
    await this.getDatabase().getLocalDb().destroy()

    this.setDatabase(null)
  }

  async logout () {
    if (!this.isLoggedIn()) return

    await this.destroyDatabase()
    User.setUsernameLocalStorage(null)

    window.location.reload()
  }

  static getSessionSingleton() : Session | null {
    if (!Session._currentSession)  {
      throw new Error("The singleton session has not been initialized")
    }

    return this._currentSession
  }
}

export { Session }