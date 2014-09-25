$(document).ready(function() {
	function remove (event) {
		var id  = $(this).attr('id');

		if (confirm(event.data.description)) {
			$.post(event.data.path, {'id': id}).done(function() {
				location.reload();
			});
		}
	}

	$('.rm_item').on('click', {path: '/rm_item', description: 'Удалить товар?'}, remove);
	$('.rm_order').on('click', {path: '/rm_order', description: 'Удалить заказ?'}, remove);

});