function testing3(character) {
	var out = document.getElementById('color_sample');
	var p;
	var str = "";
	for (let j = 0; j < 100; j++) {
		str += character;
	}
	if (out.childNodes.length === 1) {
		for (let i = 0; i < 35; i++) {
			p = document.createElement('p');
			p.appendChild(document.createTextNode(str));
			out.appendChild(p);
		}
	} else {
		for (const x of out.children) {
			x.innerHTML = str;
		}
	}
}

function testing2() {
	var out = document.getElementById('color_palette');
	var p;
	var str = "";
	for (const x of '.!-+VJM') {
		for (let j = 0; j < 100; j++) {
			str += x;
		}
	}
	for (let i = 0; i < 50; i++) {
		p = document.createElement('p');
		p.appendChild(document.createTextNode(str));
		out.appendChild(p);
	}
}

function testing() {
	var ascii_pixel = '.`\',:\|!-^~;"/\\)(_{[7}]*+v?li1uzr<>wtjJcox0IVnL&3y4TYCk2UOh$8569f=saDZF%mAeX#dPSbGQWgqp@EKRNHMB'
	var body = document.getElementById('body');
	var p;
	var str;
	for (let x = 0; x < 186; x++) {
		str = ""
		for (const k of ascii_pixel) {
			for (let j = 0; j < 40; j++) {
				str += k;
			}
		}
		
		for (let i = 0x20; i < 0x7F; i++) {
			if (ascii_pixel.includes(String.fromCharCode(i))) {
				continue;
			}
			for (let j = 0; j < 40; j++) {
				str += String.fromCharCode(i);
			}
		}
		p = document.createElement('p');
		p.appendChild(document.createTextNode(str));
		body.appendChild(p);
	}
}

async function eh_paano_kung() {
	var audio = new Audio('audio.mp3');
	var out = document.getElementById('caloocan_boy');
	var height = caloocan_boy.length;
	var width = caloocan_boy[0].length;
	var caloocan_boy_numeric = Array(height);
	var fade_to_caloocan_boy = Array(height);
	var children;
	var p;
	var str;
	var temp;
	var counter;
	const delay = ms => new Promise(res => setTimeout(res, ms));
	// Convert char to char codes
	for (let i = 0; i < height; i++) {
		caloocan_boy_numeric[i] = Array(width);
		for (let j = 0; j < width; j++) {
			caloocan_boy_numeric[i][j] = caloocan_boy[i][j].charCodeAt();
		}
	}
	// Fill array with random char codes
	for (let i = 0; i < height; i++) {
		fade_to_caloocan_boy[i] = Array(width);
		for (let j = 0; j < width; j++) {
			fade_to_caloocan_boy[i][j] = (Math.floor(Math.random() * 100) % 0x5F) + 0x20;
		}
	}
	// Display the randomly generated characters
	for (const row of fade_to_caloocan_boy) {
		str = '';
		for (const col of row) {
			str += String.fromCharCode(col);
		}
		p = document.createElement('p');
		p.appendChild(document.createTextNode(str));
		out.appendChild(p);
	}
	children = out.children;
	counter = 0;
	while (true) {
		for (let i = 0; i < height; i++) {
			for (let j = 0; j < width; j++) {
				if (fade_to_caloocan_boy[i][j] > caloocan_boy_numeric[i][j]) {
					fade_to_caloocan_boy[i][j] -= 1;
					counter += 1;
				} else if (fade_to_caloocan_boy[i][j] < caloocan_boy_numeric[i][j]) {
					fade_to_caloocan_boy[i][j] += 1;
					counter += 1;
				}
			}
		}
		for (let k = 0; k < children.length; k++) {
			str = '';
			for (const c of fade_to_caloocan_boy[k]) {
				str += String.fromCharCode(c);
			}
			children[k].textContent = str;
		}
		if (counter === 0) {
			break;
		} else {
			counter = 0;
		}
		await delay(50);
	}
	audio.play();
}

function keydown_handler(event) {
	if (event.key === 'Enter') {
		document.removeEventListener('keydown', keydown_handler);
		var elem = document.getElementById('press_enter');
		var button_div = document.getElementById('button_div');
		elem.remove();
		button_div.innerHTML = '';
		button_div.remove();
		eh_paano_kung();
	}
}

function button_handler() {
	document.removeEventListener('keydown', keydown_handler);
	var elem = document.getElementById('press_enter');
	var button_div = document.getElementById('button_div');
	elem.remove();
	button_div.innerHTML = '';
	button_div.remove();
	eh_paano_kung();
}

function document_add_listeners() {
	// Add event listener on keydown
	document.addEventListener('keydown', (event) => {
		var name = event.key;
		var code = event.code;
		if (name === 'Shift' || name === 'Control' || name === 'CapsLock' || name === 'Alt' || name === 'Meta') return;
		// Alert the key name and key code on keydown
		//alert(`Key pressed ${name} \r\n Key code value: ${code}`);
		document.getElementById('key_pressed').innerHTML = `Key pressed: ${name}`;
		document.getElementById('key_code').innerHTML = `Key code value: ${name}`;
		testing3(name);
	}, false);
	
	// Add event listener on keypress
	/*document.addEventListener('keypress', (event) => {
		var name = event.key;
		var code = event.code;
		// Alert the key name and key code on keydown
		//alert(`Key pressed ${name} \r\n Key code value: ${code}`);
		document.getElementById('key_pressed').innerHTML = `Key pressed: ${name}`;
		document.getElementById('key_code').innerHTML = `Key code value: ${name}`;
		testing3(name);
	}, false);
	
	// Add event listener on keyup
	document.addEventListener('keyup', (event) => {
		var name = event.key;
		var code = event.code;
		// Alert the key name and key code on keydown
		//alert(`Key pressed ${name} \r\n Key code value: ${code}`);
		document.getElementById('key_pressed').innerHTML = `Key pressed: ${name}`;
		document.getElementById('key_code').innerHTML = `Key code value: ${name}`;
		testing3(name);
	}, false); */
}