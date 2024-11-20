
// TODO: Listen for new events being persisted.
// Pause: Think more about the event architecture
// We have a brief design below, leave it for now. Get back to
// building the MVP.

// - event needs to be persisted
// - events need to be loaded on start
// - interested objects need to be able to submit
//   an event to be persisted
// - interested objects need to know that an event was
//   loaded
// for now assuming an event that is submitedd will always persist
//   successfully
//
// an object will submit an event by sending a message on topic
//   "events.in" {selector: "commit", data: event }
// an object will know an event was posted by listening to
//   "events.out"
//
//  For now assume there is no need to partition the events,
//  let an object listen to all the events.
//  We will explore this as an optimisation problem once we have
//  profiling data and real users.
//
//
// What is an event, we may want a schema around now.
// This is eventSchema version "2023-12-30.1"
// event = {
//   id:
//     uuid(string)
//       unique id for the event
//       only a persisted event will have this
//   schema:
//     eventSchemaVersion(string)
//       event struct needs schemas to allow us to evolve what
//       information is inside an event.
//   created:
//     Date (string)
//       the date when this event object was created.
//       An event is considered created once it is in the store.
//       TODO: Figure out what this means for local vs server (truth)
//             events. The application intends to be designed as
//             occasionally online.
//
//   data:
//     json object
//       this can be anything
// }

// Listen for new objects which need to be created..
// but then we lose messages that need to be sent to them.
// this means we need a create message
// ui me create
//   ui displays "creating..."
//   model manager mr create
//   model manager ec note_create (ee => event commit)
//   model manager ep note_create (er => event persisted)
// ui receives created mr
// ui