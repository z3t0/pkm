interface Keybinding {
  static matchesEvent(): boolean
  static effect()
}

export { Keybinding }