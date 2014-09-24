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
	price: Number,
	size: {
		s: Number,
		m: Number,
		l: Number,
		xl: Number
	},
	date: {type: Date, default: Date.now},
});

var orderSchema = new Schema({
	items: [{
		item_id: { type: Schema.Types.ObjectId, ref: 'Item' },
		size: String
	}],
	name: String,
	adress: String,
	phone: String,
	email: String,
	date: {type: Date, default: Date.now}
});


// ------------------------
// *** Exports Block ***
// ------------------------


module.exports.User = mongoose.model('User', userSchema);
module.exports.Item = mongoose.model('Item', itemSchema);
module.exports.Order = mongoose.model('Order', orderSchema);