# WebRTC via QR
Establish a WebRTC connection without requiring a signalling server (like TURN- or dedicated server). Instead, initial signalling is achieved by scanning QR codes in person.

## Motivation
Intended for local games. Setting up a WebRTC connection requires some way of exchanging description- and candidate-data between clients ("signalling"). Usually this is achieved by paying for a TURN server or hosting a dedicated server yourself. However, since everyone is available in-person anyway, the signalling might as well be done via some local exchange - in this case by scanning QR codes.

## Inspiration
Several other repos already use this mechanism:
- [serverless-webrtc-qrcode](https://github.com/fta2012/serverless-webrtc-qrcode)
- [webrtc-qr](https://github.com/AquiGorka/webrtc-qr)
- [webrtc-qr-signaling-channel](https://github.com/TomasHubelbauer/webrtc-qr-signaling-channel)
However they only provide proof of concept and not a simple package anyone can use.

## Connection process
1. Host creates invite as QR code
2. Joinee scans invite, which creates accept as QR code
3. Host scans accept
4. Connection will be established

## Problems & limitations
- Star topology. Every message has to go through the host.
- Capacity. QR codes can be too small to contain all data. Either some candidates are omitted or multiple codes must be scanned.
- Tight timeout. Some browsers fail the connection on purpose after a set amount of time, making manual exchange unnecessary difficult. Firefox only allows 5 secondy by default (customizable at `media.peerconnection.ice.trickle_grace_period`)

## WIP: Example, Usage, Dependencies, Build