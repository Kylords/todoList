//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");

const mongoose = require("mongoose")

const app = express();

const _ = require("lodash");

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

main().catch(err => console.log(err));

async function main() {

  await mongoose.connect('mongodb+srv://mikayloveloria:Rtph1SPDPvcvLcG6@cluster0.ao394kk.mongodb.net/todolistDB'); 
  // await mongoose.connect('mongodb://127.0.0.1/todolistDB'); 
  console.log("Connected");

  /* CREATING OUR SCHEMA */

  const itemsSchema = new mongoose.Schema({
    name: {
      type: String,
      required: "Please check your data entry, there's no name specified"
    }
  });

  const listSchema = new mongoose.Schema({
    name: String,
    items: [itemsSchema]

  });

  const Item = mongoose.model("Item", itemsSchema);
  const List = mongoose.model("List", listSchema);



  /* CREATING a single document */

  const item1 = new Item({
    name: "Welcome to your to-do list"
  });

  const item2 = new Item({
    name: "Hit the + button to add new items"
  });

  const item3 = new Item({
    name: "<-- Hit this to delete an item"
  });

  const defaultItems = [item1, item2, item3];


  app.get("/", async function (req, res) {
    const foundItems = await Item.find({});

    if (!(await Item.exists())) {
      await Item.insertMany(defaultItems);
      res.redirect("/");
    } else {
      res.render("list", { listTitle: "Today", newListItems: foundItems });
    }
  });

  app.post("/", function (req, res) {
    const itemName = req.body.newItem;
    const listName = req.body.list;

    const item = new Item({
      name: itemName
    });

    if (listName === "Today") { // for default route saving items
      item.save();

      res.redirect("/");
 
    } else { // for custom route saving items
      List.findOne({name: listName}).then(async function (foundList) {
        foundList.items.push(item);
        foundList.save();
        res.redirect("/" + listName);
      })
    }

  });

  app.post("/delete", async function (req, res) {
    const checkedItemId = req.body.checkbox;
    const listName = req.body.listName;

    if (listName === "Today") {
      await Item.deleteOne({ _id: checkedItemId });
      res.redirect("/");
    } else {
      await List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}});
      res.redirect("/" + listName);
    }

  })

  app.get("/:customList", async function (req, res) {
    const customListName = _.capitalize(req.params.customList);

    await List.findOne({ name: customListName }).then(async function (foundList) {

      // For checking if the typed rotue already exists. If not, it'll create a new list with the default Items
      // If it already exists, then it will show the items in that list
      if (!(foundList)) {
        const list = new List({
          name: customListName,
          items: defaultItems
        });

        list.save();
        res.redirect("/" + customListName);
      } else {
        res.render("list", { listTitle: foundList.name, newListItems: foundList.items });
      }
    })

    // if (!(findName)) {
    //   console.log("Item does not exist")
    // } else {
    //   console.log("Exists")
    // }



    //  list.save();

  })

  app.get("/about", function (req, res) {
    res.render("about");
  });

}


app.listen(3000, function () {
  console.log("Server started on port 3000");
});


