class Environment {
  static isDev() {
    const devUrls =  ['localhost', 'rk-devbox1']
    return devUrls.includes(window.location.hostname)
  }
  
}

export { Environment };