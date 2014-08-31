$(document).ready(function() {
	var id;

	$('.logo_main').click(function(event) {
		$(this).hide();
		$(this).next('.buy_items').show();
	});

	$('.logo').click(function(event) {
		$('.buy_items').hide();
		$('.logo_main').show();
	});

	$('.buy_btn').click(function(event) {
		id = $(this).parents('.buy_item').attr('id');

		$.post('/get_item', {id: id}).done(function(item) {
			$('.order_title').text(item.title.ru);
			$('.order_price').text((item.price || 0) + ' р.');
			$('.order_block').show();
		});
	});

	$('.submit_order').click(function() {
		var item = id;
		var email = $('.order_email').val();
		var adress = $('.order_adress').val();

		$.post('/submit_order', {item: item, adress: adress, email: email}).done(function(order) {
				alert(order);
				$('.order_block').hide();
		});
	});
});