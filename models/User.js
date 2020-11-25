const { Schema, model, Types } = require("mongoose");

const UserSchema = new Schema(
  {
    username: {
      type: String,
      unique: true,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      unique: true,
      required: [true, "Email required"],
      //validate the email address with a regex
      validate: {
        validator(validEmail) {
          return /^([a-zA-Z0-9_\.-]+)@([\da-z\.-]+)\.([a-z]{2,6})(\.[a-z]{2,6})?$/.test(
            validEmail
          );
        },
        message: "Please enter a valid email",
      },
    },
    thoughts: [
      //expect an objectId and the data comes from the Thought model
      {
        type: Schema.Types.ObjectId,
        ref: "Thought",
      },
    ],
    friends: [
      //expect an objectId and is self-referencing the User model
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    toJSON: {
      virtuals: true,
    },
    id: false,
  }
);

//get total count of friends
UserSchema.virtual("friendCount").get(function () {
  return this.friends.length;
});

//create the User model using UserSchema
const User = model("User", UserSchema);

//export the User model
module.exports = User;
