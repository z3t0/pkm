import postal from './vendor/postal.js'

var channel = postal.channel();

// subscribe to 'name.change' topics
var subscription = channel.subscribe( "name.change", function ( data ) {
	console.log('name change received', {data})
} );

// And someone publishes a name change:
channel.publish( "name.change", { name : "Dr. Who" } );

export {}
