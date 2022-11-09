function delay(ms) {
	return new Promise(res => setTimeout(res, ms));
}

async function decompress_blob(compressed_blob) {
  const ds = new DecompressionStream("gzip");
  const decompressed_stream = compressed_blob.stream().pipeThrough(ds);
  return await new Response(decompressed_stream).blob();
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

async function decode_frames(decoded_frame, frame_array) {
	frame_buffer = frame_array[0];
	decoded_frame.push(framedata_to_image(frame_buffer));
	for (let i = 1; i < 5298; i++) {
		frame_update(frame_buffer, frame_array[i]);
		decoded_frame.push(framedata_to_image(frame_buffer));
		await delay(1);
	}
}

async function show_loading_screen(output_element, is_loading) {
	var loading_str = 'Loading';
	var loading_char_code = [0x4c, 0x6f, 0x61, 0x64, 0x69, 0x6e, 0x67];
	var Lloading = ['   ', '   ', '   ', '.  ', '.. ', '...', ' ..', '  .'];
	var Rloading = ['.  ', '.. ', '...', ' ..', '  .', '   ', '   ', '   '];
	var fade = []
	var temp_str = ''
	var char_code;
	var counter = 0;
	for (let i = 0; i < 7; i++) {
		await delay(10);
		char_code = (Math.floor(Math.random() * 100) % 0x5F) + 0x20;
		fade.push(char_code);
		temp_str += String.fromCharCode(char_code);
		output_element.textContent = temp_str;
	}
	while (true) {
		for (let j = 0; j < 7; j++) {
			if (fade[j] > loading_char_code[j]) {
				fade[j] -= 1;
				counter += 1;
			} else if (fade[j] < loading_char_code[j]) {
				fade[j] += 1;
				counter += 1;
			}
		}
		temp_str = '';
		for (const c of fade) {
			temp_str += String.fromCharCode(c);
		}
		output_element.textContent = temp_str;
		if (counter === 0) {
			break;
		} else {
			counter = 0;
		}
		await delay(10);
	}
	await delay(500);
	while (is_loading[0]) {
		for (let k = 0; k < 8; k++) {
			output_element.textContent = Lloading[k] + loading_str + Rloading[k];
			await delay(250);
		}
		output_element.textContent = '   ' + loading_str + '   ';
		await delay(1000);
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
	var loading = [true];
	var start;
	var children;
	var j = 0;
	var p;
	var str;
	// Show loading screen
	p = document.createElement('p');
	p.setAttribute('style', 'font-size: 30px;');
	p.appendChild(document.createTextNode(''));
	display.appendChild(p);
	show_loading_screen(p, loading)
	// Fetch frame bundles
	fetch_frame_bundles(frame_bundle);
	// Unbundle to individual frames
	for (let j = 0; j < 11; j++) {
		stream_decode(await frame_bundle[j], frame_array);
	}
	// Convert frames to displayable image (or in this case, text)
	decode_frames(decoded_frame, frame_array);
	// Create display-output elements
	for (let i = 0; i < height; i++) {
		p = document.createElement('p');
		p.appendChild(document.createTextNode(''));
		display.appendChild(p);
	}
	await delay(2000);
	display.removeChild(display.firstChild)
	loading[0] = false;
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