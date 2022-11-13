function delay(ms) {
	return new Promise(res => setTimeout(res, ms));
}

async function decompress_blob(compressed_blob) {
  const ds = new DecompressionStream("gzip");
  const decompressed_stream = compressed_blob.stream().pipeThrough(ds);
  return await new Response(decompressed_stream).blob();
}


function frame_deserialize(byte_array) {
	var result = [];
	var index = 4;
	var metadata = 0;
	for (b of byte_array) {
		if (index === 4) {
			metadata = b;
			index = 0;
			continue;
		}
		if (metadata & (1 << (index * 2))) {
			result.push((b >> 4) | 0b10000);
		} else {
			result.push(b >> 4);
		}
		if (metadata & (1 << ((index * 2) + 1))) {
			result.push((b & 0b1111) | 0b10000);
		} else {
			result.push(b & 0b1111);
		}
		index += 1;
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
		if (count === 10440) {
			frame_array.push(result);
			result = [];
			count = 0;
		}
		if (x & 0b10000) {
			if (remaining_bits) {
				temp |= ((x & 0b1111) << (4*shift_mult)+3);
				shift_mult += 1;
				continue;
			}
			if (x & 0b1000) {
				skip = true;
			}
			temp |= x & 0b111;
			remaining_bits = true;
			continue;
		}
		if (temp != 0) {
			if (skip) {
				result.push(temp << 3);
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
	if (count === 10440) {
		frame_array.push(result);
	}
}

function framedata_to_image(framedata) {
	var char0 = ['   ', '   ', '   ', '   ', ' . ', ' . ', ' - ', '.- ', '.-.', '---', '---', '-V-', 'VVV', 'VVV', 'VMV', 'MMM'];
	var char1 = ['   ', ' . ', '. .', '- -', '- -', '-.-', '---', '---', '---', '---', 'V-V', 'VVV', 'VVV', 'MVM', 'MMM', 'MMM'];
	var char2 = ['   ', '   ', '   ', '   ', ' . ', ' . ', ' - ', ' -.', '.-.', '---', '---', '-V-', 'VVV', 'VVV', 'VMV', 'MMM'];
	result = [[], [], []];
	for (const x of framedata) {
		result[0].push(char0[x]);
		result[1].push(char1[x]);
		result[2].push(char2[x]);
	}
	return result;
}

function frame_update(frame_buffer, next_frame) {
	var index = 0;
	for (const x of next_frame) {
		if (x > 0b1111) {
			index += (x >> 3);
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
				.then((blob) => new Response(blob).arrayBuffer())
				.then((compressed_byte_array) => pako.inflate(compressed_byte_array))
				.then((decompressed_byte_array) => frame_deserialize(decompressed_byte_array))
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
	var audio = new Audio();
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
	var str0;
	var str1;
	var str2;
	var loading_end = () => {loading[0] = false;}
	// Show loading screen
	p = document.createElement('p');
	p.setAttribute('style', 'font-size: 90px;');
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
	for (let i = 0; i < height * 3; i++) {
		p = document.createElement('p');
		p.appendChild(document.createTextNode(''));
		p.setAttribute('class', 'output')
		display.appendChild(p);
	}
	// Fetch audio
	audio.oncanplaythrough = () => { loading_end(); }
	audio.src = 'audio.m4a';
	audio.load();
	while (loading[0]) { await delay(1); } // wait for audio to be fully loaded
	await delay(1000);
	display.removeChild(display.firstChild)
	children = display.children;
	audio.play();
	start = Date.now();
	while (j < 5298) {
		j = Math.trunc((Date.now() - start) / 40);
		for (let k = 0; k < height; k++) {
			str0 = decoded_frame[j][0][k*width];
			str1 = decoded_frame[j][1][k*width];
			str2 = decoded_frame[j][2][k*width];
			for (let l = (k*width)+1; l < (k+1)*width; l++) {
				str0 += ' ' + decoded_frame[j][0][l];
				str1 += ' ' + decoded_frame[j][1][l];
				str2 += ' ' + decoded_frame[j][2][l];
			}
			children[(k * 3)].textContent = str0;
			children[(k * 3) + 1].textContent = str1;
			children[(k * 3) + 2].textContent = str2;
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

var test_counter = 0

function dec_counter() {
	if (test_counter > 0) {
		test_counter -= 1;
	}
}

function inc_counter() {
	if (test_counter < 15) {
		test_counter += 1;
	}
}

function init() {
	var display = document.getElementById('attlh');
	var elem = document.getElementById('press_enter');
	var button_div = document.getElementById('button_div');
	var p;
	elem.remove();
	button_div.innerHTML = '';
	button_div.remove();
	for (let i = 0; i < 90; i++) {
		p = document.createElement('p');
		p.appendChild(document.createTextNode(''));
		p.setAttribute('class', 'output')
		display.appendChild(p);
	}
}

function draw() {
	var display = document.getElementById('attlh');
	var char0 = ['   ', '   ', '   ', '   ', ' . ', ' . ', ' - ', '.- ', '.-.', '---', '---', '-V-', 'VVV', 'VVV', 'VMV', 'MMM'];
	var char1 = ['   ', ' . ', '. .', '- -', '- -', '-.-', '---', '---', '---', '---', 'V-V', 'VVV', 'VVV', 'MVM', 'MMM', 'MMM'];
	var char2 = ['   ', '   ', '   ', '   ', ' . ', ' . ', ' - ', ' -.', '.-.', '---', '---', '-V-', 'VVV', 'VVV', 'VMV', 'MMM'];
	var str0;
	var str1;
	//var str2;
	for (let i = 0; i < 30; i++) {
		str0 = '';
		str1 = '';
		str2 = '';
		str0 += char0[test_counter];
		str1 += char1[test_counter];
		str2 += char2[test_counter];
		for (let j = 0; j < 115; j++) {
			str0 += char0[test_counter];
			str1 += char1[test_counter];
			str2 += char2[test_counter];
		}
		display.children[(i * 3)].textContent = str0;
		display.children[(i * 3) + 1].textContent  = str1;
		display.children[(i * 3) + 2].textContent  = str2;
	}
}

function test_keydown_handler(event) {
	if (event.key === 'ArrowLeft') {
		dec_counter();
		console.log(test_counter);
		draw();
	} else if (event.key === 'ArrowRight') {
		inc_counter();
		console.log(test_counter);
		draw();
	}
}