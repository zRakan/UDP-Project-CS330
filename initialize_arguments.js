import { terminate, checkIpAddress, log } from './utils.js';

let argsValues = {};
export default function(process_args) {

    for(let i = 0; i < process_args.length; i+=2) {
        const currentCommand = process_args[i]; // Display arguments (Debugging)
        const currentValue = process_args[i+1];
    
        // If argument doesn't have a value
        if(!currentValue && (currentCommand != '--h' && currentCommand != '--help'))
            terminate(`${currentCommand} doesn't have a value specified. Try to type --help to get more information`)
    
        switch(currentCommand) {
            case '--ip':
                if(checkIpAddress(currentValue))
                    argsValues.IP = currentValue;
                else {
                    terminate(`${currentValue} is invalid IPv4 address.`)
                }
                break;
            case '--port':
                const parsedPort = parseInt(currentValue);
                
                if(parsedPort >= 1024 && parsedPort <= 65535)
                    argsValues.PORT = currentValue;
                else
                    terminate(`${currentValue} is invalid port, it should be: 1024 <= PORT <= 65535`)
                break;
            case '--file':
                argsValues.filePath = currentValue;
                break;
            case '--help':
            case '--h':
                terminate(`
    Sender command-line available arguments:
        --help, --h
            Display all available command-line arguments
    
        --ip IP
            Set IP address
    
        --port PORT
            Set PORT
    
        --file 'filePath'
    
        Usage: sender.js --ip 0.0.0.0 --port 6500 --file 'filePath'
    `);
            default:
                terminate(`${currentCommand} is invalid. Process terminated`);
        }
    }

    // Check if arguments is specified
    if(!argsValues.IP)
        log('Client', '--ip not specified. will use IP: 0.0.0.0');

    if(!argsValues.PORT)
        log('Client', '--port not specified. will use PORT: 6500');

    if(!argsValues.filePath) terminate('--file not specified. Process terminated');

    return [argsValues.IP || '0.0.0.0', argsValues.PORT || '6500', argsValues.filePath]
}