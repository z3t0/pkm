import { NoteModel } from "./model.js";
import postal from '../vendor/postal.js'
import * as util from "../util.js"

const channel = postal.channel();

async function createNote(name, content) {
  const id = util.uuid()

  channel.publish("notes.note.create", {id})

  // wait for object to be created
  await util.sleep(50)
  const t2 = `notes.note.${id}.name.post`
  console.log('publishing', { t2})
  channel.publish(t2, {name})

  // const t1 = `notes.note.${id}.content.post`
  // channel.publish(t1, {content})
}

window.initSeedData = async function() {
  await createNote("Unnamed note 1", "This is a note")
  // await util.sleep(50) // store has race condition right now.
  // await createNote("Unnamed note 2", "This is another note")
}