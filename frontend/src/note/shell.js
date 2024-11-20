// Used to setup and initialize certain components specific
// to the note module.
// Such as keybindings.

import React from 'react';
import { useEffect, useState } from 'react';
import postal from '../vendor/postal';
import { GlobalKeybindings } from "./GlobalKeyBindings.ts"
import { CommandBarKeyBinding } from "../keybindings/CommandBarKeyBinding.ts";


function isOpenKeyBinding(event) {
  return event.altKey && event.code === 'KeyN'
}

function isObjectSearchBarEvent(event) {
  return (event.ctrlKey) && event.code === 'KeyO'
}

function newNoteEmit(event, x, y) {

  postal.channel().publish("fwm.window_manager",
    {
      selector: "open", args: {
        windowType: "note",
        x, y
      }
    })
}

function openObjectSearchBar() {
  postal.channel().publish("com.vsi.pkm.objectSearchBar",
    {
      selector: "open"
    })
}

const globalKeyBindings = new GlobalKeybindings()
globalKeyBindings.register(CommandBarKeyBinding)

function NoteShell() {
  const mousePosition = React.useRef(mousePosition);

  // BUG: Multi key keybindings do not work properly.
  //      It works if you type alt and x at the same time, not if you
  //      type alt then x in quick succession.
  //      - might have something to do with using the keyup.

  function handleKeyEvent(event) {

    globalKeyBindings.processEvent(event)

    if (isOpenKeyBinding(event)) {

      const x = mousePosition.current ? mousePosition.current.x : 0;
      const y = mousePosition.current ? mousePosition.current.y : 0;

      newNoteEmit(event, x, y);
    }

    if (isObjectSearchBarEvent(event)) {
      openObjectSearchBar();
    }
  }

  const handleMouseMove = React.useCallback((event) => {
    mousePosition.current = { x: event.clientX, y: event.clientY };
  }, []);

  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
    }
  }, [handleMouseMove]);

  useEffect(() => {
    // Register keybinding for alt-n
    document.addEventListener('keyup', handleKeyEvent);

    // Clean up the event listeners
    return () => {
      document.removeEventListener('keyup', handleKeyEvent);
    };
  }, []);

  return null;
}

export default NoteShell