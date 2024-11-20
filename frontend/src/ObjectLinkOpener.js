import postal from "./vendor/postal";

// on page load run a function to check if there is a link in the url
document.addEventListener('DOMContentLoaded', function () {

    if (window.location.href.includes('#')) {
        let id = window.location.href.split('#')[1];

        // clear id from browser url
        history.replaceState(null, null, window.location.href.split('#')[0]);

        // TODO: this is a hack, we should wait for the window manager to be ready
        setTimeout(() => {

            console.log("opening note from url: ", id)

            postal.channel().publish("fwm.window_manager",
            {
                selector: "open", args: {
                    windowType: "note",
                    windowArgs: { id }
                }
            }) 
        }, 200)
       
    }
});

