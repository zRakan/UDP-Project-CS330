// Import arguments initializer
import { default as createArguments } from './initialize_arguments.js';

// Import utils
import { readFile, splitFile } from './utils.js';

// Checking arguments
const args = process.argv.slice(2);
const [IP, PORT, filePath] = createArguments(args);

// Import datagram UDP socket
import * as UDP from 'dgram';
import { Buffer } from 'node:buffer';

// Creating UDP client
const client = UDP.createSocket('udp4');

// Reading file path content
const fileContent = await readFile(filePath);

// Splitting file content
const splittedChunks = splitFile(fileContent);