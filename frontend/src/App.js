import React from "react";
import { useEffect, useState } from "react";
import postal from './vendor/postal.js'
import { ChakraProvider } from '@chakra-ui/react'
import { theme } from "./chakra/theme.js";
import { Button, ButtonGroup } from '@chakra-ui/react'


import "./note/seed_data.js";
import { Window } from "./fwm/window.js"
import { WindowManagerModel } from "./fwm/window_manager_model.js";
import { WindowManagerUI } from "./fwm/window_manager_ui.js";

import { NoteSystem } from "./note/system.js";
import { NotesList } from "./note/list/ui.js"
import { LoginForm } from "./login.js";
import { LogoutButton } from "./logout.tsx";

import "./ObjectLinkOpener.js"

import { slogger } from "./slogger.js";
const l = slogger({tag: 'app' })

NoteSystem().init()
WindowManagerModel().init()

import NoteShell from "./note/shell.js";
import { AppBar } from "./app_bar/app_bar.js";
import { ObjectSearchBar } from "./object_search_bar/object_search_bar.js";

import { Database } from "./db/db.ts";
import { Session } from "./session.ts";

console.log("test new deploy script")

const channel = postal.channel()

function createNoteOnClick() {
  channel.publish("fwm.window_manager",
                  {selector: "open", args: {windowType: "note"}})
}


function handleClick(ev) {
  // Not a link
  if (!ev.target.tagName == 'A') return;

  // does not have a url
  if (!ev.target.href) return;

  const link = ev.target.href

  // not an internal link
  if (!link.startsWith(window.location.origin)) return;
  ev.preventDefault();

  // parse the object id
  const id = link.split('#')[1];

  // HACK: eventually we should be able to open links for non-note objects
  postal.channel().publish("fwm.window_manager",
                           {
                             selector: "open", args: {
                               windowType: "note",
                               windowArgs: { id }
                             }
                           })
}

// Return true if the session/db is valid from
// an existing login.
async function setupApp() {
  const session = new Session()
  session.setSessionSingleton()

  // Check if we are already logged in
  const database = await Database.connectWithExistingSession()

  if (!database) {
    return false;
  }

  database.enableLiveSync()
  session.setDatabase(database)

  return true;
}

function App() {

  const [isLoggedIn, setIsLoggedIn] = useState(null)

  useEffect(() => {
    async function effect() {
      if (isLoggedIn === null) {
        console.log("login state is unknown")

        const isSessionValid = await setupApp()
        setIsLoggedIn(isSessionValid)
      }
    }

    effect()

  },[isLoggedIn])

  if (isLoggedIn === false) {
    return (
      <ChakraProvider theme={theme}>
        <div style={{ maxWidth: "20rem" }}>
          <LoginForm/>
        </div>
      </ChakraProvider>)
  }

  if (isLoggedIn === true) {
    return (
      <div onClick={handleClick}>
        <ChakraProvider theme={theme}>
          <Button colorScheme='blue' onClick={createNoteOnClick}>Create Note</Button>
          <WindowManagerUI />
          <NoteShell />
          <AppBar />
          <ObjectSearchBar />

          <NotesList />
          <LogoutButton />
        </ChakraProvider>
      </div>
    )
  }
}



export default App;