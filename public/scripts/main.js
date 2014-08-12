$(document).ready(function() {
	$('.number').mouseover(function(event) {
		$(this).hide();
		$(this).next('.buy_items').show();
	});

	$('.logo').click(function(event) {
		$('.buy_items').hide();
		$('.number').show();
	});
});