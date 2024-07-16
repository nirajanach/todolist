//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
require("dotenv").config();
// console.log(process.env);

const port = process.env.PORT || 3000;

const app = express();

// Set up mongoose connection

const mongoDB = process.env.MONGODB_URI;


app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
mongoose.set("strictQuery", false);

// mongoose.connect(mongoDB);


const connectDB = async () => {
  try {
    const conn = await mongoose.connect(mongoDB);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};





const itemsSchema = {
  name: String,
};

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name: "Welcome to the To-do list app.",
});

const item2 = new Item({
  name: "Hit the + button to add a new item to the list.",
});

const item3 = new Item({
  name: "<--- Check the box to delete an item from the list.",
});

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemsSchema],
};

const List = mongoose.model("List", listSchema);

// const items = ["Buy Food", "Cook Food", "Eat Food"];
// const workItems = [];

app.get("/", function (req, res) {
  Item.find({}, function (err, foundItems) {
    if (foundItems.length === 0) {
      Item.insertMany(defaultItems, function (err) {
        if (err) {
          console.log(err);
        } else {
          console.log("Success adding");
        }
      });
      res.redirect("/");
    } else {
      res.render("list", { listTitle: "To-do lists", newListItems: foundItems });
      // console.log(foundItems);
    }
  });
});

app.post("/", function (req, res) {
  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName,
  });

  if (listName === "Today") {
    item.save();
    res.redirect("/");
  } else {
    List.findOne({name: listName}, function(err, foundList) {
      // console.log(foundList);
      // console.log(listName);
       foundList.items.push(item);
       foundList.save();
       res.redirect("/" + listName);
      // if(!err){
       
      // }
    });
  }


  // if (req.body.list === "Work") {
  //   workItems.push(item);
  //   res.redirect("/work");
  // } else {
  //   items.push(item);
  //   res.redirect("/");
  // }
});

app.get("/:customListName", (req, res) => {

  const customListName = _.capitalize(req.params.customListName);

  List.findOne({ name: customListName }, function (err, foundListItems) {
    if (!err) {
      if (!foundListItems) {
        const list = new List({
          name: customListName,
          items: defaultItems,
        });

        list.save();
        res.redirect("/" + customListName);

        // console.log("Doesnot exists");
      } else {
        // console.log("exists");
        res.render("list", {
          listTitle: foundListItems.name,
          newListItems: foundListItems.items,
        });
      }
    }
  });

  // List.findOne({name:customListName}, function(err,results) {
  //   if(err) {
  //     console.log(err);
  //   } else if(results.length = []) {
  //     console.log("Doesnot exists");
  //

  //   }
  //   else {
  //     console.log("exists");
  //   }

  // })

  //  list.save();
});

app.post("/delete", function (req, res) {
  const checkItemId = req.body.checkbox;
  const listnamefromButton = req.body.listName;
  // const itemName = req.body.newItem;

  if (listnamefromButton === "Today") {
 Item.findByIdAndRemove(checkItemId, function (err) {
   if (!err) {
     console.log("successfully deleted");
     res.redirect("/");
   }
 });

  } else {

    List.findOneAndUpdate({name: listnamefromButton}, {$pull: {items: {_id: checkItemId}}}, function(err, foundList) {

    if (!err) {
      res.redirect("/" + listnamefromButton)
    }
    })
  }

 

});

// app.get("/work", function (req, res) {
//   res.render("list", { listTitle: "Work List", newListItems: workItems });
// });

app.get("/about", function (req, res) {
  res.render("about");
});



connectDB().then(() => {
  app.listen(port, () => {
    console.log("Server Started with database");
  });
});

// app.listen(port, function () {
//   console.log("Server started on " + port );
// });
