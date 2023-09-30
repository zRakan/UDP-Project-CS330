/* Packet Utilities */
let SEQs = 0;
function getSeq() {
    return SEQs++;
}

export function setSeq(init) {
    SEQs = init
}

let ACKs = 0;
function getACK() {
    return ACKs++;
}



/**
 * Create a packet for specified buffer
 * @param {Integer} type - [1,2,3] ==> [Data, Ack, Handshaking] 
 * @param {Buffer} buffer - The buffer data
 * @param {String} dataType - [Required param if type == 1] The data type
 * @returns {Buffer} Packet header & packet data
 */

/* Packet Header
Packet types[0] = [0x01, 0x02, 0x03]
		        [Data, Ack, HandShaking]

Packet size[1,2] = [0...500]
Packet seq[3, 7] = [0...65535]

Packet dataType[8] = [0x00, 0x01, 0x02]
		             [noop, Metadata, end]
*/
const headerSize = 9; // Header size
export function createPacket(type, buffer = Buffer.alloc(0), dataType) {
    const headerPacket = Buffer.alloc(headerSize);
    let seqN;

    if(type == 0x01) {
        seqN = getSeq();
        headerPacket[8] = dataType;

        console.log("Data Packet");
    }

    // Set Header of packet
    headerPacket[0] = type; // Type of packet [Data, Ack, Handshaking]
    headerPacket.writeInt16BE(headerSize + buffer.byteLength, 1); // Appending data size [0...500]
    headerPacket.writeInt16LE(seqN ? seqN : 0, 3); // Appending packet sequence
    
    const finalBuffer = Buffer.concat([headerPacket, buffer]);
    return (seqN != undefined ? [ seqN, finalBuffer ] : finalBuffer);
}