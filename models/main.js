var mongoose = require('mongoose'),
			Schema = mongoose.Schema;

var userSchema = new Schema({
		login: String,
		password: String,
		email: String,
		status: {type: String, default: 'User'},
		date: {type: Date, default: Date.now},
});

var itemSchema = new Schema({
	title: {
		ru: String,
		en: String
	},
	description: {
		ru: String,
		en: String
	},
	image: String,
	category: String,
	store: [{
		size: String,
		count: Number
	}],
	date: {type: Date, default: Date.now},
});


// ------------------------
// *** Exports Block ***
// ------------------------


module.exports.User = mongoose.model('User', userSchema);
module.exports.Item = mongoose.model('Item', itemSchema);