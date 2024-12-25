import mongoose, { Schema, model } from "mongoose";
import { hash } from "bcrypt";

const schema = new Schema({
   name: {
      type: String,
      required: true,
   },
   bio: {
      type: String,
   },
   username: {
      type: String,
      unique: true,
      required: true,
   },
   password: {
      type: String,
      select: false, 
      required: true,
   },
   avatar: {
      public_id: {
         type: String,
         required: true,
      },
      url: {
         type: String,
         required: true,
      },
   },
},
{
   timestamps: true
});

// password hashing
 schema.pre("save", async function (next) {
   if (!this.isModified("password")) return next(); 
   this.password = await hash(this.password, 10);
   return next(); 
});

// schema.pre("save", async function (next) {
//    try {
//       if (this.isModified("password")) {
//          this.password = await hash(this.password, 10);
//       }
//       next();
//    } catch (err) {
//       next(err); // Pass error to next middleware
//    }
// });


export const User = mongoose.models.User || model("User", schema);
