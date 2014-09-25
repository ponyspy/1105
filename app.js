var fs = require('fs');
var gm = require('gm').subClass({ imageMagick: true });
var async = require('async');
var Email = require('email').Email;

var mongoose = require('mongoose'),
    models = require('./models/main.js');
      mongoose.connect('localhost', 'main');

var express = require('express'),
    bodyParser = require('body-parser'),
    multer = require('multer'),
    cookieParser = require('cookie-parser'),
    session = require('express-session'),
    methodOverride = require('method-override'),
      app = express();

app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.locals.pretty = true;

app.use(express.static(__dirname + '/public'));
app.use(multer({ dest: __dirname + '/uploads'}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride());
app.use(cookieParser());

app.use(session({
  key: '1105.sess',
  resave: false,
  saveUninitialized: false,
  secret: 'keyboard cat',
  cookie: {
    path: '/',
    maxAge: 1000 * 60 * 60 // 1 hour
  }
}));


app.use(function(req, res, next) {
  res.locals.session = req.session;
  res.locals.locale = req.cookies.locale || 'ru';
  next();
});


// app.use(function(req, res, next) {
//   res.status(404);

//   // respond with html page
//   if (req.accepts('html')) {
//     res.render('error', { url: req.url, status: 404 });
//     return;
//   }

//   // respond with json
//   if (req.accepts('json')) {
//       res.send({
//       error: {
//         status: 'Not found'
//       }
//     });
//     return;
//   }

//   // default to plain-text
//   res.type('txt').send('Not found');
// });

// app.use(function(err, req, res, next) {
//   var status = err.status || 500;

//   res.status(status);
//   res.render('error', { error: err, status: status });
// });


// -------------------
// *** Model Block ***
// -------------------


var User = models.User;
var Item = models.Item;
var Order = models.Order;


// ------------------------
// *** Midleware Block ***
// ------------------------


function checkAuth (req, res, next) {
  if (req.session.user_id)
    next();
  else
    res.redirect('/login');
}


// ------------------------
// *** Handlers Block ***
// ------------------------


var deleteFolderRecursive = function(path) {
  if( fs.existsSync(path) ) {
    fs.readdirSync(path).forEach(function(file,index){
      var curPath = path + "/" + file;
      if(fs.statSync(curPath).isDirectory()) {
        deleteFolderRecursive(curPath);
      } else {
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(path);
  }
};


// ------------------------
// *** Post parms Block ***
// ------------------------


app.route('/get_item').post(function(req, res) {
  var id = req.body.id;

  Item.findById(id).lean().exec(function(err, item) {
    res.send(item);
  });
});

app.route('/submit_order').post(function(req, res) {
  var post = req.body;
  var order = new Order();

  Item.findById(post.item).exec(function(err, item) {
    --item.size[post.size];
    item.save();
  });

  order.items.push({
    item_id: post.item,
    size: post.size
  });
  order.adress = post.adress;
  order.email = post.email;
  order.phone = post.phone;
  order.name = post.name;

  order.save(function(err, order) {
    var orderMsg = new Email({
      from: 'order@1105.ru',
      to: 'desade4me@gmail.com',
      subject: "Новый заказ!",
      body: 'Название позиции:' + order.items[0].title + '\n\n' +
            'Имя: ' + order.name + '\n\n' +
            'E-mail: ' + order.email + '\n\n' +
            'Телефон:' + order.phone + '\n\n' +
            'Адрес доставки: ' + order.adress
    });

    orderMsg.send(function(err){
      res.send(order);
    });
  });
});


// ------------------------
// *** Index Block ***
// ------------------------


app.route('/').get(function(req, res) {
  Item.find().exec(function(err, items) {
    res.render('main', {items: items});
  });
});


// ------------------------
// *** Set Locale Block ***
// ------------------------


app.route('/lang/:locale').get(function(req, res) {
  res.cookie('locale', req.params.locale);
  res.redirect('back');
});


// ------------------------
// *** Auth Block ***
// ------------------------


app.route('/auth').get(checkAuth, function (req, res) {
  res.render('auth');
});


// ------------------------
// *** Admin Design Block ***
// ------------------------


var edit_design = app.route('/auth/design');

edit_design.get(checkAuth, function(req, res) {
  res.render('auth/design');
});

edit_design.post(checkAuth, function(req, res) {
  var files = req.files;

  async.parallel([
    function(callback) {
      files.l_up
        ? gm(files.l_up.path).resize(800, false).quality(90).noProfile().write(__dirname + '/public/images/design/main/l_up.jpg', callback)
        : callback(null, false)
    },
    function(callback) {
      files.r_up
        ? gm(files.r_up.path).resize(800, false).quality(90).noProfile().write(__dirname + '/public/images/design/main/r_up.jpg', callback)
        : callback(null, false)
    },
    function(callback) {
      files.l_dw
        ? gm(files.l_dw.path).resize(800, false).quality(90).noProfile().write(__dirname + '/public/images/design/main/l_dw.jpg', callback)
        : callback(null, false)
    },
    function(callback) {
      files.r_dw
        ? gm(files.r_dw.path).resize(800, false).quality(90).noProfile().write(__dirname + '/public/images/design/main/r_dw.jpg', callback)
        : callback(null, false)
    }
  ], function(results) {
    res.redirect('back');
  });
});


// ------------------------
// *** Admin Orders Block ***
// ------------------------


app.route('/auth/orders').get(checkAuth, function(req, res) {
  Order.find().populate('items.item_id').exec(function(err, orders) {
    res.render('auth/orders', {orders: orders});
  });
});


// ------------------------
// *** Orders list Block ***
// ------------------------


app.route('/auth/orders/:id').get(checkAuth, function(req, res) {
  var id = req.params.id;

  Order.findById(id).populate('items.item_id').exec(function(err, order) {
    res.render('auth/orders/order.jade', {order: order});
  });
});


// ------------------------
// *** Delete orders Block ***
// ------------------------


app.route('/rm_order').post(checkAuth, function(req, res) {
  var id = req.body.id;

  Order.findByIdAndRemove(id).exec(function(err, order) {
    res.send('ok');
  });
});


// ------------------------
// *** Admin Items Block ***
// ------------------------


app.route('/auth/items').get(checkAuth, function(req, res) {
  Item.find().exec(function(err, items) {
    res.render('auth/items', {items: items});
  });
});


// ------------------------
// *** Add Item Block ***
// ------------------------


var add_item = app.route('/auth/items/add');

add_item.get(checkAuth, function(req, res) {
  res.render('auth/items/add.jade');
});

add_item.post(checkAuth, function(req, res) {
  var item = new Item();
  var post = req.body;
  var files = req.files;

  item.title.ru = post.ru.title;
  item.description.ru = post.ru.description;
  item.category = post.category;
  item.price = post.price;
  item.size = post.size;


  if (files.image) {
    var newPath = __dirname + '/public/images/items/' + item._id + '/main.jpg';

    fs.mkdir(__dirname + '/public/images/items/' + item._id, function() {
      gm(files.image.path).resize(800, false).quality(90).noProfile().write(newPath, function() {
        item.image = '/images/items/' + item._id + '/main.jpg';
        item.save(function() {
          fs.unlink(files.image.path);
          res.redirect('/auth/items');
        });
      });
    });
  }
  else {
    item.save(function() {
      // fs.unlink(files.image.path);
      res.redirect('/auth/items');
    });
  }


});


// ------------------------
// *** Delete Items Block ***
// ------------------------


app.route('/rm_item').post(checkAuth, function(req, res) {
  var id = req.body.id;

  Item.findByIdAndRemove(id).exec(function(err, item) {
    deleteFolderRecursive(__dirname + '/public/images/items/' + id);
    res.send('ok');
  });
});


// ------------------------
// *** Edit Items Block ***
// ------------------------


var edit_items = app.route('/auth/items/edit/:item_id');

edit_items.get(checkAuth, function(req, res) {
  var id = req.params.item_id;

  Item.findById(id).exec(function(err, item) {
    res.render('auth/items/edit.jade', {item: item});
  });
});

edit_items.post(checkAuth, function(req, res) {
  var id = req.params.item_id;
  var post = req.body;
  var files = req.files;

  Item.findById(id).exec(function(err, item) {

    item.title.ru = post.ru.title;
    item.description.ru = post.ru.description;
    item.category = post.category;
    item.price = post.price;
    item.size = post.size;

    if (files.image) {
      var newPath = __dirname + '/public/images/items/' + item._id + '/main.jpg';

      fs.mkdir(__dirname + '/public/images/items/' + item._id, function() {
        gm(files.image.path).resize(1600, false).quality(80).noProfile().write(newPath, function() {
          item.image = '/images/items/' + item._id + '/main.jpg';
          item.save(function() {
            fs.unlink(files.image.path);
            res.redirect('/auth/items');
          });
        });
      });
    }
    else {
      item.save(function() {
        // fs.unlink(files.image.path);
        res.redirect('/auth/items');
      });
    }

  });
});


// ------------------------
// *** Login Block ***
// ------------------------


var login = app.route('/login');

login.get(function (req, res) {
  res.render('login');
});

login.post(function(req, res) {
  var post = req.body;

  User.findOne({ 'login': post.login, 'password': post.password }, function (err, person) {
    if (!person) return res.redirect('back');
    req.session.user_id = person._id;
    req.session.status = person.status;
    req.session.login = person.login;
    res.redirect('/auth');
  });
});


// ------------------------
// *** Logout Block ***
// ------------------------


app.route('/logout').get(function (req, res) {
  delete req.session.user_id;
  delete req.session.login;
  delete req.session.status;
  res.redirect('back');
});


// ------------------------
// *** Registr Block ***
// ------------------------


var registr = app.route('/registr');

registr.get(function(req, res) {
  if (!req.session.user_id)
    res.render('registr');
  else
    res.redirect('/');
});

registr.post(function (req, res) {
  var post = req.body;

  var user = new User({
    login: post.login,
    password: post.password,
    email: post.email
  });

  user.save(function(err, user) {
    if(err) {throw err;}
    console.log('New User created');
    req.session.user_id = user._id;
    req.session.login = user.login;
    req.session.status = user.status;
    res.redirect('/login');
  });
});


// ------------------------
// *** Static Block ***
// ------------------------


app.route('/contacts').get(function (req, res) {
  res.render('static/contacts.jade');
});

app.route('/sitemap.xml').get(function(req, res){
  res.sendfile('sitemap.xml',  {root: './public'});
});

app.route('/robots.txt').get(function(req, res){
  res.sendfile('robots.txt',  {root: './public'});
});


// ------------------------
// *** Other Block ***
// ------------------------


app.listen(3000);
console.log('http://127.0.0.1:3000')