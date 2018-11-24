var BASE_URL = window.location
var TABLE = null;
var PAGINATION = null;
var MODAL = document.getElementById("fileDetails");

document.addEventListener("DOMContentLoaded", start);

function start() {
	TABLE = document.getElementById("content");
	PAGINATION = document.getElementById("page");
	fetch_page();

	TABLE.addEventListener("click", on_open_file, true);
}

function on_open_file() {
	if (event.target.dataset.action == "open") {
		var row = event.target.closest("tr");
		var file = JSON.parse(row.dataset.file);

		var title = MODAL.querySelector("[data-role='title']");
		title.textContent = file.name;

		var body = MODAL.querySelector("[data-role='content']");
		if (file.type == "image") {
			body.innerHTML = "<img src='" + file.thumbnail + "'>";
		}

		var link = MODAL.querySelector("[data-role='download']");
		link.href = file.file;

		$(MODAL).modal('show');
	}
}

var formatter = {
	"text": function (str) { return str; },
	"date": function (timestamp) {
		var date = new Date(timestamp);
		return date.toLocaleDateString();
	},
	"button": function() {
		return "<button data-action='open' type='button'>Open</button>";
	},
};

function fetch_page(page) {
	page = page || 0;
	var xhr = new XMLHttpRequest();
	xhr.open('GET', BASE_URL + 'api/files/', true);
	xhr.send();

	xhr.onload = function() {
		if (this.status == 200) {
			return this.onsuccess();
		}
		else {
			return this.onerror();
		}
	}
	xhr.onsuccess = function() {
		var data = JSON.parse(this.responseText);
		console.log(data)

		if (data.next || data.previous) {
			PAGINATION.style = "";
		}

		var tpl = TABLE.tHead.rows[0];
		for (var i = 0; i < data.results.length; ++i) {
			var row = document.createElement("tr");
			var file = data.results[i];
			row.dataset.file = JSON.stringify(file);
			for (var c = 0; c < tpl.cells.length; ++c) {
				var col = document.createElement("td");
				var field = tpl.cells[c].dataset.field
				var format = tpl.cells[c].dataset.format || "text";
				col.innerHTML = formatter[format](file[field]);
				row.append(col);
			}
			TABLE.tBodies[0].append(row);
		}
	}
}
