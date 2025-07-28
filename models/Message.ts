// File: /models/Message.ts

import mongoose, { Schema, Document } from "mongoose";

export interface IMessage extends Document {
  sender: mongoose.Types.ObjectId;
  receiver?: mongoose.Types.ObjectId;
  group?: mongoose.Types.ObjectId;
  content?: string;                 // optional if `post` is provided
  post?: mongoose.Types.ObjectId;    // optional if `content` is provided
  createdAt: Date;
}

const MessageSchema: Schema = new Schema(
  {
    sender: { type: Schema.Types.ObjectId, ref: "User", required: true },

    // `receiver` is required only if `group` is not provided
    receiver: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: function (this: IMessage) {
        return !this.group;
      },
    },

    // `group` is required only if `receiver` is not provided
    group: {
      type: Schema.Types.ObjectId,
      ref: "Group",
      required: function (this: IMessage) {
        return !this.receiver;
      },
    },

    // Either `content` or `post` must be provided (or both).
    content: {
      type: String,
      trim: true,
      validate: {
        validator() { return !!this.content || !!this.post; },
        message: "Either content or post must be provided.",
      },
    },
    post: {
      type: Schema.Types.ObjectId,
      ref: "Post",
      validate: {
        validator() { return !!this.content || !!this.post; },
        message: "Either content or post must be provided.",
      },
    },
    
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

// Create index so that either receiver or group is required, but not both at the same time
MessageSchema.index(
  { receiver: 1, group: 1 },
  {
    partialFilterExpression: {
      $or: [{ receiver: { $exists: true } }, { group: { $exists: true } }],
    },
  }
);

const MessageModel =
  mongoose.models.Message || mongoose.model<IMessage>("Message", MessageSchema);
export default MessageModel;
