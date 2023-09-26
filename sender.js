// Import datagram UDP socket
import * as UDP from 'dgram';
import { Buffer } from 'node:buffer';

// Import arguments initializer
import { default as createArguments } from './initialize_arguments.js';

// Checking arguments
const args = process.argv.slice(2);
const [IP, PORT, filePath] = createArguments(args);

