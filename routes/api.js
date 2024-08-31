/*
*
*
*       Complete the API routing below
*       
*       
*/

'use strict';
require('dotenv').config();
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const Books = require('../models/books.js');

mongoose.connect(process.env.MONGO_URI);

module.exports = function (app) {

  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));

  app.route('/api/books')
    .get(async function (req, res){
      //response will be array of book objects
      //json res format: [{"_id": bookid, "title": book_title, "commentcount": num_of_comments },...]
      const allBooks = await Books.aggregate([
        {
          $project: { _id: 1, title: 1, commentcount: {$size: "$comments"} }
        }
      ]);
      console.log(allBooks);
      res.json(allBooks);
    })
    
    .post(async function (req, res){
      let title = req.body.title;
      if (!title) { return res.send("missing required field title")};
      console.log("post add new book to the library: ", title);
      let newBook = new Books({
        title: title
      });

      try {
        const saveBook = await newBook.save();
        const newID = saveBook._id;
        const result = await Books.findById(newID).select(['_id', 'title']).exec();
        res.json(result);
      } catch (err) {
        res.json(err.message);
      }

      //response will contain new book object including atleast _id and title
    })
    
    .delete(async function(req, res){
      //if successful response will be 'complete delete successful'
      try {
        const deleteAllBooks = await Books.deleteMany({ }).exec();
        res.send("complete delete successful")
      } catch (err) {
        res.json(err.message)
      }
    });



  app.route('/api/books/:id')
    .get(async function (req, res){
      let bookid = req.params.id;
      //json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}
      try {
        const thisBook = await Books.findById(bookid).select(['_id', 'title', 'comments']).exec();
        console.log("Get book. ID: ", bookid, " Title: ", thisBook.title);
        if (!thisBook) { return res.send("no book exists") }
        res.json(thisBook);
      } catch (err) {
        res.send("no book exists");
      }
    }) 
    
    .post(async function(req, res){
      let bookid = req.params.id;
      let comment = req.body.comment;
      //json res format same as .get
      if (!comment) { return res.send("missing required field comment")}
      try {
        const updatedBook = await Books.findOneAndUpdate({"_id": bookid}, {$push: {comments: comment}}, { returnDocument: 'after' }).select(['_id', 'title', 'comments']).exec();
        if (!updatedBook) { return res.send("no book exists") }
        res.json(updatedBook);
      } catch (err) {
        res.send("no book exists");
      }
    })
    
    .delete(async function(req, res){
      let bookid = req.params.id;
      //if successful response will be 'delete successful'
      try {
        const deleteBook = await Books.deleteOne({"_id": bookid}).exec();
        console.log(`deleteBook response for ${bookid}: `, deleteBook);
        if (deleteBook.deletedCount === 0) { return res.send("no book exists") }
        res.send("delete successful");
      } catch (err) {
        res.send("no book exists");
      }
    });
  
};
