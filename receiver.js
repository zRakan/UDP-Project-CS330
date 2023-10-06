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
let processedPackets = {}; // Contains all processed packets { seqN: true|false }

// Statistics
let delay;

server.on('message', function(message, rInfo) { // Event that triggered if there is a message from sender    
    const messageHeader = message.subarray(0, 9); // Packet header

    const messageContent = message.subarray(9); // Packet content

    const packetType = messageHeader[0]; // Packet type [0x01, 0x02, 0x03] [Data, Ack, Handshake]
    const dataType = messageHeader[8]; // This will only be used in "Data packet" (Metadata || Content)

    const packetSize = messageHeader.subarray(1, 3).readInt16BE(0); // Packet Size (Big-Endian)
    const packetSequence = messageHeader.subarray(3, 8).readInt16LE(0); // Packet sequence (Little-Endian)

    // Display Packet information
    utils.log('Server', `
        Packet Received:
            IP: ${rInfo.address}:${rInfo.port} [${rInfo.family}]
            Packet Type: ${packetType == 0x01 ? `Data Packet ${dataType == 0x01 ? '(Metadata)' : ''}` : 'Handshaking Packet'} ${packetType == 0x01 ? `(Seq #: ${packetSequence})` : ''}
            Packet Size: ${packetSize} bytes

    `);

    if(processedPackets[packetSequence]) { // if duplicated packet
        utils.log('Server', 'Packet is duplicated');
        return;
    }

    switch(packetType) { // Packet types
        case 0x01: // Data Packet
            if(!delay)
                delay = new Date();

            if(dataType == 0x01) { // Metadata of file
                const fileName_OFFSET = messageContent.indexOf('__FILENAME__'); // Getting the OFFSET of fileName
                const fileSize_OFFSET = messageContent.indexOf('__FILESIZE__'); // Getting the OFFSET of fileSize

                const fileName = messageContent.subarray(fileName_OFFSET+12, fileSize_OFFSET).toString('utf8'); // Getting the file name
                const fileSize = messageContent.subarray(fileSize_OFFSET+12).toString('utf8'); // Getting the file size

                // Display File metadata
                utils.log('Server', `
        File Metadata:
            File name: ${fileName}
            File size: ${utils.formatBytes(fileSize)}
`)

                // Creating file stream for writing
                utils.startStream(fileName);

            } else {
                utils.writingStream(messageContent); // Writing stream file

                if(dataType == 0x02) { // Stop writing stream file
                    utils.closeStream();
                    
                    // Display Finished
                    utils.log('Server', `Finished uploading
                        Statistics:
                            Throughput: <>
                            Delay: ${(new Date().getTime() - delay.getTime()) / 1000} second(s)
                    `)
                    
                    processedPackets = {}; // Reset processed packets
                    delay = null; // Reset delay
                }
            }


            // Sending Acknoledgment packet
            const [ackN, acknoledgmentPacket] = createPacket(0x02, Buffer.alloc(0), packetSequence) // Creating ACK packet
            server.send(acknoledgmentPacket, rInfo.port, rInfo.address); // Sending the packet to sender
            processedPackets[packetSequence] = true; // This sequence ID has been processed

            break;
        case 0x03: // Handshake
            const initialSeq = utils.randomNumber(); // Random number [0, 1000]
            const handshakeBuffer = Buffer.from([0x03, initialSeq]); // 0x03 == Handshake Packet type 
            server.send(handshakeBuffer, rInfo.port, rInfo.address); // Send Handshake Packet to sender
            break;
    }
});


// Listener
server.on('listening', function() {
    const serverInfo = server.address(); // Getting server socket information
    
    utils.log('Server', `Listening on ${serverInfo.address}:${serverInfo.port}`) // Display server information
});
server.bind(PORT); // Binding PORT for our receiver server