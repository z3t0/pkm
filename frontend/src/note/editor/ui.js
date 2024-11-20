import React, { useEffect } from "react";

import { Input } from "@chakra-ui/input"
import { Badge, Button } from '@chakra-ui/react'
import * as util from "../../util.js";
import { NoteModel } from "../model.js";

import Quill from 'quill';
import 'quill/dist/quill.snow.css';
import * as MarkdownShortcuts from 'quill-markdown-shortcuts';

import Delta from 'quill-delta';

Quill.register('modules/markdownShortcuts', MarkdownShortcuts);

import postal from '../../vendor/postal.js'

import "./style.css"
import { slogger } from "../../slogger.js";
import { IconButton } from "@chakra-ui/react";
import { LinkIcon } from "@chakra-ui/icons";
import { last } from "lodash";

const l = slogger({ tag: 'note.ui' })
const logger = l
l.setLevel('info')

function syncInterval() {
  return 200;
}

function Note(props) {
  const [name, setName] = React.useState(null)

  const nameInput = React.useRef(null)
  const modelRef = React.useRef(null)

  const [lastUpdated, setLastUpdated] = React.useState(null)
  const [lastUpdatedMessage, setLastUpdatedMessage] = React.useState(null)

  const lastKnownRev = React.useRef(null)

  // used to force re-render
  const [hack, setHack] = React.useState(0)

  const createNoteOnClick = React.useCallback(() => {
    if (modelRef.current) { l.error("model already exists") }

    const model = NoteModel({ name, content: getContents() })
    model.init()
    logger.debug("setting model for a new note")
    setModelRef(model)
  }, [modelRef, name])

  function deleteNoteOnClick() {

    // Confirmation callbacks
    async function deleteAction() {
      if (!modelRef.current) {
        throw new Error("delete faield missing modelRef")
        return
      }

      try {
        await modelRef.current.remove()
      } catch (err) {
        l.error("failed to remove", err)
      }
    }

    function cancelAction() {
    }

    // Confirmation dialog
    // FIXME: channel is leaking and should be cleared?
    const channel = postal.channel();
    channel.publish("fwm.window_manager",
                    {selector: "open",
                     args: {windowType: "DestructiveConfirmation",
                            windowArgs: {
                              title: "Are you sure you want to delete this note?",
                              message: "Note: " + name,
                              destructiveText: "Delete",
                              safeText: "Go back",
                              destructiveCallback: deleteAction,
                              safeCallback: cancelAction
                            }}})
  }

  function setLastKnownRev(newRev) {
    lastKnownRev.current = newRev
  }

  function getLastKnownRev() {
    return lastKnownRev.current
  }

  function enableSync() {
    if (!modelRef.current) return

    let model = modelRef.current

    l.debug('enable sync')

    // sync model to ui
    // eg if other sessions or windows are editing the same
    // doc
    model.ee().on('change', () => {
      l.debug('updating ui from model')

      if (model.lastUpdated()) {
        setLastUpdated(new Date(model.lastUpdated()))
      }

      // only update name if it is an incoming change, not a known
      // change.
      if (model.rev() != getLastKnownRev()) {
        setName(model.name())
      }

      setContents(model.content(), false, model.rev())
      setLastKnownRev(model.rev())
    })

    // if model is removed
    model.ee().on('remove', () => {
      props.closeWindow()
    })
  }

  function setModelRef(newRef) {
    if (modelRef.current) {
      l.debug("modelRef already set")
      return
    }

    modelRef.current = newRef
    enableSync()
    setHack(hack + 1)
  }

  // Iniiialize the model
  React.useEffect(() => {
    if (modelRef.current) {
      return
    }

    if (props.id) {
      // We are an existing note, initialize model from db
      async function initModel() {
        const newModel = NoteModel({ _id: props.id })
        await newModel.init()

        // for some reason the setModel is just setting to {} instead of the object that it should be

        setModelRef(newModel)
        setName(newModel.name())
        setLastKnownRev(newModel.rev())
        setContents(newModel.content(), true, newModel.rev())

        if (modelRef.current.lastUpdated()) {
          setLastUpdated(new Date(modelRef.current.lastUpdated()))
        }
      }

      initModel()
    } else {
      // We are a new note, set placeholders
      setContents("")
      setName("")

      nameInput.current.focus()
    }
  }, [setName, props.id])

  // don't try to memoize this over model yet, it doesn't work.
  const onContentChanged = React.useCallback((quillJsDelta) => {
    // do nothing for now.
    // if (modelRef.current) {
    //   modelRef.current.setContent(quillJsDelta);
    // }
  })

  // TODO: memoize with useCallback
  function onNameChanged(event) {
    const newVal = event.target.value
    setName(newVal)

    // probably delete this code
    // if (modelRef.current) {
    //   modelRef.current.setName(newVal)
    // }
  }

  function getText() {
    throw new Error("deprecated function")
  }

  // Returns a quilljs delta
  function getContents() {
    if (quillInstanceRef.current) {
      return quillInstanceRef.current.getContents()
    }
  }

  function setContents(quillJsDelta, initialLoad, newRev) {
    if (!quillInstanceRef.current) return

    // save cursor
    const selection = quillInstanceRef.current.getSelection()

    if (!quillJsDelta.hasOwnProperty('ops')) {
      // This is a plaintext note so save it using setText()
      // This is needed because earlier versions of notes were saved
      // as plaintext using quilljs.getText() instead of getContents().
      // When this note is next saved it will use getContents()
      // Eventually all the notes will be upgrade to using quilljs
      // delta
      // a quiljs delta object
      if (modelRef.current) {
        l.debug("upgrading note to delta id: " + modelRef.current.id())
      }
      quillInstanceRef.current.setText(quillJsDelta)
    } else {

      // drop this arg bc if rev=null then we are doing initial load
      if (initialLoad) {
        // ignore latestDelta and just set the contents
        quillInstanceRef.current.setContents(quillJsDelta)
      }

      else {
        // handle delta on 'changes' from db

        // this is our known change, assuming next save will persist new changes.
        if (getLastKnownRev() == newRev) {
          // do nothing, we already know about this change because
          // we made it.
        }

        else {
          // merge incoming change from other object/session.
          setLastKnownRev(newRev)
          const persistedDelta = new Delta(quillJsDelta)
          const latestDelta = quillInstanceRef.current.getContents()

          let deltaDifference = latestDelta.diff(persistedDelta);
          let updatedDelta = latestDelta.compose(deltaDifference);

          quillInstanceRef.current.setContents(updatedDelta)
        }
      }
    }

    if (selection) {
      quillInstanceRef.current.setSelection(selection.index, selection.length);
    }
  }

  function setContent(newValue) {
    throw new Error("deprecated function")
   //  if (quillInstanceRef.current) {
   //    const currentContent = getContents()
   //    if (currentContent !== newValue) {
   //      quillInstanceRef.current.set(newValue)
   //    }
   // }
  }

  const quillRef = React.useRef(null);
  const quillInstanceRef = React.useRef(null);

  React.useEffect(() => {
    if (!quillInstanceRef.current) {
      quillInstanceRef.current = new Quill(quillRef.current, {
        theme: 'snow',
        modules: {
          toolbar: [
            [{ 'header': [1, 2, 3, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'list': 'check'}],
            ['link', 'image'],
            [{ 'color': [] }, { 'background': [] }],
            [{ 'align': [] }],
            ['clean']
          ],
          markdownShortcuts: {}
        },
      });

      quillInstanceRef.current.on('text-change', () => {
        const newContents = quillInstanceRef.current.getContents();


        onContentChanged(newContents);
      });
    }
  }, [onContentChanged]);

  function copyLinkOnClick() {
    const link = modelRef.current.link();

    if (!navigator.clipboard) {
      console.error("Your browser does not support copying to clipboard");

      if (util.isDev) {
        console.log(link)
      }

      return;
    }

    navigator.clipboard.writeText(link)
      .catch((error) => {
        console.error('Failed to copy link to clipboard:', error);
      });
  }

  // FIXME: don't use hack to track changes to modelRef.current
  useEffect(() => {
    if (!modelRef.current) return

    const handle = setInterval(save, syncInterval())

    return () => {
      clearInterval(handle)
    }
  },[hack])

  async function save() {
    let model = modelRef.current

    if (!model) { return }

    model.setName(nameInput.current.value)
    model.setContent(getContents())
    model.setContentAsText(quillInstanceRef.current.getText())


    const res = await model.save()
    if (res) {
      setLastKnownRev(res.rev)
    }
  }

  useEffect(() => {

    if (!lastUpdated) return

    function updateLastUpdatedMessage() {
      const delta = util.getTimeSince(lastUpdated)
      setLastUpdatedMessage(delta.minutes + "m " + delta.seconds + "s ago")
    }

    updateLastUpdatedMessage()
    const handle = setInterval(updateLastUpdatedMessage, 5000)

    return () => {
      clearInterval(handle)
    }
  }, [lastUpdated])


  return (
    <div className="note-wrapper">
      <div className="note-container">
        <div className="note-name-input">
          <Input data-private ref={nameInput} placeholder="New Note" value={(name != undefined) ? name : "Loading..."}
                 onChange={onNameChanged}/>
        </div>
        <div data-private className="note-content-editor" >
          <div ref={quillRef}>
          </div>
        </div>
      </div>
      <div className="note-footer">
        {modelRef.current ?
        <>
          <div className="note-delete-btn">
            <Button colorScheme='red' onClick={deleteNoteOnClick}>Delete</Button>
          </div>

          <IconButton
            icon={<LinkIcon />}
            colorScheme="blue"
            onClick={copyLinkOnClick}
          />

          <Badge colorScheme="green">Saved {lastUpdatedMessage}</Badge>
          </>
          :
          <div className="note-create-btn">
            <Button colorScheme='blue' onClick={createNoteOnClick}>Create</Button>
          </div>}
      </div>
    </div>
  );
}

export { Note }