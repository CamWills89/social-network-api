const { Schema, model, Types } = require("mongoose");

// var validateEmail = function (email) {
//   var validEmail = /^([a-zA-Z0-9_\.-]+)@([\da-z\.-]+)\.([a-z]{2,6})(\.[a-z]{2,6})?$/;
//   return validEmail.test(email);
// };

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
      {
        type: Schema.Types.ObjectId,
        ref: "Thought",
      },
    ],
    friends: [
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

//get total count of friends on retrieval
UserSchema.virtual("friendCount").get(function () {
  return this.friends.length;
});

//get total count of thoughts on retrieval
UserSchema.virtual("thoughtCount").get(function () {
  return this.thoughts.reduce(
    (total, thought) => total + thought.reactions.length + 1,
    0
  );
});
