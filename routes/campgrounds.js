const express = require("express");
const router = express.Router();
const Campground = require("../models/campground");
const middleware = require("../middleware");

//INDEX - show all campgrounds
router.get("/", function(req, res){
    // Get all campgrounds from DB
    Campground.find({}, function(err, allCampgrounds){
       if(err){
           console.log(err);
       } else {
          res.render("campgrounds/index",{campgrounds: allCampgrounds, page: 'campgrounds'});
       }
    });
});

//CREATE
router.post("/", middleware.isLoggedIn, function(req,res){
    //get data from form and add to campgrounds array
    let name = req.body.name;
    let image = req.body.image;
    let price = req.body.price;
    let desc = req.body.description;
    let author = {
        id: req.user._id,
        username: req.user.username
    };
    let newCampground = {name: name, image: image,price:price, description: desc, author: author};
    //Create a new campground and save to DB
    Campground.create(newCampground,function(err,newlyCreated){
        if(err){
            console.log(err);
        }
        else {
            //redirect back to campgrounds page
            res.redirect("/campgrounds");
        }
    });
});

//NEW
router.get("/new", middleware.isLoggedIn, function(req, res)
{
    res.render("campgrounds/new");
});


// SHOW -shows more info about one campground
router.get("/:id", function(req, res){
    //find the campground with provided ID
    Campground.findById(req.params.id).populate("comments").exec(function(err,foundCampground){
        if(err){
            console.log(err);
            req.flash("error","Campground not found");
        }
        else {
            //render show template with that campground
            res.render("campgrounds/show",{campground: foundCampground});
        }
    }); 
});

//EDIT Campground Route
router.get("/:id/edit", middleware.checkCampgroundOwnership, function(req,res){
    Campground.findById(req.params.id, function (err, foundCampground) {
        if(err)
        {
            req.flash("error","Campground not found");
        }
        res.render("campgrounds/edit", {campground: foundCampground})
    });
});

//Update Campground route
router.put("/:id", middleware.checkCampgroundOwnership, function (req,res) {
    //find and update the correct campground
    Campground.findByIdAndUpdate(req.params.id,req.body.campground, function(err, updatedCampground){
        if(err){
            req.flash("error","Campground not found");
            res.redirect("/campgrounds");
        }
        else
        {
            res.redirect("/campgrounds/"+ req.params.id);
        }
        
    });
    //redirect somewhere
});

//Destory Route
router.delete("/:id", middleware.checkCampgroundOwnership, function (req,res) {
   Campground.findByIdAndDelete(req.params.id, function(err){
       if(err){
           console.log(err);
           req.flash("error","Campground not found");
           res.redirect("/campgrounds");
       }
       else {
           res.redirect("/campgrounds")
       }
   })
});

module.exports = router;