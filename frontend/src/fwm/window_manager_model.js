import postal from '../vendor/postal.js'
import React from "react";


import * as util from "../util.js";
import { Window } from "./window.js";

const module_id = "fwm.window_manager";

import {slogger} from "../slogger.js";
const l = slogger({tag: 'fwm.model'})
const logger = l

l.setLevel("info")

function WindowManagerModel () {
  const BASE_Z_INDEX = 100

  let i_windows;
  let i_windowTypes;
  let i_currentMaxZIndex = BASE_Z_INDEX

  const channel = postal.channel();

  function getWindows() {
    if (!i_windows) {
      i_windows = {}
    }

    return i_windows
  }

  function me(topic, msg) {
    l.debug("me", {topic, msg})
    channel.publish(topic, msg)
  }

  function currentMaxZIndex() {
    return i_currentMaxZIndex
  }

  function setCurrentMaxZIndex(zIndex) {
    i_currentMaxZIndex = zIndex
  }

  function addWindow(id, window, zIndex) {
    getWindows()[id] = {window, zIndex}
    me(module_id + ".windows", i_windows)
  }

  function removeWindow(id) {
    // BUG: The window is not getting removed.
    l.debug("remove window", {id})
    l.debug("before", getWindows())

    delete getWindows()[id]

    l.debug("after", getWindows())

    me(module_id + ".windows", i_windows)
  }

  function getWindowTypes() {
    if (!i_windowTypes) {
      i_windowTypes = new Map();
    }

    return i_windowTypes
  }

  function addWindowType(type, component) {
    logger.debug("added window type", {type, component})

    getWindowTypes().set(type, component)
  }

  function mr_open(args) {
    l.debug("mr_open")
    
    if (args.windowType) {
      const Component = getWindowTypes().get(args.windowType)
      const id = util.uuid()

      l.debug("windowArgs: ", args.windowArgs)

      function closeWindow() {
        removeWindow(id)
      }

      const zIndex = currentMaxZIndex() + 1
      setCurrentMaxZIndex(zIndex)

      const x = args.x
      const y = args.y

      addWindow(id, <Window key={id} id={id}
                      x={x} y={y}
                      zIndex={zIndex} >
                      <Component {...args.windowArgs}
                                 closeWindow={closeWindow}/>
                      </Window>, zIndex)
    }
  }

  function mr_close(id) {
    removeWindow(id)
  }

  function mr_bringToTop(args) {
    const id = args.id
    const windowObj = getWindows()[id];

    if (windowObj) {
      const currentZIndex = windowObj.zIndex;
      const maxZIndex = currentMaxZIndex();

      if (currentZIndex < maxZIndex) {
        const newZIndex = maxZIndex + 1;
        // FIXME: we increase zindex without bound. This might lead
        //        to a bug eventually because browsers might have a max
        //       zindex
        windowObj.zIndex = newZIndex;
        setCurrentMaxZIndex(newZIndex);

        const topic = module_id + ".windows." + id + ".zIndex"
        me(topic, newZIndex);
      }
    }
  }

  function me_windowTypes_get() {
    me(module_id + ".ext.windowTypes.get",
                    {})
  }

  function mr_windowTypes_add({name, component}) {
    addWindowType(name, component)
  }

  function mr_handle(message) {
    logger.debug("mr_handle", {message})

    if (message.selector == "close") {
      mr_close(message.args.id)
      return
    }

    if (message.selector == "open") {
      mr_open(message.args)
      return
    }

    if (message.selector == "addWindowType") {
      mr_windowTypes_add(message.args)
      return
    }

    if (message.selector == "bringToTop") {
      mr_bringToTop(message.args)
      return
    }

    logger.error("unknown message", { message})
  }

  function init() {
    logger.debug("initializing window_manager_model")

    channel.subscribe(module_id + ".open", mr_open)
    channel.subscribe(module_id, mr_handle)

    me_windowTypes_get()
  }

  return {init}


}

export { WindowManagerModel }
         