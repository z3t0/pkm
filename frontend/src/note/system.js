import postal from '../vendor/postal.js'
import React from "react";
import pino from 'pino'

import { Note } from "./editor/ui.js"
import { DestructiveConfirmation } from "./destructiveConfirmation.js";
import { ModelManager } from "./model_manager.js";
import { get } from 'lodash';

const module_id = "pkm.note";
const logger = pino({name: module_id})
logger.level = "debug"

// Registers the Window types provided by the Note module.
function NoteSystem(){
  let i_channel;

  function channel() {
    if (!i_channel) {
      i_channel = postal.channel()
    }

    return i_channel
  }

  function me_windowTypes() {
    logger.debug("me windowTypes")
    channel().publish("fwm.window_manager", {
      selector: "addWindowType",
      args: { name: "note", component: Note }
    })

    // FIXME: window types need to be namespaced from their module
    channel().publish("fwm.window_manager", {
      selector: "addWindowType",
      args: { name: "DestructiveConfirmation", component: DestructiveConfirmation }
    })
  }

  function m_inbox(message) {
    logger.debug("m_inbox", message)
    
    if (message.selector == "getWindowTypes") {
      me_windowTypes()
    }
  }


  function init() {
    logger.debug("initializing note.system")

    me_windowTypes()

    channel().subscribe("fwm.window_manager.ext.windowTypes.get",
                        () => {
                          me_windowTypes()
                        })


  }

  return { init }
}

export { NoteSystem }