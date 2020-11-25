const { User, Thought } = require("../models");

const userController = {
  // get all users
  // GET /api/users
  getAllUsers(req, res) {
    User.find({})
      .populate({
        path: "thoughts",
        //we dont want the __v included in the thoughts
        select: "-__v",
      })
      //we dont want the __v included in the user data either
      .select("-__v")
      //newest user returns first using sort (-1, says in DESC order by id value)
      .sort({ _id: -1 })
      .then((dbUserData) => res.json(dbUserData))
      .catch((err) => {
        console.log(err);
        res.status(400).json(err);
      });
  },

  // get one user by id
  // GET /api/users/id
  getUserById({ params }, res) {
    User.findOne({ _id: params.id })
      .populate({
        path: "thoughts",
        select: "-__v",
      })
      .select("-__v")
      .then((dbUserData) => {
        if (!dbUserData) {
          res.status(404).json({ message: "No user found with this id!" });
          return;
        }
        res.json(dbUserData);
      })
      .catch((err) => {
        console.log(err);
        res.status(400).json(err);
      });
  },

  //create user
  // POST /api/users
  createUser({ body }, res) {
    User.create(body)
      .then((dbUserData) => res.json(dbUserData))
      .catch((err) => res.status(400).json(err));
  },

  //update User by id
  // PUT /api/users/id
  updateUser({ params, body }, res) {
    User.findOneAndUpdate({ _id: params.id }, body, {
      new: true,
      runValidators: true,
    })
      .then((dbUserData) => {
        if (!dbUserData) {
          res.status(404).json({ message: "No user found with this id!" });
          return;
        }
        res.json(dbUserData);
      })
      .catch((err) => res.status(400).json(err));
  },

  //delete user
  // DELETE /api/users/id
  deleteUser({ params }, res) {
    // delete the user
    User.findOneAndDelete({ _id: params.id })
      .then((dbUserData) => {
        if (!dbUserData) {
          res.status(404).json({ message: "No user found with this id" });
          return;
        }
        // remove the user from any friends arrays
        User.updateMany(
          //look for id in friends array and remove it
          { _id: { $in: dbUserData.friends } },
          { $pull: { friends: params.id } }
        )
          .then(() => {
            // remove any thoughts from this user
            Thought.deleteMany({ username: dbUserData.username })
              .then(() => {
                res.json({ message: "Successfully deleted user" });
              })
              .catch((err) => res.status(400).json(err));
          })
          .catch((err) => res.status(400).json(err));
      })
      .catch((err) => res.status(400).json(err));
  },

  //add a Friend
  //POST /api/users/:userId/friends/:friendId
  addFriend({ params }, res) {
    User.findByIdAndUpdate(
      { _id: params.id },
      //we add to set, so we prevent duplicates friend ids being added.
      { $addToSet: { friends: params.friendId } },
      { new: true }
    )
      .select("-__v")
      .then((dbUserData) => {
        if (!dbUserData) {
          res.status(404).json({ message: "No user found with this id!" });
          return;
        }
        res.json(dbUserData);
      })
      .catch((err) => {
        res.status(400).json(err);
      });
  },

  //remove a Friend
  //DELETE /api/users/:userId/friends/:friendId
  removeFriend({ params }, res) {
    User.findByIdAndUpdate(
      { _id: params.id },
      { $pull: { friends: params.friendId } },
      { new: true, runValidators: true }
    )
      .select("-__v")
      .then((dbUserData) => {
        if (!dbUserData) {
          res.status(404).json({ message: "No friend found with this id!" });
          return;
        }
        res.json(dbUserData);
      })
      .catch((err) => res.status(400).json(err));
  },
};

module.exports = userController;
