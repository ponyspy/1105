$(document).ready(function() {
	var id;
	$(document).on('click', function(event) {
		if ($(event.target).closest('.order_block').length) return;
		$('.order_block').hide();
	});

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
		$('.order_name, .order_email, .order_phone, .order_adress').val('');
		$('.order_size').children('option').attr('checked', false);

		$.post('/get_item', {id: id}).done(function(item) {
			$('.order_title').text(item.title.ru);
			$('.order_price').text((item.price || 0) + ' р.');
			$.each(item.size, function(index, val) {
				val <= 0
					? $('.order_size option[value="' + index +'"]').attr('disabled', true)
					: false
			});
			$('.order_block').show();
		});
	});

	$('.submit_order').click(function() {
		var item = id;
		var name = $('.order_name').val();
		var email = $('.order_email').val();
		var phone = $('.order_phone').val();
		var adress = $('.order_adress').val();
		var size = $('.order_size').find(':selected').val();
		var valid = validate.email(email);

		if (valid) {
			$.post('/submit_order', {item: item, size: size, adress: adress, name: name, phone: phone, email: email}).done(function(order) {
					$('.order_block').hide();
			});
		}
		else {
			$('.order_email').addClass('invalid');
		}
	});
});