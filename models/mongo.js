const mongoose = require("mongoose");
const rating = require("./rating.js");

const listingSchema = new mongoose.Schema ({
   title: String,
   description : String,
   image: {
    filename : String,
    url: String
   },
   price: Number,
   location : String,
   country: String,
   ratings:[
      {
         type:mongoose.Schema.Types.ObjectId,
         ref:"rating"
       }
   ],
   owner:[
      {
         type:mongoose.Schema.Types.ObjectId,
         ref:"user"
      }
   ],
   map: {
        type: {
          type: String, // Don't do `{ location: { type: String } }`
          enum: ['Point'] // 'location.type' must be 'Point'
        },
        coordinates: {
          type: [Number]
      }
    }
})

//Post request to delete reviews when page deleted.
listingSchema.post("findOneAndDelete",async(lists)=>{
   await rating.deleteMany({_id:{$in: lists.ratings}})
})

const list = mongoose.model("list", listingSchema)
module.exports = list;
