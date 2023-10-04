import fs from 'fs/promises';
import { createWriteStream } from 'fs'

import { createPacket } from "./packet.js";

/**
 * Create a message in terminal
 * @param {String} type - Either [Server, Client]
 * @param {String} message - message in terminal 
 */
export function log(type, message) {
    console.log(`[UDP ${type}] ${message}`);
}

/**
 * Terminate a process with specified message
 * @param {String} message - Reason of termination 
 */
export function terminate(message) {
    console.log(message);
    process.exit(0);
}

/**
 * Check if IPv4 provided is correct or not
 * @param {String} ip - Target IP 
 * @returns {Boolean} Either argument is correct format of IPv4 or bad format
 */
export function checkIpAddress(ip) {
    return (/^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/gi).test(ip);
}

/* Writing uploaded file */
let fileStream;

/**
 * Creating file stream pipe
 * @param {String} fileName - Streamed filename 
 */
export function startStream(fileName) {
    fileStream = createWriteStream(`./uploadedFiles/${randomStr(6)}-${fileName}`, {flags: 'w'});
}

/**
 * Writing on stream pipe
 * @param {Buffer} buffer - Buffer of the content 
 */
export function writingStream(buffer) {
    fileStream.write(buffer);
}

/**
 * Closing the stream pipe
 */
export function closeStream() {
    fileStream.end();
}


/**
 * Reading the file based on command-line arguments
 * @param {String} filePath - Directory of the file 
 * @returns {Buffer<Promise>} File content as buffer
 */
export async function readFile(filePath) {
    try {
        const fileContent = await fs.readFile(filePath);
        return fileContent;
    } catch(err) {
        if(err.code == 'ENOENT') // File not found
            terminate('File/Directory not found. Process terminated')
    }
}

/**
 * Splitting the content of the file into chunks of buffers
 * @param {Buffer} buffer - Buffer of file content 
 * @returns {Buffer[]} Chunks of buffers
 */
export function splitFile(buffer) {
    let bufferChunks = []; // Buffer chunks [Max-size: 500 bytes]
    //createPacket(1, buffer);


    console.log(`File splitter:
Current file size: ${buffer.byteLength} bytes`)

    let currentChunk = 0;
    while(true) {
        let chunk = Buffer.from(buffer).subarray(currentChunk * 491, ((currentChunk+1) * 491));
        let seqN;

        const isLastChunk = chunk.byteLength < 491;
        
        [seqN, chunk] = createPacket(0x01, chunk, isLastChunk ? 2 : 0);

        bufferChunks.push({ seqN, packet: chunk }); // Push the sequenceNumber, chunk
        
        //console.log(`#${currentChunk+1} Chunk: ${chunk.byteLength} bytes`);

        // Increase the chunk
        currentChunk++;
        
        // Break the loop if the chunk is lower than 500 bytes
        if(chunk.byteLength < 500) break; 
    }

    return bufferChunks;
}

/**
 * Formatting bytes into proper size(s)
 * @param {Integer} bytes - Bytes number 
 * @returns {String} formatted bytes
 */
export function formatBytes(bytes) {
    if (!+bytes) return '0 Bytes';

    const k = 1024;
    const dm = 2;
    const sizes = ['Bytes', 'KB', 'MB', 'GB']

    const i = Math.floor(Math.log(bytes) / Math.log(k))

    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
}

/**
 * Sleep/Wait function utility
 * @param {Integer} ms - Waiting for ms 
 */
export async function wait(ms) {
    await new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Create an inclusive random number 
 * @param {Integer} min - Minimum number
 * @param {Integer} max - Maximum number
 * @returns {Integer} An integer between min & max
 */
export function randomNumber(min = 0, max = 1000) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Create a random string based on specified length
 * @param {Integer} length - Length of string 
 * @returns {String} String contains random letters&numbers
 */
function randomStr(length) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    let counter = 0;

    while (counter < length) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
        counter++;
    }

    return result;
}