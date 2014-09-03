$(document).ready(function() {
	var id;

	var random = {
		buf: 0,
		get: function(min, max) {
			var rand = min - 0.5 + Math.random()*(max-min+1);
			var res = Math.round(rand);

			if (this.buf != res) {
				this.buf = res;
				return res;
			}
			else {
				return this.get.call(random, min, max);
			}
		}
	}

	var validate = {
		email: 	function (email) {
			var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
			return re.test(email);
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
		var rand = random.get(0, buy_items.length - 1);

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