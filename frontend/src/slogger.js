// s(imple)logger
function slogger(opts) {
  let currentLevel = 'debug'
  const tag = opts.tag

  function printLog(level, msg) {
    function formatted() {
      if (msg.length == 1) {
        if (typeof msg[0] == "object") {
          return JSON.stringify(msg)
        }

        return msg
      }

      return JSON.stringify(msg)
    }

    console.log(`[${tag}][${level}]> ` + formatted())
  }

  function debug(...msg) {
    if (currentLevel != 'debug') return

    printLog('debug', msg)
  }

  function info(...msg) {
    printLog('info', msg)
  }

  function warn(...msg) {
    printLog('warn', msg)
  }

  function error(...msg) {
    printLog('error', msg)
  }

  function setLevel(level) {
    currentLevel = level;
  }


  return { debug, info, warn, error, setLevel}
}

export { slogger }
