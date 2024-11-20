
import postal from '../vendor/postal.js'

import * as util from "../util.js";

import { NoteModel } from "./model.js";

import {slogger} from "../slogger.js";
const l = slogger({tag: 'note.model_manageri'})
const logger = l

function ModelManager () {
  let i_objects;

  const channel = postal.channel()

  function setObjects(newObjects) {
    i_objects = newObjects;
  }

  function getObjects() {
    logger.warn('deprecated function')
    if (!i_objects) {
      setObjects(new Map())
    }

    return i_objects
  }

  function objects() {
    return getObjects()
  }

  function addObject(id, object) {
    objects().set(id, object)
    logger.debug('added object', {id, object})

    me_note()
  }

  function hasObject(id) {
    return getObjects().has(id)
  }

  // function processEvent(event) {
  //   logger.debug("processEvent", event)
  //   // For every event we see which has event.data.id that is
  //   // unknown, create the object

  //   const ed = event.data

  //   if (!ed.eventType) return;

  //   if (ed.eventType == "note.create") {
  //     return
  //   }

  // }

  function createNoteModel(note) {
    l.debug({...note})
    const model = NoteModel()

    model.construct(note)
    model.init()
    addObject(model.id(), model)

    // subscribe to note changes
    channel.subscribe(`notes.note.${model.id()}.doc`,
                      () => {
                        logger.debug("model_manager got update that name changed on note id: " + model.id())
                        me_note()
                      })

  }

  function me_note() {
    logger.debug("me_note")
    const allNotes = [...getObjects().values()]
    channel.publish("notes.note", allNotes)
  }

  function mr_note_create(message) {
    logger.debug("mr_note_create")
    createNoteModel(message)
  }

  function restoreNoteFromDb(item) {
    l.warn("restoreNoteFromDb", doc)
    const doc = item.doc

    createNoteModel(doc)
  }

  async function initializeFromDb() {
    let gotDocs = false;
    
    // Create note objects on startup from pouchdb
    let sub = channel.subscribe("db.docs.get_r", (docs) => {
      l.debug("mr db.docs.get_r")

      sub.unsubscribe()

      docs.rows.map((item) => {
        restoreNoteFromDb(item)
      })
    })

    while (!gotDocs) {
      channel.publish("db.docs.get")

      await util.sleep(1000)
    }
  }

  async function init() {
    logger.debug('initializing model manager')

    // REFACTOR: rename note to notes?
    channel.subscribe("notes.note.get", () => {
      me_note()
    })

    initializeFromDb()

    channel.subscribe("notes.note.create", mr_note_create)

  }

  return { init }
}

export { ModelManager }