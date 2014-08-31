$(document).ready(function() {
	$('.logo_main').click(function(event) {
		$(this).hide();
		$(this).next('.buy_items').show();
	});

	$('.logo').click(function(event) {
		$('.buy_items').hide();
		$('.logo_main').show();
	});

	$('.buy_btn').click(function(event) {
		var id = $(this).parents('.buy_item').attr('id');

		$.post('/get_item', {id: id}).done(function(item) {
			alert(item)
			$('.order_block').show();
		});
	});
});