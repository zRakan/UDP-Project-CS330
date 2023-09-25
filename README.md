# UDP-Project-CS330
This project is for `CS330` Course at IMAMU

## Requirements:
1. **Packet Sequencing**: Implement a mechanism to sequence your data packets. Include a sequence number 
in each packet to ensure proper ordering and non-duplicated packets on the receiver's end.

2. **Acknowledgments (ACKs)**: The receiver should send an acknowledgment packet for each received 
data packet to confirm its arrival.

3. **Retransmissions**: Implement a timer (1 second) for each packet sent. If an acknowledgment is not 
received within a certain time frame, the packet should be retransmitted.

4. **File Splitting**: The application should be capable of breaking large files into smaller chunks (maximum 
size 500 bytes) for transmission.

5. **File Metadata**: Before the data transmission begins, exchange metadata like filename and file size between the sender and the receiver.

6. **Packet Types**: Differentiate between data packets, acknowledgment packets, and handshaking packets.

7. **Packet Header**: Each packet should contain a header with metadata, including the size of the header, type of packet, sequence number, and size of data.

8. **Ports**: Use port number 6000 for the sender and 6500 for the receiver.

9. The sender should be capable of specifying the receiver's IP address, port number, and the file to be 
sent through command-line arguments.

10. **Statistics**: Your code should output statistics like throughput and delay during or after the file transfer.