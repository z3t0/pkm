import { slogger } from "./slogger.js";
import { Database } from "./db/db.ts"

const l = slogger({tag: 'LoginClient' })

class User {
  static currentUser = null;

  static getCurrentUser() {
    return User.currentUser
  }

  static setCurrentUser(user) {
    User.currentUser = user

    return user
  }

  static getUsernameFromLocalStorage() {
    const key = "username"
    const value = localStorage.getItem(key)

    // "null if not set"
    return value
  }

  static setUsernameLocalStorage(username) {
    const key = "username"

    if (username) {
      localStorage.setItem(key, username)
    } else {
      // If blank, clear the username
      localStorage.removeItem(key)
    }
  }

  static login(username, password) {
    const db = new Database.connect(username, password)
    User.setUsernameLocalStorage(username)
  }

  isLoggedIn() {
    const db = currentUser.getDatabase()

    if (db.isCloudReachable()) {
      return true
    }

    return false
  }

}

export { User }
