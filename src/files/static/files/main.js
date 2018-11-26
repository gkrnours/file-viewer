var BASE_URL = window.location
var TABLE = null;
var PAGINATION = null;
var NEXT_LINK = null;
var PREV_LINK = null;
var MODAL = document.getElementById("fileDetails");
var PER_PAGE = 5;

document.addEventListener("DOMContentLoaded", start);

// initialize the page
function start() {
	TABLE = document.getElementById('content');
	PAGINATION = document.getElementById('page');
	NEXT_LINK = PAGINATION.querySelector('[data-role="paginate-next"]');
	PREV_LINK = PAGINATION.querySelector('[data-role="paginate-previous"]');
	fetch_page();

	TABLE.addEventListener('click', on_open_file, true);
	PAGINATION.addEventListener('click', on_change_page, true);
	document.forms.ajax.addEventListener('change', on_change_filter, true);
	document.forms.send.addEventListener('submit', on_send_file, true);
}

// Event Listener, when changing page
function on_change_page() {
	event.preventDefault();
	// TODO handle real page and not just next/previous link
	fetch_page(event.target.href);
}

// Event Listener, reload page when filter are changed
function on_change_filter() {
	fetch_page();
}

// Event Listener, time to upload a file
function on_send_file() {
	event.preventDefault();
	var formData = new FormData(event.target);
	var url = BASE_URL + 'api/files/';

	var xhr = new XMLHttpRequest();
	xhr.open('POST', url, true);
	xhr.onload = function() {
		if (this.status < 400) {
			return this.onsuccess();
		}
		else {
			return this.onerror();
		}
	}
	xhr.onsuccess = function() {
		fetch_page();
	}

	xhr.send(formData);
}

// Event Listener, when opening the details of a file
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
		else if (file.type == 'csv') {
			body.innerHTML = '<pre>' + file.head + '</pre>';
		}

		var link = MODAL.querySelector("[data-role='download']");
		link.href = file.file;

		$(MODAL).modal('show');
	}
}

// List of function, pretty-fying a file name for display
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

// Handle ajax, success and error
function fetch_page(page) {
	page = page || 0;
	var url = '';
	parsed_page = parseInt(page);
	if (isNaN(parsed_page)) {
		// We can get an url instead of a page number
		url = page;
	}
	else {
		url = BASE_URL + 'api/files/?limit='+PER_PAGE;
		if (page) {
			url += '&offset=' + PER_PAGE * parsed_page;
		}
		var filter = document.forms.ajax.elements.filter.value;
		if (filter != 'all') {
			url += '&type=' + filter;
		}
	}
	var xhr = new XMLHttpRequest();
	xhr.open('GET', url, true);

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

		// Pagination
		if (data.next || data.previous) {
			PAGINATION.style = '';
			// Previous & Next link
			if (data.previous) {
				PREV_LINK.href = data.previous;
				PREV_LINK.parentElement.classList.remove('disabled');
			} else {
				PREV_LINK.parentElement.classList.add('disabled');
			}
			if (data.next) {
				NEXT_LINK.href = data.next;
				NEXT_LINK.parentElement.classList.remove('disabled');
			} else {
				NEXT_LINK.parentElement.classList.add('disabled');
			}
		} else {
			PAGINATION.style = 'display:none;';
		}

		var tpl = TABLE.tHead.rows[0];
		TABLE.tBodies[0].innerHTML = '';
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

	xhr.send();
}
