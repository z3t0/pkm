import React, { useEffect } from "react";
import postal from "../vendor/postal";


import "./style.css";

const tag = "com.vsi.pkm.appBar"


function commandEntry(label, callback) {
    return {label, callback}
}

const commands = [commandEntry("New Note", () => {
    postal.channel().publish("fwm.window_manager",
        {
            selector: "open", args: {
                windowType: "note"
            }
        })
}),

commandEntry("Open Note", () => {
    postal.channel().publish("com.vsi.pkm.objectSearchBar",
    {
        selector: "open"
    })
})
]

function AppBar() {

    const [isActive, setIsActive] = React.useState(false);
    const [searchTerm, setSearchTerm] = React.useState("");
    const [selectedIndex, setSelectedIndex] = React.useState(0);

    const inputRef = React.useRef(null);

    useEffect(() => {
        const subscription = postal.channel().subscribe(tag, (msg) => {
            if (!msg.selector) return;

            if (msg.selector === "open") {
                setIsActive(true)
                setTimeout(() => {
                    inputRef.current.focus()
                }, 0)
            }
          })

          return () => {
            subscription.unsubscribe()
          }
    }, [])

    function resetSelectedIndex() {
        setSelectedIndex(0)
    }

    function increaseSelectedIndex() {
        setSelectedIndex((selectedIndex + 1) % filteredCommands.length)
    }

    function decreaseSelectedIndex() {
        setSelectedIndex((selectedIndex - 1 + filteredCommands.length) % filteredCommands.length)
    }

    function computeFilteredCommands () {
        if (!inputRef.current) return []

        return commands.filter((command) => {
            return command.label.toLowerCase().includes(searchTerm)
        })

    }

    const filteredCommands = computeFilteredCommands()

    function hideAppBar() {
        setIsActive(false)
    }

    // Hide the command bar when the user clicks outside of it.
    useEffect(() => {
        function handleClickOutside(event) {
            if (inputRef.current && !inputRef.current.contains(event.target)) {
                hideAppBar()
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);


    function handleKeyDown(e) {
        if (e.key === "Escape") {
            hideAppBar();
        }

        if (e.key === "ArrowDown") {
            increaseSelectedIndex()
        }

        if (e.key === "ArrowUp") {
            decreaseSelectedIndex()
        }

      if (e.key === "Enter") {
        if (filteredCommands[selectedIndex]) {
          filteredCommands[selectedIndex].callback()
          hideAppBar()

        }
      }
    }

    return (
        <div className="app-bar" style={{visibility: isActive ? "visible" : "hidden"}}>
            <input ref={inputRef} type="text" placeholder="Select a command..." 
            onChange={(e) => setSearchTerm(e.target.value)} onKeyDown={handleKeyDown} />
            <div className="commands">
                {filteredCommands.map((command, idx) => {
                    return <div key={command.label} className={`command ${selectedIndex === idx ? 'selected' : ''}`}
                    
                    onClick={command.callback}>{command.label}</div>
                })}
            </div>
        </div>
    );
}

export { AppBar }