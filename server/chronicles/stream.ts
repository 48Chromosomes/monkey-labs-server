import { WebSocketServer } from 'ws';
import ffmpeg from 'fluent-ffmpeg';
import Peer from 'simple-peer';
import wrtc from 'wrtc';

const STREAM_KEY = '9r3c-u6q5-9kgz-c6t4-60d8';

const wss = new WebSocketServer({ port: 9999 });

wss.on('connection', (ws) => {
	ws.on('message', async (message: any) => {
		const data = JSON.parse(message);

		const peer = new Peer({ initiator: false, wrtc: wrtc });

		peer.signal(data);

		peer.on('stream', async (stream: any) => {
			console.log('stream');
			console.log(stream);

			ffmpeg(stream)
				.inputFormat('mjpeg')
				.outputFormat('flv')
				.outputOptions([
					'-c:v libx264',
					'-preset veryfast',
					'-tune zerolatency',
					'-c:a aac',
					'-ar 44100',
					'-f flv',
				])
				.on('error', (err) => {
					console.log('Error!');
					console.log(err);
				})
				.output(`rtmp://a.rtmp.youtube.com:1935/live2/${STREAM_KEY}`)
				.run();
		});

		peer.on('signal', (data) => {
			ws.send(JSON.stringify(data));
		});
	});
});
