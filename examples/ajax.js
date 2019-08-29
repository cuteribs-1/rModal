function createModalElement() {
	return $('<div class="modal fade" tabindex="-1"><style>.modal-xl{width:96%;}.modal-body{max-height: calc(100vh - 145px);overflow-y: auto;}</style>' +
		'<div class=modal-dialog>' +
		'<div class=modal-content>' +
		' <div class=modal-header><button type=button class="x close" data-dismiss=modal><span aria-hidden=true>&times;</span><span class=sr-only>Close</span></button><h4 class=modal-title></h4></div>' +
		'</div>' +
		'</div>' +
		'</div>')
		.on('hidden.bs.modal', _recycleModal)
		.on(EVENT_CLICK, 'button.x', function (ev) {
			var btn = $(ev.currentTarget);

			if (btn.prop('type') !== EVENT_SUBMIT)
				return $modal.modal(EVENT_HIDE);

			try {
				if (btn.closest('form')[0].checkValidity())
					return close();
			} catch (e) {
				return close();
			}

			return $modal;
		});
}