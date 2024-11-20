// fwm - floating window manager

import React, { useEffect } from "react";
import postal from '../vendor/postal.js'

import { slogger } from "../slogger.js";

const l = slogger({ tag: 'fwm.window' })
const logger = l

l.setLevel('info')


function Window(props) {

  const [x, setX] = React.useState(props.x || 0)
  const [y, setY] = React.useState(props.y || 0)
  const [width, setWidth] = React.useState(400)
  const [height, setHeight] = React.useState(500)
  const [zIndex, setZIndex] = React.useState(props.zIndex)

  const [isMoving, setIsMoving] = React.useState(false)


  const [initialMouseX, setInitialMouseX] = React.useState(0);
  const [initialMouseY, setInitialMouseY] = React.useState(0);

  const [initialTouchX, setInitialTouchX] = React.useState(0);
  const [initialTouchY, setInitialTouchY] = React.useState(0);

  const [initialWindowX, setInitialWindowX] = React.useState(0);
  const [initialWindowY, setInitialWindowY] = React.useState(0);


  const [isResizing, setIsResizing] = React.useState(false)
  const [initialWidth, setInitialWidth] = React.useState(width)
  const [initialHeight, setInitialHeight] = React.useState(height)

  // BUG: If you move the window around too much it freezes the
  //      app.

  // Window header dragging
  React.useEffect(() => {
    function onMouseMove(ev) {
      ev.preventDefault()
      if (isMoving) {
        logger.debug('onMouseMove');

        const offsetX = ev.clientX - initialMouseX;
        const offsetY = ev.clientY - initialMouseY;

        setX(initialWindowX + offsetX);
        setY(initialWindowY + offsetY);

        logger.debug(ev.clientX, ev.clientY);
        logger.debug(offsetX, offsetY);
      }
    }

    function onMouseUp(ev) {
      ev.preventDefault()
      logger.debug('onMouseUp');
      setIsMoving(false);
    }

    function onTouchMove(ev) {
      ev.preventDefault()
      if (isMoving) {
        logger.debug('onTouchMove');

        const offsetX = ev.touches[0].clientX - initialTouchX;
        const offsetY = ev.touches[0].clientY - initialTouchY;

        const newX = initialWindowX + offsetX
        const newY = initialWindowY + offsetY

        l.debug("touch new", newX, newY)

        setX(newX)
        setY(newY)
      }
    }

    function onTouchEnd(ev) {
      if (isMoving) {
        logger.debug('onTouchEnd');
        setIsMoving(false);
      }
    }

    if (isMoving) {
      document.addEventListener("mousemove", onMouseMove), { passive: false };
      document.addEventListener("mouseup", onMouseUp, { passive: false });

      document.addEventListener("touchmove", onTouchMove), { passive: false };
      document.addEventListener("touchend", onTouchEnd, { passive: false });
    } else {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);

      document.removeEventListener("touchmove", onTouchMove);
      document.removeEventListener("touchend", onTouchEnd);
    }

    return () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);


      document.removeEventListener("touchmove", onTouchMove);
      document.removeEventListener("touchup", onTouchEnd);
    };
  }, [isMoving, initialMouseX, initialMouseY, initialWindowX, initialWindowY]);

  function onMouseDown(ev) {
    ev.preventDefault()
    console.log('onMouseDown');
    setIsMoving(true);

    // Set initial positions
    setInitialMouseX(ev.clientX);
    setInitialMouseY(ev.clientY);
    setInitialWindowX(x);
    setInitialWindowY(y);
  }


  // BUG: Delay on touch start sometimes
  function onTouchStart(ev) {
    console.log('header toouchstart');
    setIsMoving(true);

    l.debug(ev.clientX, ev.clientY, x, y,
      ev.touches[0].clientX, ev.touches[0].clientY)

    // Set initial positions
    setInitialTouchX(ev.touches[0].clientX);
    setInitialTouchY(ev.touches[0].clientY);
    setInitialWindowX(x);
    setInitialWindowY(y);
  }

  // refactor: probably rewrite these using refs instead of use state
  // Window corner resizing
  React.useEffect(() => {
    // function onMouseMove(ev) {
    //   ev.preventDefault()
    //   if (isMoving) {
    //     logger.debug('resizeMouseMove');

    //     const offsetX = ev.clientX - initialMouseX;
    //     const offsetY = ev.clientY - initialMouseY;

    //     setX(initialWindowX + offsetX);
    //     setY(initialWindowY + offsetY);

    //     logger.debug(ev.clientX, ev.clientY);
    //     logger.debug(offsetX, offsetY);
    //   }
    // }

    function onMouseUp(ev) {
      ev.preventDefault()
      logger.debug('resizeMouseUp');
      setIsResizing(false);
    }

    function onMouseMove(ev) {
      if (!isResizing) return;
  
      console.log('onResizeMove');
      const newWidth = initialWidth + (ev.clientX - initialMouseX);
      const newHeight = initialHeight + (ev.clientY - initialMouseY);
  
      console.log(newWidth, newHeight);
      setWidth(newWidth)
      setHeight(newHeight)
  
    }


    function onMouseUp(ev) {
      setIsResizing(false);
    }


    if (isResizing) {
      document.addEventListener("mousemove", onMouseMove), { passive: false };
      document.addEventListener("mouseup", onMouseUp, { passive: false });

      // document.addEventListener("touchmove", onTouchMove), { passive: false };
      // document.addEventListener("touchend", onTouchEnd, { passive: false });
    }

    return () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);


      // document.removeEventListener("touchmove", onTouchMove);
      // document.removeEventListener("touchup", onTouchEnd);
    };
  }, [isResizing, initialMouseX, initialMouseY, width, height, initialWidth, initialHeight]);

 


  function onResizeStart(ev) {
    ev.preventDefault()
    console.log('onResizeStart');
    setIsResizing(true);

    setInitialWidth(width)
    setInitialHeight(height)
    setInitialMouseX(ev.clientX);
    setInitialMouseY(ev.clientY);

  }


  const closeWindowOnClick = React.useCallback(() => {
    const channel = postal.channel();

    channel.publish("fwm.window_manager",
      { selector: "close", args: { id: props.id } })
  }, [props.id])

  useEffect(() => {
    const topic = `fwm.window_manager.windows.${props.id}.zIndex`

    const subscription = postal.channel().subscribe(topic, (data) => {
      setZIndex(data)
    })

    return () => {
      subscription.unsubscribe()
    }

  }, [props.id])


  function bringToTop() {
    const channel = postal.channel();

    channel.publish("fwm.window_manager",
      { selector: "bringToTop", args: { id: props.id } })
  }
  
  return (<div className="windowContainer"
    style={{ left: x, top: y, zIndex: zIndex, height: height + "px", width: width + "px"}}
    key={props.id} onMouseDown={bringToTop} >
    <div className="windowHeader"
      onMouseDown={onMouseDown}
      onTouchStart={onTouchStart}
    >
      <div className="title"></div>
      <div className="close-btn" onClick={closeWindowOnClick}
        onTouchEnd={closeWindowOnClick}>x</div>
    </div>
    <div className="windowContent">
      {props.children}
    </div>

    <div onMouseDown={onResizeStart}
      style={{
        position: 'absolute',
        right: 0, bottom: 0,
        width: '10px', height: '10px',
        cursor: 'nwse-resize',
        backgroundColor: 'red'
      }}
    />
  </div>)
}

export { Window }