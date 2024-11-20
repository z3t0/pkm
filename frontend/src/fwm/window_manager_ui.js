import postal from '../vendor/postal.js'
import React from "react";

import * as util from "../util.js";

import * as module from "./module.js";
import { Window } from "./window.js";
import "./style.css"

import {slogger} from "../slogger.js";
const l = slogger({tag: 'fwm.ui'})
const logger = l

// BUG: The Windows map is not stable, if the windows map changes
//      then we create a new note editor and it starts off blank.
//      then we have an issue because it tries to generate an id.
//      this probably gets called more than once.
//      Easy solution is to always start a note editor with an id
//      but that doesn't solve the re-render issue because the
//      windows map changes and react loses track of the window state.
//      


function WindowManagerUI() {

  const [windows, setWindows] = React.useState(null)
  const [shouldUpdate, setShouldUpdate] = React.useState(false)
  const [channel, setChannel] = React.useState()

  l.debug("render")
  
  React.useEffect(() => {

    l.debug("in effect")

    if (!channel) {
      l.debug("create channel")
      const channel = postal.channel()
      setChannel(channel)
      const topic = module.module_id + ".windows"
      channel.subscribe(topic, (data) => {
        logger.debug("got message on: " + topic)
        logger.debug(JSON.stringify(data))

        setWindows({...data})
      })

      l.debug("subbed to .windows")
    }

  }, [channel]);

  const components= React.useMemo(() => {
    if (!windows) { return null }

    logger.debug("recomputing window components")

    const components = []

    const windowsArr = Object.values(windows)
    windowsArr.map((windowObj) => {
      components.push(windowObj.window)
    })

    return components
  }, [windows])


  return (<div>
            {components}
          </div>)
}

export { WindowManagerUI }