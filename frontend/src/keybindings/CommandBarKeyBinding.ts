import postal from "../vendor/postal";
import { Keybinding } from "./keybinding";

class CommandBarKeyBinding implements Keybinding {

  static matchesEvent(event: KeyboardEvent) {
    return (event.altKey) && event.code === 'KeyX'

  }

  static effect() {
    postal.channel().publish("com.vsi.pkm.appBar",
      {
        selector: "open"
      })
  }
}

export { CommandBarKeyBinding } 