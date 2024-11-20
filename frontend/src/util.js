import { v4 } from 'uuid';
import localforage from 'localforage'
import postal from './vendor/postal.js'

import {slogger} from "./slogger.js";
const l = slogger({tag: 'util'})
const logger = l


function uuid() {
  return v4()
}

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve()
    }, ms)
  })
}

function isDev() {
  // REFACTOR: moved to env.js
  const devUrls =  ['localhost', 'rk-devbox1']
  return devUrls.includes(window.location.hostname)
}

function getTimeSince(date) {
  const now = new Date();
  const diff = Math.abs(now - date);
  const minutes = Math.floor(diff / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);
  return { minutes, seconds };
}


export { sleep, uuid, isDev, getTimeSince }
