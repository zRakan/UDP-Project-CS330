// Import arguments initializer
import { default as createArguments } from './initialize_arguments.js';

// Import utils
import { log, wait, readFile, splitFile, terminate } from './utils.js';

// Import packet utilities
import { createPacket, setSeq } from './packet.js';


// Checking arguments
const args = process.argv.slice(2);
const [IP, rPORT, filePath] = createArguments(args); // Creating arguments based on command-line

// Import datagram UDP socket
import * as UDP from 'dgram';
import { Buffer } from 'node:buffer';

// Creating UDP client
const PORT = 6000; // Client PORT

const client = UDP.createSocket('udp4'); // Creating socket

// Receive messages from Receiver [ACKs, Handshake]
let receivedAck = {}; // Acknowledgment received or not
let isAccepted = false; // Handshake acception

client.on('message', function(message, rInfo) { // Message event (This event will get all resposnes from receiver)
    log('Client', `
    Packet Received:
        IP: ${rInfo.address}:${rInfo.port} [${rInfo.family}]
`);

    const packetType = message[0]; // Packet type [Data, Acknowledgement, Handshake]

    switch(packetType) {
        case 0x02: // Acknowledgement
            const packetSequence = message.subarray(3, 8).readInt16LE(0); // Reading packet sequence numer by Little-endian

            log('Client', `Received ACK${packetSequence} packet`);
            receivedAck[packetSequence] = true;
            break;

        case 0x03: // Handshake
            const initialSequence = message[1]; // This is the initial packet sequence received from our server
            setSeq(initialSequence);
            
            log('Client', `Handshake successful, Initial Seq # ${initialSequence}`)
    
            isAccepted = true; // Indicate handshake has been successfully established
            break;
    }
});

client.bind(PORT); // Binding to port 6000



/* Sender Steps */

// Sending Handshake packet to receiver
const handshakePacket = createPacket(0x03); // Creating a packet with type of 0x03 [Handshake Packet]
client.send(handshakePacket, rPORT, IP); // Sending to the server

// Waiting for acception (5 seconds, if no response terminate the process)
let terminateWaiting = false; // A variable indicate if process should be terminated or not [Not getting handshake response]

setTimeout(function() {
    if(isAccepted) return; // If handshake resposne not received terminate the process
    terminateWaiting = true;
}, 5000);

while(!isAccepted) {
    if(terminateWaiting) terminate('[UDP-Client] Handshake resposne failed. Process terminated');
    await wait(5);
}

// Sending file metadata & content to receiver

// 1) Reading file path content
const fileContent = await readFile(filePath);
const fileName = filePath.substring(filePath.lastIndexOf('\\')+1);
const fileSize = fileContent.byteLength;

// 2) Creating metadata packet of file
const bufferMeta = Buffer.from(`__FILENAME__${fileName}__FILESIZE__${fileSize}`); // Creating Packet contains file metadata
const [seq, metadataPacket] = createPacket(1, bufferMeta, 1);
/*client.send(metadataPacket, rPORT, IP);
receivedAck = false;

const retransmittion = setTimeout(function() {
    if(receivedAck) return; // Ignore if received
    log('Client', 'Re-trasmitted a packet...')
    client.send(metadataPacket, rPORT, IP); // Re-transmission the packet
}, 1000);

while(!receivedAck) {
    log('Client', 'Waiting for Acknowledgment...');
    await wait(0);
}*/




// List all needed packets File metadata & content
const packetList = [{ seqN: seq, packet: metadataPacket }, ...splitFile(fileContent)];
for(let currentPacket of packetList) {
    client.send(currentPacket.packet, rPORT, IP);

   const interval = setInterval(function() {
        if(receivedAck[currentPacket.seqN]) return clearInterval(interval); // Ignore if received ACK
        client.send(currentPacket.packet, rPORT, IP); // Re-transmission the packet
        log('Client', `Re-trasmitted #${currentPacket.seqN} packet...`)

    }, 1000);

    if(!receivedAck[currentPacket.seqN]) log('Client', `Waiting for Acknowledgment ${currentPacket.seqN}...`);
    while(!receivedAck[currentPacket.seqN]) // Waiting until acknowledgment packet received
        await wait(0);
}

/*
    Testing Functionalities
*/

// [TESTING] Sending duplicated packet
//client.send(Buffer.from([0x01, 0x00, 0x32, 0x05, 0x00, 0x00, 0x00, 0x00, 0x01]), rPORT, IP);