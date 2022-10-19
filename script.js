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

function eh_paano_kung() {
	var out = document.getElementById('caloocan_boy');
	var p;
	for (const x of caloocan_boy) {
		p = document.createElement('p');
		p.appendChild(document.createTextNode(x));
		out.appendChild(p);
	}
}

function onload() {
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