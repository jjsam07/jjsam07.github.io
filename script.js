function eh_paano_kung() {
	document.getElementById('button').remove();
	var body = document.getElementById('body');
	var p;
	for (const x of caloocan_boy) {
		p = document.createElement('p');
		p.appendChild(document.createTextNode(x));
		body.appendChild(p);
	}
}