const express = require('express')
var bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const passport=require('passport');
const passportLocalMongoose = require('passport-local-mongoose');

const path=require('path')
const app = express();
const port = 2001;


app.use(express.json());
app.set('view engine', 'html');
app.use(bodyParser.urlencoded({extended : true}));
app.use(express.static('public'));

app.use(session({
    secret:"Our little secret.",
    resave:false,
    saveUninitialized:false
}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect('mongodb+srv://bharathkulkarni15:upA90vcPUDvg2w05@cluster0.jdekamr.mongodb.net/bookweb').then(()=> console.log('connected')).catch((err)=>console.log(err));
//mongoose.set("useCreateIndex",true);

const userSchema = new mongoose.Schema({
    name: String,
    username:String,
    password: String,
    balance: Number,
    contact:Number,
    gender:String

  });

  userSchema.plugin(passportLocalMongoose);



  const userDetailsSchema = new mongoose.Schema({
    name: String,
    username:String,
    balance: Number,
    contact:Number,
    gender:String
  });

  const userdetails = mongoose.model('userdetails', userDetailsSchema);

  const productSchema=new mongoose.Schema({
    imageUrl:String,
    title: String,
    yoe:Number,
    dsc:String,
    nod:Number,
    price:Number,
    owner:String,
    stock:Number
  });

  const ticketSchema=new mongoose.Schema({
    email:String,
    name:String,
    title:String,
    price:Number,
    yoe:Number,
    owner:String,
    renter:String,
    nod:Number,
    contact:Number
});

  const newproduct=mongoose.model('newproduct', productSchema);

  const usedproduct=mongoose.model('usedproduct', productSchema);

  const rentproduct=mongoose.model('rentproduct', productSchema);

  //const p=new product({imageUrl:"https://3.imimg.com/data3/KN/JB/MY-4161824/a-textbook-of-engineering-mechanics-books-500x500.jpg",title:"engineering mechanics",price:122,owner:"king"})
  //p.save()


  const ticket=mongoose.model('ticket',ticketSchema);


    const user = mongoose.model('user', userSchema);

    passport.use(user.createStrategy());

    passport.serializeUser(user.serializeUser());
    passport.deserializeUser(user.deserializeUser());


async function a(){
    const u = new user({name: 'bharath'})
    await u.save()
    console.log(u)
}


app.get('/name', async (req, res) => {
    res.send(req.query)
  })

app.get('/register', async (req, res) => {
  res.sendFile("register.html",{ root: __dirname + '\\views' });
})


app.get('/users', async (req, res) => {
    const u = new user(req.query)
    await u.save()
    res.send(req.query)
})





app.post('/users', function(req, res) {
    user.register({username: req.body.username},req.body.password,function(err,user){
        if(err){
            console.log(err);
            res.redirect('/users');
        }
        else{passport.authenticate("local")(req,res,function(){
            const u = new userdetails({name:req.body.name,username:req.body.username,balance:0,contact:req.body.contact,gender:req.body.gender});
            u.save(function(err,result){
                if (err){
                    console.log(err);
                }
                else{
                    console.log("success"); 
                }
            });
            res.redirect('/index');
        })}
    });
})

app.get('/newproduct', async (req, res) => {
    const movies = await newproduct.find({})
    res.send(movies)
})

app.get('/admin', async (req, res) => {
    
    res.send(req.user)
})

app.get('/usedproduct', async (req, res) => {
    const movies = await usedproduct.find({})
    res.send(movies)
})

app.get('/rentproduct', async (req, res) => {
    const movies = await rentproduct.find({})
    res.send(movies)
})

app.get('/soldproduct', async (req, res) => {
    const movies = await ticket.find({owner:req.user.username})
    res.send(movies)
})

app.get('/givenproduct', async (req, res) => {
    const movies = await ticket.find({renter:req.user.username})
    res.send(movies)
})

app.get('/balance', async (req, res) => {
    const details = await userdetails.find({username:req.user.username})
    res.send(details[0])
})


app.post('/money', async (req, res) => {
    if(req.isAuthenticated()){
        let urs = await userdetails.find({username: req.user.username})
    console.log(req.body, urs)
    let ur=urs[0]
    let balance=ur.balance
    if(!balance)
        balance =0;
    else
        balance = Number.parseFloat(balance);
    
    const deposit=req.body.amount
    if(Number.parseFloat(deposit)>0){
        balance=balance+Number.parseFloat(deposit)

    }
    

    await userdetails.updateOne({_id: ur._id}, {$set: { balance:  balance}});
    res.redirect('/index');
    }
    
})


app.get('/addmoney', async (req, res) => {
    res.sendFile('addmoney.html',{ root: __dirname + '\\views' });
})

app.get('/soldbook', async (req, res) => {
    res.sendFile('soldbooks.html',{ root: __dirname + '\\views' });
})

app.get('/givenbook', async (req, res) => {
    res.sendFile('givenbooks.html',{ root: __dirname + '\\views' });
})

app.get("/index",function(req,res){
    if(req.isAuthenticated()){
        res.sendFile('index.html',{ root: __dirname + '\\views' });
        console.log(req.user);
    }
    else{
        res.sendFile("Login.html",{ root: __dirname + '\\views' });
    }
})


app.get("/usedbooks",function(req,res){
    if(req.isAuthenticated()){
        res.sendFile('usedbooks.html',{ root: __dirname + '\\views' });
        console.log(req.user);
    }
    else{
        res.sendFile("Login.html",{ root: __dirname + '\\views' });
    }
})

app.get("/rentedbooks",function(req,res){
    if(req.isAuthenticated()){
        res.sendFile('rentedbooks.html',{ root: __dirname + '\\views' });
        console.log(req.user);
    }
    else{
        res.sendFile("Login.html",{ root: __dirname + '\\views' });
    }
})



app.post('/login',function(req,res) {
    const usr=new user({
        username:req.body.username,
        password:req.body.password});

    req.login(usr,function(err){
        if(err){
            console.log(err);
        }
        else{
            passport.authenticate('local')(req,res,function(){
                console.log(req.user);
                res.redirect("/index");
            })
        }
    })
})

app.get('/logout', function(req, res, next) {
    req.logout(function(err) {
      if (err) { return next(err); }
      res.redirect('/index');
    });
  });


app.post('/book', async (req, res) => {

    if(req.isAuthenticated()){
        console.log(req.body.id)
        const newbook = await newproduct.find({_id:req.body.id});
        console.log(newbook[0].title)

        let u = await userdetails.find({username: req.user.username})
    console.log(u)
    let balance=u[0].balance
    let stk=newbook[0].stock
    balance=Number.parseFloat(balance)
    if(u.length > 0 && balance>=newbook[0].price){
        
        balance=balance-newbook[0].price
        stk=stk-1

        await newproduct.updateOne({_id: newbook[0]._id}, {$set: {stock: stk}});
        await userdetails.updateOne({_id: u[0]._id}, {$set: { balance:  balance}});
        if(stk==0){
            await newproduct.deleteOne({_id: newbook[0]._id});
        }
        const t=new ticket({email:u[0].username,title:newbook[0].title,yoe:newbook[0].yoe,price:newbook[0].price,name:u[0].name})
        await t.save()
        res.send(`ticket?${new URLSearchParams({email:u[0].username,title:newbook[0].title,yoe:newbook[0].yoe,price:newbook[0].price,name:u[0].name,id:t._id,contact:2999999}).toString()}`)
        //res.redirect(`/route1?${new URLSearchParams({email:u[0].username,title:newbook[0].title,yoe:newbook[0].yoe,price:newbook[0].price,name:u[0].name,id:t._id}).toString()}`);
    }
    else{
        console.log("sorry")
    }
}

})



app.post('/oldbook', async (req, res) => {

    if(req.isAuthenticated()){
        console.log(req.body.id)
        const usedbook = await usedproduct.find({_id:req.body.id});
        console.log(usedbook[0].title)

        let u = await userdetails.find({username: req.user.username})
        let owner=await userdetails.find({username: usedbook[0].owner})
    console.log(u)
    let balance=u[0].balance
    let stk=usedbook[0].stock
    balance=Number.parseFloat(balance)
    ownerbalance=Number.parseFloat(owner[0].balance)
    if(u.length > 0 && balance>=usedbook[0].price){
        
        balance=balance-usedbook[0].price
        ownerbalance=ownerbalance+usedbook[0].price
        stk=stk-1

        await usedproduct.updateOne({_id: usedbook[0]._id}, {$set: {stock: stk}});
        await userdetails.updateOne({_id: u[0]._id}, {$set: { balance:  balance}});
        await userdetails.updateOne({username: owner[0].username}, {$set: { balance:  ownerbalance}});
        
        const t=new ticket({email:u[0].username,title:usedbook[0].title,yoe:usedbook[0].yoe,price:usedbook[0].price,name:u[0].name,owner:usedbook[0].owner})
        await t.save()
        if(stk==0){
            await usedproduct.deleteOne({_id: usedbook[0]._id});
        }
        res.send(`ticket?${new URLSearchParams({email:u[0].username,title:usedbook[0].title,yoe:usedbook[0].yoe,price:usedbook[0].price,name:u[0].name,id:t._id,contact:owner[0].contact}).toString()}`)
        //res.redirect(`/route1?${new URLSearchParams({email:u[0].username,title:newbook[0].title,yoe:newbook[0].yoe,price:newbook[0].price,name:u[0].name,id:t._id}).toString()}`);
    }
    else{
        console.log("sorry")
    }
}
})


app.post('/givenforrentbook', async (req, res) => {

    if(req.isAuthenticated()){
        console.log(req.body.id)
        const rentbook = await rentproduct.find({_id:req.body.id});
        console.log(rentbook[0].title)

        let u = await userdetails.find({username: req.user.username})
        let owner=await userdetails.find({username: rentbook[0].owner})
    console.log(u)
    let balance=u[0].balance
    let stk=rentbook[0].stock
    balance=Number.parseFloat(balance)
    ownerbalance=Number.parseFloat(owner[0].balance)
    if(u.length > 0 && balance>=rentbook[0].price){
        
        balance=balance-rentbook[0].price
        ownerbalance=ownerbalance+rentbook[0].price
        stk=stk-1

        await usedproduct.updateOne({_id: rentbook[0]._id}, {$set: {stock: stk}});
        await userdetails.updateOne({_id: u[0]._id}, {$set: { balance:  balance}});
        await userdetails.updateOne({username: owner[0].username}, {$set: { balance:  ownerbalance}});
        
        const t=new ticket({email:u[0].username,title:rentbook[0].title,yoe:rentbook[0].yoe,nod:rentbook[0].nod,price:rentbook[0].price,name:u[0].name,renter:rentbook[0].owner})
        await t.save()
        if(stk==0){
            await rentproduct.deleteOne({_id: rentbook[0]._id});
        }
        res.send(`ticket?${new URLSearchParams({email:u[0].username,title:rentbook[0].title,yoe:rentbook[0].yoe,price:rentbook[0].price,name:u[0].name,id:t._id,contact:owner[0].contact}).toString()}`)
        //res.redirect(`/route1?${new URLSearchParams({email:u[0].username,title:newbook[0].title,yoe:newbook[0].yoe,price:newbook[0].price,name:u[0].name,id:t._id}).toString()}`);
    }
    else{
        console.log("sorry")
    }
}
})

    

app.get('/ticket',function(req,res){
    res.sendFile("ticket.html",{ root: __dirname + '\\views' })
})

app.get('/route1',function(req,res){
    
    //res.sendFile('ticket.html',{root:path.join(__dirname, './views')});

    res.sendFile("ticket.html",{ root: __dirname + '\\views' })
    
  });
  

app.post('/addbook',function(req,res){
    //let u = userdetails.find({username: req.user.username})
    const p=new newproduct({imageUrl:req.body.url,yoe:req.body.yoe,title:req.body.title,price:req.body.price,owner:req.user.username,stock:req.body.stk})
    p.save();
    res.redirect("/index");
})

app.post('/addoldbook',function(req,res){
    //let u = userdetails.find({username: req.user.username})
    const p=new usedproduct({imageUrl:req.body.url,yoe:req.body.yoe,title:req.body.title,price:req.body.price,owner:req.user.username,stock:1})
    p.save();
    res.redirect("/usedbooks");
})

app.post('/addrentbook',function(req,res){
    //let u = userdetails.find({username: req.user.username})
    const p=new rentproduct({nod:req.body.nod,imageUrl:req.body.url,yoe:req.body.yoe,title:req.body.title,price:req.body.price,owner:req.user.username,stock:1})
    p.save();
    res.redirect("/rentedbooks");
})





app.get('/users/:name', async (req, res) => {
    let u = await user.find({ name: req.params.name });
    res.send(u)
})

app.listen(port, () => {
  console.log(`BCK app listening on port ${port}`)
})