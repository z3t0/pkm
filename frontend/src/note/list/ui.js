import React from "react";
import postal from '../../vendor/postal.js'

import {slogger} from "../../slogger.js";

import * as util from "../../util.js"
import { Heading, Input } from "@chakra-ui/react";
const l = slogger({tag: 'note.list.ui'})
const logger = l

import "./style.css"

import { Session } from "../../session.ts"

function NotesList() {

  const [notes, setNotes] = React.useState(null)
  const [searchTerm, setSearchTerm] = React.useState("");

  const channel = postal.channel()


  const updateNotesList = React.useCallback(() => {
    const session = Session.getSessionSingleton()
    if (!session) return

    const database = session.getDatabase()
    if (!database) return
    const db = database.getLocalDb()


    if (!searchTerm) {
      
      setNotes( db.find({ selector: {type: 'note' }}).docs )
    }

    const regex = new RegExp(searchTerm, 'i');


    db.find({
      selector: {
        type: 'note',
        $or: [
          { name: { $regex: regex } }, // Match in name
          { contentAsText: { $regex: regex } } // Match in contentAsText
        ]
      },
    }).then((result) => {
      const notes = result.docs;
      setNotes(notes);
    }).catch((err) => {
      console.error('Error querying for notes:', err);
    });
  }, [searchTerm])

  // call updateNotesList when searchTerm changes
  React.useEffect(() => {
    updateNotesList()
  }, [searchTerm])

  // TODO: update the notes list over time
  // show all notes on startup
  // FIXME: Race condition.
  //        This should run after the session has been created.
  React.useEffect(() => {

    let isInitialized = false;
    let intervalHandle = null;

    function initSearch() {
      console.log("try init search")
      const session = Session.getSessionSingleton()
      if (!session) return

      const database = session.getDatabase()
      if (!database) return
      const db = database.getLocalDb()

      if (db) {
        updateNotesList()
        clearInterval(intervalHandle)
      }
    }

    intervalHandle = setInterval(initSearch, 100)

  }, []);

  const openNoteInWindow = React.useCallback((e, id) => {
    e.preventDefault()

    l.debug("open note in window: ", id)

    channel.publish("fwm.window_manager",
                    {selector: "open", args: {windowType: "note",
                                              windowArgs: {id}}})
  }, [channel])


  const noteComponents = React.useMemo(() => {
    if (!notes) { return null }


    // Show newly updated notes first
    const sortedNotes = [...notes].sort((a, b) => {
      const dateA = new Date(a.lastUpdated);
      const dateB = new Date(b.lastUpdated);


      if (!a.lastUpdated && !b.lastUpdated) {
        return 0;
      } else if (!a.lastUpdated) {
        return 1;
      } else if (!b.lastUpdated) {
        return -1;
      }

      if (dateB > dateA) { return 1 }
      else if (dateB < dateA) { return -1}

      return 0
    });

    const items = sortedNotes.map((note) => {

      const delta = util.getTimeSince(new Date(note.lastUpdated))
      const lastUpdatedMessage = delta.minutes + "m " + delta.seconds + "s ago"

      return (<li key={note._id}>

                <div data-private className="link-text"
                  onClick={(e) => {
                       openNoteInWindow(e, note._id)}}
                  onTouchEnd={ (e) => {
                       openNoteInWindow(e, note._id)
                  }}>
                  {note.name}
                  <div className="lastUpdatedMessage">
                  {lastUpdatedMessage}
                  </div>
                </div>
              </li>)
    })


    return (<ul>{items}</ul>)

  }, [notes]);

  return (
    <div style={{ marginTop: "1rem", width: "50vw"}}>
      <Heading size="sm">Your Notes</Heading>
      <Input data-private
        placeholder="Search notes"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{ marginTop: "1rem" }}
      />
      <div style={{ overflow: "auto", height: "50vh", width: "50vw"}}>
        {noteComponents}
      </div>
    </div>
  )
}

export { NotesList }