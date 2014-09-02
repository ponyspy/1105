$(document).ready(function() {
	var id;

	function getRand(min, max) {
		var rand = min - 0.5 + Math.random()*(max-min+1)
		return Math.round(rand);
	}

	var validate = {
		email: 	function (email) {
			var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
			return re.test(email);
		},
		phone: function(phone) {
			var re1 = /^\d{10}$/;
			var re2 = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
			var re3 = /^\+?([0-9]{2})\)?[-. ]?([0-9]{4})[-. ]?([0-9]{4})$/;

			return re1.test(phone);
		}
	}

	$('.logo_main').click(function(event) {
		$(this).hide();
		$(this).next('.buy_items').show();
	});

	$('.logo').click(function(event) {
		$('.buy_items').hide();
		$('.logo_main').show();
	});

	$('.buy_image').click(function(event) {
		var buy_items = $(this).closest('.buy_items').children('.buy_item');
		var rand = getRand(0, buy_items.length - 1);

		buy_items.hide().eq(rand).show();
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
		var size = $('.order_size').find(':selected').val();
		var valid = validate.email(email);

		if (valid) {
			$.post('/submit_order', {item: item, size: size, adress: adress, email: email}).done(function(order) {
					$('.order_block').hide();
			});
		}
		else {
			$('.order_email').css('border', '2px solid red');
		}
	});
});