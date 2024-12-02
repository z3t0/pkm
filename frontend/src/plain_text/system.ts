
import postal from "../vendor/postal";
// import { PlainTextEditor } from "./ui.tsx";

class PlainTextSystem {
  private i_channel: any;

  channel() {
    if (!i_channel) {
      i_channel = postal.channel();
    }

    return i_channel
  }

  registerWindowComponentsWithWindowManager() {
    // channel().publish("fwm.window_manager", {
    //   selector: "addWindowType",
    //   args: { name: "plain-text", component: PlainTextEditor }
    // })
  }

  init() {
    // Register window components on startup.

    // Subscribe to requests from the window manager asking for
    // window components. We do this to prevent a temporal dependency
    // window manager has to exist before the apps can register.


  }

  constructor() {
    console.log("plain_text system.ts constructor")
  }

}

export { PlainTextSystem }