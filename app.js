//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const _ = require("lodash");
const mongoose = require('mongoose');

const homeStartingContent = "Lacus vel facilisis volutpat est velit egestas dui id ornare. Semper auctor neque vitae tempus quam. Sit amet cursus sit amet dictum sit amet justo. Viverra tellus in hac habitasse. Imperdiet proin fermentum leo vel orci porta. Donec ultrices tincidunt arcu non sodales neque sodales ut. Mattis molestie a iaculis at erat pellentesque adipiscing. Magnis dis parturient montes nascetur ridiculus mus mauris vitae ultricies. Adipiscing elit ut aliquam purus sit amet luctus venenatis lectus. Ultrices vitae auctor eu augue ut lectus arcu bibendum at. Odio euismod lacinia at quis risus sed vulputate odio ut. Cursus mattis molestie a iaculis at erat pellentesque adipiscing.";
const aboutContent = "Hac habitasse platea dictumst vestibulum rhoncus est pellentesque. Dictumst vestibulum rhoncus est pellentesque elit ullamcorper. Non diam phasellus vestibulum lorem sed. Platea dictumst quisque sagittis purus sit. Egestas sed sed risus pretium quam vulputate dignissim suspendisse. Mauris in aliquam sem fringilla. Semper risus in hendrerit gravida rutrum quisque non tellus orci. Amet massa vitae tortor condimentum lacinia quis vel eros. Enim ut tellus elementum sagittis vitae. Mauris ultrices eros in cursus turpis massa tincidunt dui.";
const contactContent = "Scelerisque eleifend donec pretium vulputate sapien. Rhoncus urna neque viverra justo nec ultrices. Arcu dui vivamus arcu felis bibendum. Consectetur adipiscing elit duis tristique. Risus viverra adipiscing at in tellus integer feugiat. Sapien nec sagittis aliquam malesuada bibendum arcu vitae. Consequat interdum varius sit amet mattis. Iaculis nunc sed augue lacus. Interdum posuere lorem ipsum dolor sit amet consectetur adipiscing elit. Pulvinar elementum integer enim neque. Ultrices gravida dictum fusce ut placerat orci nulla. Mauris in aliquam sem fringilla ut morbi tincidunt. Tortor posuere ac ut consequat semper viverra nam libero.";

const app = express();

let posts = [];

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

mongoose.connect("mongodb://127.0.0.1:27017/wikiDB");


const blogpostSchema = {
  title: String,
  content: String
};

const BlogPost = mongoose.model("BlogPost", blogpostSchema);

async function getBlogPosts(){
  const BlogPosts = await BlogPost.find({})
  return BlogPosts;
}

async function saveBlogPost(newPost){
  const BlogPosts = await BlogPost.find({})
  return BlogPosts;
}

async function findExists(articleTitle){
  const BlogPosts = await BlogPost.findOne({title: articleTitle});
  return BlogPosts;
}



app.get("/", function(req,res){
  res.render("home", {
    content:homeStartingContent, 
    postItems: posts});
})

app.get("/About", function(req,res){
  res.render("about", {content:aboutContent});
})

app.get("/Contact", function(req,res){
  res.render("contact", {content:contactContent});
})


app.get("/Compose", function(req,res){
  res.render("compose");
})


app.post("/Compose", function(req,res){
  const post = {
    title: req.body.postTitle,
    content: req.body.postBody
  }
  posts.push(post);
  res.redirect("/");
});

// :variable is the same as flask with <variable>
app.get("/posts/:postName", function(req, res){
  const requestedTitle = _.lowerCase(req.params.postName);
  posts.forEach(function(post) {
    const storedTitle = _.lowerCase(post.title);
    // console.log(storedTitle);
    // console.log(requestedTitle);
    // here we use lodash because our title is case sensitive however it seems like lodash has some casing issues
    if (storedTitle === requestedTitle){
      // console.log("Match found");
      res.render("post", {post})
    } else{
      // console.log("Match Not found");
      res.redirect("/");
    };
  });

  });


//using mongodb for general
app.route("/articles")

.get(function(req,res){
  getBlogPosts.then(function(foundPosts){
      res.send(foundPosts);
  });
})

.post(function(req, res){

  const newBlogPost = new BlogPost({
    title: req.body.title,
    content: req.body.content
  });

  newBlogPost.save();
})

.delete(function(req, res){

  BlogPost.deleteMany({});
});

//using mongoDB for specific articles
app.route("/articles/:articleTitle")

.get(function(req, res){
  
  findExists(req.params.articleTitle).then(function(foundArticle){
    if (foundArticle) {
      res.send(foundArticle);
    } else {
      res.send("No articles matching that title was found.");
    }
  });
})

.put(function(req, res){

  BlogPost.update(
    {title: req.params.articleTitle},
    {title: req.body.title, content: req.body.content},
    {overwrite: true}
  );
})

.patch(function(req, res){

  BlogPost.update(
    {title: req.params.articleTitle},
    {$set: req.body},
  );
})

.delete(function(req, res){

  BlogPost.deleteOne(
    {title: req.params.articleTitle},
    function(err){
      if (!err){
        res.send("Successfully deleted the corresponding article.");
      } else {
        res.send(err);
      }
    }
  );
});



app.listen(3000, function() {
  console.log("Server started on port 3000");
});
