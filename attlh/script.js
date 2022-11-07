function delay(ms) {
	return new Promise(res => setTimeout(res, ms));
}

async function decompress_blob(compressed_blob) {
  const ds = new DecompressionStream("gzip");
  const decompressedStream = compressed_blob.stream().pipeThrough(ds);
  return await new Response(decompressedStream).blob();
}


function byte_to_nibble(array_buffer) {
	var b = 0;
	var result = new Uint8Array(array_buffer.byteLength * 2);
	var byte_array = new Uint8Array(array_buffer);
	for (let i = 0; i < array_buffer.byteLength; i++) {
		b = byte_array[i];
		result[i * 2] = b >> 4;
		result[(i * 2) + 1] = b & 0b1111;
	}
	return result;
}

function stream_decode(encoded_stream, frame_array) {
	var result = [];
	var count = 0;
	var temp = 0;
	var shift_mult = 0;
	var skip = false;
	var remaining_bits = false;
	for (const x of encoded_stream) {
		if (count == 10440) {
			frame_array.push(result);
			result = [];
			count = 0;
		}
		if (x & 0b1000) {
			if (remaining_bits) {
				temp |= ((x & 0b111) << (3*shift_mult)+2);
				shift_mult += 1;
				continue;
			}
			if (x & 0b100) {
				skip = true;
			}
			temp |= x & 0b11;
			remaining_bits = true;
			continue;
		}
		if (temp != 0) {
			if (skip) {
				result.push(temp << 2);
				count += temp;
				temp = 0;
				shift_mult = 0;
				skip = false;
				remaining_bits = false;
				continue;
			}
			for (let i = 0; i < temp; i++) {
				result.push(x);
			}
			count += temp;
			temp = 0;
			shift_mult = 0;
			remaining_bits = false;
			continue;
		}
		result.push(x);
		count += 1;
	}
	if (count == 10440) {
		frame_array.push(result);
	}
	//return result;
}

function framedata_to_image(framedata) {
	var chars = ['  ', '..', '!!', '--', '++', 'VV', 'JJ', 'MM'];
	result = [];
	for (const x of framedata) {
		result.push(chars[x]);
	}
	return result;
}

function frame_update(frame_buffer, next_frame) {
	var index = 0;
	for (const x of next_frame) {
		if (x > 0b111) {
			index += (x >> 2);
			continue;
		}
		frame_buffer[index] = x;
		index += 1;
	}
}

async function fetch_frame_bundles(frame_bundle) {
	for (let i = 0; i < 11; i++) {
		frame_bundle.push(
			fetch('frames/frame_bundle'+i+'.gz')
				.then((res) => res.blob())
				.then((compressed_blob) => decompress_blob(compressed_blob))
				.then((decompressed_blob) => decompressed_blob.arrayBuffer())
				.then((byte_array) => byte_to_nibble(byte_array))
		);
		await delay(1);
	}
}

async function frame_unbundle(frame_bundle, frame_array) {
	for (let i = 1; i < 11; i++) {
		stream_decode(await frame_bundle[i], frame_array);
	}
}

async function decode_frames(decoded_frame, frame_array) {
	frame_buffer = frame_array[0];
	decoded_frame.push(framedata_to_image(frame_buffer));
	for (let i = 1; i < 5298; i++) {
		frame_update(frame_buffer, frame_array[i]);
		decoded_frame.push(framedata_to_image(frame_buffer));
		await delay(1);
	}
}

async function attlh() {
	var audio = new Audio('audio.m4a');
	var display = document.getElementById('attlh');
	var height = 90;
	var width = 116;
	var frame_bundle = [];
	var frame_array = [];
	var frame_buffer;
	var decoded_frame = [];
	var start;
	var children;
	var j = 0;
	var p;
	var str;
	// Create display-output elements
	for (let i = 0; i < height; i++) {
		p = document.createElement('p');
		p.appendChild(document.createTextNode(''));
		display.appendChild(p);
	}
	// Fetch frame bundles
	fetch_frame_bundles(frame_bundle);
	await delay(1000);
	stream_decode(await frame_bundle[0], frame_array);
	await delay(1500);
	// Unbundle to individual frames
	frame_unbundle(frame_bundle, frame_array)
	
	// Convert frames to displayable image (or in this case, text)
	decode_frames(decoded_frame, frame_array);
	await delay(2500);
	children = display.children;
	audio.play();
	start = Date.now();
	while (j < 5298) {
		j = Math.trunc((Date.now() - start) / 40);
		for (let k = 0; k < children.length; k++) {
			str = decoded_frame[j][k*width];
			for (let l = (k*width)+1; l < (k+1)*width; l++) {
				str += ' ' + decoded_frame[j][l];
			}
			children[k].textContent = str;
		}
		await delay(1);
	}
}

function keydown_handler(event) {
	if (event.key === 'Enter') {
		document.removeEventListener('keydown', keydown_handler);
		var elem = document.getElementById('press_enter');
		var button_div = document.getElementById('button_div');
		elem.remove();
		button_div.innerHTML = '';
		button_div.remove();
		attlh();
	}
}

function button_handler() {
	document.removeEventListener('keydown', keydown_handler);
	var elem = document.getElementById('press_enter');
	var button_div = document.getElementById('button_div');
	elem.remove();
	button_div.innerHTML = '';
	button_div.remove();
	attlh();
}