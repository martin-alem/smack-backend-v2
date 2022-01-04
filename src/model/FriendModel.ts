import mongoose from "mongoose";

const FriendSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  picture: {
    type: String,
    required: true,
  },
  friendId: {
    type: mongoose.Types.ObjectId,
    required: true,
  },

  status: {
    type: String,
    required: true,
  },
  dateJoined: {
    type: Date,
    required: true,
  },

  date: {
    type: Date,
    required: true,
  },
});

export function createFriendCollection(customCollection: string) {
  const Friend = mongoose.model(customCollection, FriendSchema);
  Friend.createCollection();
}

export function getFriendModel(collection: string) {
  return mongoose.model(collection, FriendSchema);
}
