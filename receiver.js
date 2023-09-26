import * as UDP from 'dgram';

// Import utils.js functions
import * as utils from './utils.js';

// Creating UDP socket (IPv4)
const server = UDP.createSocket('udp4'); // udp6: If you want to create IPv6

// Constants
const PORT = 6500; // Receiver PORT

// Error handler
server.on('error', function(err) {
    utils.log('Server', err); // Display error on terminal

    // Closing the socket if error occured
    server.close();
});


// Receive message(s) from client
server.on('message', function(message, rInfo) {
    utils.log('Server', `
        Message Received:
            IP: ${rInfo.address}:${rInfo.port} [${rInfo.family}]
    `);
});


// Listener
server.on('listening', function() {
    const serverInfo = server.address(); // Getting server socket information
    
    utils.log('Server', `Listening on ${serverInfo.address}:${serverInfo.port}`) // Display server information
});
server.bind(PORT); // Binding PORT for our receiver server