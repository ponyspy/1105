$(document).ready(function() {
	$('.form_description').popline({disable:['color']});
	// $('#one').sortable({connectWith: '#two', placeholder: 'column_placeholder', cancel: '.m_comment, .m_search'});
	// $('#two').sortable({connectWith: '#one', placeholder: 'column_placeholder', cancel: '.m_comment, .m_search'});





	$('.form_image_main').filedrop({
		url: '/upload',
		paramname: 'image',
		fallback_id: 'upload_fallback',
		allowedfiletypes: ['image/jpeg','image/png','image/gif'],
		allowedfileextensions: ['.jpg','.jpeg','.png','.gif'],
		maxfiles: 5,
		maxfilesize: 8,
		dragOver: function() {
			$(this).css('outline', '2px solid red');
		},
		dragLeave: function() {
			$(this).css('outline', 'none');
		},
		uploadStarted: function(i, file, len) {
			console.log('start')
		},
		uploadFinished: function(i, file, response, time) {
			console.log('finish')
		},
		progressUpdated: function(i, file, progress) {

		},
		afterAll: function() {
			$('.form_image_main').css('outline', 'none');
		}
	});












	$('.submit').click(function(event) {
		var title = $('.form_title').html();
		var description = $('.form_description').html();
		var old = $('.form_old').val();
		var category = $('.form_category').val();

		var ru = {
			title: title,
			description: description
		}

		$.post('', {
			ru: ru,
			old: old,
			category: category
		}).done(function(project) {


			window.location.reload()


		});
	});
});