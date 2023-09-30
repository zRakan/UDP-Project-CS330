import * as UDP from 'dgram';

// Import utils.js functions
import * as utils from './utils.js';

// Import createPacket
import { createPacket } from './packet.js';

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
    const messageHeader = message.subarray(0, 9);
    const messageContent = message.subarray(9);

    const packetType = messageHeader[0];
    const packetSequence = messageHeader.subarray(3, 7);

    utils.log('Server', `
        Packet Received:
            IP: ${rInfo.address}:${rInfo.port} [${rInfo.family}]
            Packet Type: ${packetType == 0x01 ? 'Data Packet' : 'Handshaking Packet'} ${packetType == 0x01 && (`(Seq #: ${packetSequence.readInt16LE(0)})`)}

    `);

    switch(packetType) { // Packet types
        case 0x01: // Data
            const dataType = messageHeader[8];
            

            if(dataType == 0x01) { // Metadata of file
                const fileName_OFFSET = messageContent.indexOf('__FILENAME__');
                const fileSize_OFFSET = messageContent.indexOf('__FILESIZE__');

                const fileName = messageContent.subarray(fileName_OFFSET+12, fileSize_OFFSET).toString('utf8');
                const fileSize = messageContent.subarray(fileSize_OFFSET+12).toString('utf8');

                utils.log('Server', `
        File Metadata:
            File name: ${fileName}
            File size: ${utils.formatBytes(fileSize)}
`)

                // Creating file stream for writing
                utils.startStream(fileName);

            } else {
                console.log("Writing process...");

                utils.writingStream(messageContent); // Writing stream file

                if(dataType == 0x02) { // Stop writing stream file
                    utils.closeStream();
                    utils.log('Server', 'Finished uploading ')
                }
            }


            // Sending Acknoledgment packet
            server.send(createPacket(0x02), rInfo.port, rInfo.address);

            break;
        case 0x03: // Handshake
            server.send(Buffer.from([0x03, 0x05]), rInfo.port, rInfo.address); 
            console.log("Test");
            break;
    }
});


// Listener
server.on('listening', function() {
    const serverInfo = server.address(); // Getting server socket information
    
    utils.log('Server', `Listening on ${serverInfo.address}:${serverInfo.port}`) // Display server information
});
server.bind(PORT); // Binding PORT for our receiver server