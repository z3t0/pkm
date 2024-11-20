import * as util from "../util.js";
import postal from '../vendor/postal.js'

import { EventEmitter } from "events"
import {slogger} from "../slogger.js";
import { Session } from "../session.ts";

const l = slogger({tag: 'note.model'})

l.setLevel('debug')


// REFACTOR: Deprecate getProp(), setProp() in favor of prop()
//           and iw_prop() -> instance write prop

function NoteModel (args) {
  // backed by a document
  // REFACTOR: merge state backed in db to var named "doc"

  const db = Session.getSessionSingleton().getDatabase().getLocalDb()

  let dbLastDoc = {}

  let state = {}
  let i_rev = null
  let i_lastUpdated = null
  let i_ee = new EventEmitter()

  const channel = postal.channel();

  function setDbLastDoc(doc) { dbLastDoc = doc}

  function docType() { return 'note' }

  // bug: we are using a different id each time this is instantiated
  //      we need to do a create object from disk on boot to have an
  //      id to begin with
  function getId() {
    l.warn("deprecated function, use id()")

    return id()

  }

  function setId(id) {
    setState({...state, id: id})
  }

  function id() {
    return state.id
  }

  function prefix () {
    return `notes.note.${id()}`
  }

  function setState(newState) {

    state = newState
  }

  function setContent(content) {
    setState({...state, content: content})

  }

  // Used for search
  function setContentAsText(content) {
    setState({...state, contentAsText: content})
  }

  function contentAsText() {
    return state.contentAsText
  }

  function content() {
    return state.content
  }

  function setName(name) {
    setState({...state, name: name})
  }

  function name() {
    return state.name
  }

  function rev() {
    return i_rev
  }
  
  function setRev(rev) {
    i_rev = rev
  }

  function lastUpdated() {
    return i_lastUpdated
  }

  function setLastUpdated(lastUpdated) {
    i_lastUpdated = lastUpdated
  }

  function subscribeToDbChanges() {

    function onChange(change) {
      const doc = change.doc

      if (doc._deleted) {
        ee().emit('remove')
      }

      setName(doc.name)
      setContent(doc.content)
      setContentAsText(doc.contentAsText)
      setRev(doc._rev)

      if (doc.lastUpdated) {
        setLastUpdated(new Date(doc.lastUpdated))
      }

      setDbLastDoc(doc)

      ee().emit('change')
    }

    const filterFunction = (change) => {
      return change._id === id();
    };

    const changes = db.changes({
      since: 'now',
      live: true,
      filter: filterFunction,
      include_docs: true
    });

    changes.on('change', (change) => {
      onChange(change);
    });

    changes.on('error', (err) => {
      console.error('Error in change feed:', err);
    });

    return () => {
      changes.cancel();
    };
  }

  async function loadFromDb() {
    const doc = await db.get(id())

    console.log(doc)
    
    setName(doc.name)
    setContent(doc.content)
    setContentAsText(doc.contentAsText)
    setRev(doc._rev)

    if (doc.lastUpdated) {
      setLastUpdated(new Date(doc.lastUpdated))
    }

    setDbLastDoc(doc)
  }

  async function init() {

    if (id()) {
      await loadFromDb()
    }

    else {
      setId(util.uuid())
    }

    subscribeToDbChanges()

    await save()

  }

  async function remove() {

    const newDoc = {_id: id(), _rev: rev(), type: docType(),
                    name: name(), content: content() }

    db.put({...newDoc, _deleted: true})

    ee().emit("remove")
  }

  function hasChanged() {

    function hasNameChanged() {
      return name() !== dbLastDoc.name
    }

    function hasContentChanged() {
      // serialize content to remove any js class objects
      return JSON.stringify(content()) !== JSON.stringify(dbLastDoc.content)
    }

    return hasNameChanged() || hasContentChanged()
  }

  async function save() {


    if (!hasChanged()) {
      //console.log("skip save, no changes")
      return
    }

    const newDoc = {_id: id(), _rev: rev(), type: docType(),
                    name: name(), content: content(),
                    contentAsText: contentAsText(), lastUpdated: (new Date()).toISOString()}
    return await db.put(newDoc)
  }

  function ee() {
    return i_ee
  }
  
  // A link for now is just internal to the single user.
  // so it can be represented by the id of the note.
  function link() {
    return window.location.href + "#" + id()
  }

  function constructor(note) {
    if (note._id) {
      setId(note._id)
    }

    if (note.content) { setContent(note.content)}
    if (note.name) { setName(note.name)}
    if (note._rev) { setRev(note._rev) }


    return { init, getId, id,
             name, content, setName, setContent,
             save, remove,

             rev,

             setContentAsText,
             lastUpdated,

             link,

             ee }
  }
  

  return constructor(args)
}

export { NoteModel }
