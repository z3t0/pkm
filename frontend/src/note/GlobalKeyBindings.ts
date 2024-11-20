import { Keybinding } from "../keybindings/keybinding";

class GlobalKeybindings {

  processEvent(event) {
    const matches = this.bindings().filter((keybinding) => {
      if (keybinding.matchesEvent(event)) {
        return true
      }
    })

    if (matches.length == 1) {
      const matchedKeyBinding = matches[0]
      matchedKeyBinding.effect()

    }
  }

  bindings() {
    if (!this._bindings) {
      this._bindings = []
    }

    return this._bindings
  }

  register(keybinding: Keybinding) {
    this.bindings().push(keybinding)
  }
}

export { GlobalKeybindings }