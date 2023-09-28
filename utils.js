import fs from 'fs/promises';


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

/**
 * 
 * @param {} filePath 
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