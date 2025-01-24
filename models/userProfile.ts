import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IUser extends Document {
    userId: Schema.Types.ObjectId;
    username: string;
  profilePicture?: string;
  posts: mongoose.Types.ObjectId[]; // Array of post IDs
  followers: mongoose.Types.ObjectId[]; // Array of userProfile IDs who follow this userProfile
  following: mongoose.Types.ObjectId[]; // Array of userProfile IDs this userProfile follows
  interests: string[]; // Array of interests/tags
  createdAt: Date;
  updatedAt: Date;


}

const UserSchema: Schema<IUser> = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    username: { type: String, ref: "User", required: true },
    profilePicture: {
        type: String,
        default: '', // Default to an empty string if no profile picture is set
      },
      posts: [
        {
          type: Schema.Types.ObjectId,
          ref: 'Post', // Reference to the Post model
        },
      ],
      followers: [
        {
          type: Schema.Types.ObjectId,
          ref: 'User', // Reference to the userProfile model (self-reference)
        },
      ],
      following: [
        {
          type: Schema.Types.ObjectId,
          ref: 'User', // Reference to the userProfile model (self-reference)
        },
      ],
      interests: [
        {
          type: String,
          trim: true,
        },
      ],
    },
    {
      timestamps: true, // Automatically add `createdAt` and `updatedAt` fields
    }
      

);

const userProfile: Model<IUser> = mongoose.models.userProfile || mongoose.model<IUser>('userProfile', UserSchema);

export default userProfile;
