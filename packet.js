/* Packet Utilities */
let SEQs = 0;
function increaseSeq() {
    return SEQs++;
}

/**
 * Returns last packet sequence created from "createPacket()"
 * @returns {Integer} Last packet sequence
 */
export function getSeq() {
    return SEQs;
}

/**
 * Set packet sequence (Used in handshake establishment)
 * @param {Integer} init - Packet sequence from handshake packet 
 */
export function setSeq(init) {
    SEQs = init
}


/**
 * Create a packet for specified buffer
 * @param {Integer} type - [1,2,3] ==> [Data, Ack, Handshaking] 
 * @param {Buffer} buffer - The buffer data
 * @param {String} dataType - [Required param if type == 1] The data type
 * @returns {Buffer} Packet header & packet data
 */

/* 
Packet structure: [ Packet Header(Fixed size 9) | Packet Content(Variable size) ]

Structure of Packet Header
    Packet types[0] = [0x01, 0x02, 0x03]
                      [Data, Ack, HandShaking]

    Packet size[1,2] = [0...500]
    Header size[3] = [0...255]
    
    Packet seq[4, 7] = [0x00...0xFFFFFFFF]

    Packet dataType[8] = [0x00, 0x01, 0x02]
                         [noop, Metadata, end]
*/
const headerSize = 9; // Header size
export function createPacket(type, buffer = Buffer.alloc(0), dataType) {
    const headerPacket = Buffer.alloc(headerSize);
    let seqN;

    if(type == 0x01) { // Data packet
        seqN = increaseSeq();
        headerPacket[8] = dataType;
    } else if(type == 0x02) // Acnkowledgement Packet
        seqN = dataType // Set seq based on sender packet

    // Set Header of packet
    headerPacket[0] = type; // Type of packet [Data, Ack, Handshaking]
    headerPacket[3] = headerSize; // Header size
    headerPacket.writeInt16BE(headerSize + buffer.byteLength, 1); // Appending data size [0...500]
    headerPacket.writeInt16LE(seqN ? seqN : 0, 4); // Appending packet sequence
    
    const finalBuffer = Buffer.concat([headerPacket, buffer]);
    return (seqN != undefined ? [ seqN, finalBuffer ] : finalBuffer);
}