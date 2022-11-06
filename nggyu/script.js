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

function frame_decode(encoded_frame) {
	result = [];
	temp = 0;
	shift_mult = 0;
	skip = false;
	remaining_bits = false;
	for (const x of encoded_frame) {
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
				temp = 0;
				shift_mult = 0;
				skip = false;
				remaining_bits = false;
				continue;
			}
			for (let i = 0; i < temp; i++) {
				result.push(x);
			}
			temp = 0;
			shift_mult = 0;
			remaining_bits = false;
			continue;
		}
		result.push(x);
	}
	return result;
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

async function fetch_frame(frame_num) {
	return (await (await fetch('frames/frame' + frame_num)).blob()).arrayBuffer();
}

async function nggyu() {
	var audio = new Audio('audio.mp3');
	var display = document.getElementById('nggyu');
	var height = 90;
	var width = 116;
	var frame_buffer;
	var image_px_array;
	var children;
	var p;
	var str;
	const delay = ms => new Promise(res => setTimeout(res, ms));
	// Create display-output elements
	for (let i = 0; i < height; i++) {
		p = document.createElement('p');
		p.appendChild(document.createTextNode(''));
		display.appendChild(p);
	}
	children = display.children;
	frame_buffer = frame_decode(byte_to_nibble(await fetch_frame(0)));
	image_px_array = framedata_to_image(frame_buffer);
	audio.play();
	for (let j = 1; j < 5298; j++) {
		for (let k = 0; k < children.length; k++) {
			str = image_px_array[k*width];
			for (let l = (k*width)+1; l < (k+1)*width; l++) {
				str += ' ' + image_px_array[l];
			}
			children[k].textContent = str;
		}
		await delay(30);
		frame_update(frame_buffer, frame_decode(byte_to_nibble(await fetch_frame(j))));
		image_px_array = framedata_to_image(frame_buffer);
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
		nggyu();
	}
}

function button_handler() {
	document.removeEventListener('keydown', keydown_handler);
	var elem = document.getElementById('press_enter');
	var button_div = document.getElementById('button_div');
	elem.remove();
	button_div.innerHTML = '';
	button_div.remove();
	nggyu();
}