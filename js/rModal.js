/**
 * rModal 0.1 by Cuteribs
 * 
 * A simplified bootstrap modal wrapper.
 * 
 * @params 
 *		title		{string}:			The modal header title content string.
 *		subTitle	{string}:			The modal header subtitle content string.
 *		body		{string}:			The modal body content string.
 *		backdrop	{boolean|'static'}:	Same as the backdrop option of bootstrap modal.
 *		loading		{boolean}:			Sets the default modal content as spinner.
 *		size		{'sm'|'lg'|'xl'}:	Defines the modal size.
 *		onShown		{function}:			Executes in 'shown.bs.modal' of bootstrap modal.
 *		onHidden	{function}:			Executes in 'hidden.bs.modal' of bootstrap modal.
 *		buttons		{array}:			An array of objects to configure buttons to modal footer.
 *		url			{string}			The url for ajax call; only works for ajax method.
 *		method		{'GET'|'POST'}		The http method for ajax call; only works for ajax method.
 */

(function ($) {
	'use strict';

	var rModal = window.rModal = {
		close: function (e) {
			if (e === true) {
				$('div.modal').on('hidden.bs.modal', function () {
				}).modal('hide');
			} else {
				$(e.target).closest('div.modal').modal('hide');
			}
		},
		delete: function (e) {
			if (e === true) {
				$('div.modal').on('hidden.bs.modal', function () {
					$(this).remove();
				}).modal('hide');
			} else {
				$(e.target).closest('div.modal').on('hidden.bs.modal', function () {
					$(this).remove();
				}).modal('hide');
			}
		},
		open: function (options) {
			options = $.extend({
				title: '',
				subTitle: '',
				body: '',
				css: 'fade',
				backdrop: true,
				loading: true,
				size: false,
				onShown: false,
				onHidden: false,
				buttons: false
			}, options);

			var $modal = $('<div class="modal ' + options.css + '"><div class="modal-dialog"><div class="modal-content"></div></div></div>').appendTo('body');
			$modal.options = options;

			if (typeof (options.onShown) == 'function') {
				$modal.on('shown.bs.modal', function (e) { options.onShown.call(this, e); });
			}

			if (typeof (options.onHidden) == 'function') {
				$modal.on('hidden.bs.modal', function (e) { options.onHidden.call(this, e); });
			}

			var sizes = {
				sm: 'modal-sm',
				lg: 'modal-lg',
				xl: 'modal-xl'
			};

			$modal.data('bs.modal', false);
			$modal.find('.modal-dialog')
				.removeClass('modal-sm')
				.removeClass('modal-lg')
				.addClass(sizes[options.size] || '');

			var $content = $modal.find('.modal-content').html('<div class="modal-header"><button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button><h4 class="modal-title">${title}</h4></div><div class="modal-body">${body}</div><div class="modal-footer"></div>');
			var $title = $content.find('.modal-title').html(options.title);

			if (options.loading) {
				options.body = '<div class="text-center" style="color:#00599C"><i class="fas fa-spinner fa-spin fa-3x"></i></div>';
			}

			var $body = $content.find('.modal-body').html(options.body);
			var $footer = $modal.find('.modal-footer');

			if (Object.prototype.toString.call(options.buttons) === '[object Array]') {
				for (var i = 0, l = options.buttons.length; i < l; i++) {
					var button = options.buttons[i];

					button.click = typeof (button.click) === 'function' ? button.click : function () { };

					$('<button type="button" class="btn ' + (button.cssClass || 'btn-default') + '" data-dismiss="' + (button.close ? 'modal' : '') + '">' + (button.label || '{Label Missing!}') + '</button>').appendTo($footer)
						.on('click', button.click);
				}
			} else {
				$('<button type="button" class="btn btn-default" data-dismiss="modal">Close</button>').appendTo($footer);
			}

			$modal.modal(options);
			return $modal;
		},
		alert: function (params, title) {
			var options = {
				title: 'Alert',
				buttons: [{
					label: 'Close',
					cssClass: 'btn-primary',
					close: true
				}]
			};

			switch (typeof (params)) {
				case 'string':
				case 'number':
					options = $.extend(options, {
						message: params,
						title: title
					});
					break;
				case 'object':
					options = $.extend(options, params);
					break;
				default:
					throw new Error('invalid options');
			}

			options.body = options.message;
			this.open(options);
			return self.$modal;
		},
		confirm: function (params, title) {
			var dfd = $.Deferred();

			var options = {
				title: 'Confirm',
				buttons: [{
					label: 'Yes',
					cssClass: 'btn-primary',
					close: true,
					click: function () { dfd.resolve(); }
				}, {
					label: 'No',
					cssClass: 'btn-danger',
					close: true,
					click: function () { dfd.reject(); }
				}]
			};

			switch (typeof (params)) {
				case 'string':
				case 'number':
					options = $.extend(options, {
						message: params,
						title: title
					});
					break;
				case 'object':
					options = $.extend(options, params);
					break;
				default:
					throw new Error('invalid options');
			}

			options.body = options.message;
			this.open(options);
			return dfd.promise();
		},
		prompt: function (params, title) {
			var dfd = $.Deferred();

			options = {
				title: 'Confirm',
				buttons: [{
					label: 'Submit',
					cssClass: 'btn-primary',
					close: false,
					click: function () { dfd.resolve(self.$modal.find('input.prompt-input').val()); }
				}, {
					label: 'Cancel',
					cssClass: 'btn-danger',
					close: true,
					click: function () { dfd.reject(self.$modal.find('input.prompt-input').val()); }
				}]
			};

			switch (typeof (params)) {
				case 'string':
				case 'number':
					options = $.extend(options, {
						message: params,
						title: title
					});
					break;
				case 'object':
					options = $.extend(options, params);
					break;
				default:
					throw new Error('invalid options');
			}

			var body = '<label class="control-label">${message}</label><input type="text" class="form-control prompt-input" required autocomplete="on" value="">'.replace('${message}', options.message);
			options.body = body;
			this.open(options);
			return dfd.promise();
		},
		ajax: function (params, title) {
			var dfd = $.Deferred();
			var options = {
				loading: true
			};

			switch (typeof (params)) {
				case 'string':
					options = $.extend(options, {
						url: params,
						title: title
					});
					break;
				case 'object':
					options = $.extend(options, params);
					break;
				default:
					throw new Error('invalid options');
			}

			if (!options.url) {
				throw new Error('url is not provided');
			}

			var $modal = this.open(options);

			$.ajax({
				url: options.url,
				method: options.method
			}).done(function (data) {
				$modal.find('.modal-body').html(data);
				dfd.resolve();
			}).fail(function (err) {
				$modal.find('.modal-body').html('<div class="alert alert-danger">' + err.message + '</div>');
				dfd.reject();
			});

			return dfd.promise();
		}
	};
})(jQuery);