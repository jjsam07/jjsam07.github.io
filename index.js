async function index_onload() {
	var response = await fetch('pages.json');
	var pages = await response.json();
	var container = document.getElementById('container');
	container.appendChild(document.createElement('br'));
	container.appendChild(document.createElement('br'));
	for (const page of pages) {
		const hyperlink = document.createElement('a');
		hyperlink.href = page.location;
		hyperlink.textContent = page.name;
		container.appendChild(hyperlink);
		container.appendChild(document.createElement('br'));
		container.appendChild(document.createElement('br'));
	}
}