# pkm

A flexible, browser based note taking app.

It is in early development.

![PKM Screenshot](./docs/pkm_screenshot.png)


## Keybindings
- Alt-x to open the command-bar
- Ctr-o to search for a note

## Features
- Open multiple notes at once
- Real-time syncing between devices
- Rich text editor for notes (quill.js)
- Generate links directly to a note
- Embed links to other notes within a note. 
  - When clicked, the note opens in the same window, preventing a loss of context
- Basic text search 
- Basic command bar for running specific actions
- Basic window manager, allows you to look at multiple notes, searches etc at the same time.

## Design Notes
- Uses couchdb for the database in the cloud, synced to a local pouchdb in the browser.
- There is no need for a backend, we're targetting a p2p architecture
- Thus, the client is the full application.

## Design Principles
- Be fast. Don't frustrate the user by making them wait.
- Keep the infrastructure simple
  - Any user should be able to run the entire application by themselves if they wanted to.
  
## Other notes
- Keep dependencies minimal.
- Testing, documentation, examples are encouraged.


## License
All first-party code in this repo is under AGPLv3 unless otherwise noted.