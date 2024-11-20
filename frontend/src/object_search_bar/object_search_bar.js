
import React, { useEffect } from "react";
import postal from "../vendor/postal";
import { Session } from "../session.ts";


import "./style.css";

const tag = "com.vsi.pkm.objectSearchBar"

function ResultItem (props) {
    const object = props.object

    if (object.type === "note") {
        return <div>{object.name}</div>
    }

    else if (object.type === "class") {
        return <div>{object.className}</div>
    }

}

function getDb() {
  const session = Session.getSessionSingleton()

  if (!session) return

  const database = session.getDatabase()

  if (!database) return

  const localDb = database.getLocalDb()

  return localDb
}


function ObjectSearchBar() {

    const [isActive, setIsActive] = React.useState(false);
    const [objects, setObjects] = React.useState([])
    const [searchTerm, setSearchTerm] = React.useState("");
    const [selectedIndex, setSelectedIndex] = React.useState(0);

    const inputRef = React.useRef(null);

  const updateObjectsList = React.useCallback(() => {
    const db  = getDb()

    if (!db) return

        if (!searchTerm) {
            const objects = find({ selector: {type: 'note' }}).docs

            if (objects) {
                setObjects(objects)
            }
          return
        }
    
      const regex = new RegExp(searchTerm, 'i');

    
        db.find({
          selector: {
            $or: [
              { name: { $regex: regex } }, // Match in name
              { className: { $regex: regex } }, // object code
              { contentAsText: { $regex: regex } } // Match in contentAsText
            ]
          },
        }).then((result) => {
          const objects = result.docs;
          setObjects(objects);
          console.log(objects)
        }).catch((err) => {
          console.error('Error querying for notes:', err);
        });
      }, [searchTerm])

    // call updateNotesList when searchTerm changes
    React.useEffect(() => {
        updateObjectsList()
    }, [searchTerm])

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
        setSelectedIndex((selectedIndex + 1) % objects.length)
    }

    function decreaseSelectedIndex() {
        setSelectedIndex((selectedIndex - 1 + objects.length) % objects.length)
    }

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

    function openNoteInWindow(id) {
        postal.channel().publish("fwm.window_manager",
        {selector: "open", args: {windowType: "note",
                                  windowArgs: {id}}})
    }


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
          e.preventDefault()


          if (objects[selectedIndex]) {
            openNoteInWindow(objects[selectedIndex]._id)
            hideAppBar()
          }
        }
    }


    return (
        <div className="object-search-bar" style={{visibility: isActive ? "visible" : "hidden"}}>
            <input ref={inputRef} type="text" placeholder="Select a note..." 
            onChange={(e) => setSearchTerm(e.target.value)} onKeyDown={handleKeyDown} />
            <div className="results">
                {objects.map((object, idx) => {
                    return <div key={object._id} className={`command ${selectedIndex === idx ? 'selected' : ''}`}>
                        <ResultItem object={object} />
                    </div>
                })}
            </div>
        </div>
    );
}

export { ObjectSearchBar }