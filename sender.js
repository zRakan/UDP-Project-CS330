// Import arguments initializer
import { default as createArguments } from './initialize_arguments.js';

// Import utils
import { log, wait, readFile, splitFile, terminate } from './utils.js';

// Import packet utilities
import { createPacket, setSeq } from './packet.js';


// Checking arguments
const args = process.argv.slice(2);
const [IP, rPORT, filePath] = createArguments(args);

// Import datagram UDP socket
import * as UDP from 'dgram';
import { Buffer } from 'node:buffer';

// Creating UDP client
const PORT = 6000;

const client = UDP.createSocket('udp4');

// Receive messages from Receiver [ACKs, Handshake]
let receivedAck = true; // Acknowledgment received or not
let isAccepted = false; // Handshake acception

client.on('message', function(message, rInfo) {
    log('Client', `
    Message Received:
        IP: ${rInfo.address}:${rInfo.port} [${rInfo.family}]
`);

    switch(message[0]) {
        case 0x02: // Acknowledgement
            log('Client', 'Received ACK packet');
            receivedAck = true;
            break;

        case 0x03: // Handshake
            log('Client', `Handshake successful, Initial Seq # ${message[1]}`)
            isAccepted = true;

            setSeq(message[1]);
            break;
    }
});

client.bind(PORT); // Binding to port 6000



/* Sender Steps */

// Sending Handshake packet to receiver
const handshakePacket = createPacket(0x03);
client.send(handshakePacket, rPORT, IP);

// Waiting for acception (5 seconds, if no response terminate the process)
let terminateWaiting = false;

setTimeout(function() {
    if(isAccepted) return; // If handshake resposne not received terminate the process
    terminateWaiting = true;
}, 5000);

while(!isAccepted) {
    if(terminateWaiting) terminate('[UDP-Client] Handshake resposne failed. Process terminated');
    await wait(5);
}



//client.send(, rPORT, IP);


// Reading file path content
const fileContent = await readFile(filePath);
const fileName = filePath.substring(filePath.lastIndexOf('\\')+1);
const fileSize = fileContent.byteLength;

// Sending metadata of file to receiver [Filename, Filesize]
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




// Splitting file content & Send all packets (Metadata & Filecontent)
const packetList = [{ packet: metadataPacket }, ...splitFile(fileContent)];
console.log(packetList);

for(let currentPacket of packetList) {
    client.send(currentPacket.packet, rPORT, IP);
    receivedAck = false;

    const retransmittion = setTimeout(function() {
        if(receivedAck) return; // Ignore if received
        log('Client', 'Re-trasmitted a packet...')
        client.send(currentPacket.packet, rPORT, IP); // Re-transmission the packet
    }, 1000);

    while(!receivedAck) {
        log('Client', `Waiting for Acknowledgment ${currentPacket.seqN}...`);
        await wait(0);
    }
}

