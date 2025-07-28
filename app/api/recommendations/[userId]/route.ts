import { NextResponse } from "next/server";
import { dbConnect } from "../../../../lib/mongodb";
import UserProfileModel from "../../../../models/userProfile";
import * as tf from "@tensorflow/tfjs";
import User from "@/models/User";
interface UserProfile {
  _id: any;
  userId: any; // Add userId to the interface
  username: string;
  interests: string[];
  
}
function buildVocabulary(users: UserProfile[]): string[] {
  const vocabSet = new Set<string>();
  users.forEach((user) => {

    const interests = user.interests ?? [];
    [ ...interests].forEach((token) => {
      vocabSet.add(token.toLowerCase());
    });
  });
  return Array.from(vocabSet);
}

/**
 * Vectorize a user profile into a bag-of-words vector.
 */
function vectorizeProfile(user: UserProfile, vocab: string[]): number[] {
  const vector = new Array(vocab.length).fill(0);
  if (!Array.isArray(user.interests)) {
    console.warn(`User ${user.username} has invalid interests data.`);
    return vector;
  }
  const tokens = user.interests.map((token) => token.toLowerCase());
  tokens.forEach((token) => {
    const index = vocab.indexOf(token);
    if (index !== -1) vector[index] += 1;
  });
  return vector;
}


/**
 * Compute cosine similarity between two 1D tensors.
 */
function cosineSimilarityTensor(vec1: tf.Tensor1D, vec2: tf.Tensor1D): number {
  const dotProduct = vec1.dot(vec2).dataSync()[0];
  const norm1 = vec1.norm().dataSync()[0];
  const norm2 = vec2.norm().dataSync()[0];
  if (norm1 === 0 || norm2 === 0) return 0;
  return dotProduct / (norm1 * norm2);
}
// ... (rest of the helper functions remain the same)
export async function GET(
  request: Request,
  { params: { userId } }: { params: { userId: string } }
) {
  if (!userId) {
    return NextResponse.json(
      { error: "Missing target user id" },
      { status: 400 }
    );
  }

  await dbConnect();

  // Get all user profiles and users (from User model)
  const userProfiles: UserProfile[] = await UserProfileModel.find({}).lean();
  const users: User[] = await User.find({}).lean();

  // Find target profile from userProfiles collection
  const targetUserProfile = userProfiles.find((u) => u.userId.toString() === userId);
  if (!targetUserProfile) {
    return NextResponse.json(
      { error: "Target user not found" },
      { status: 404 }
    );
  }

  // Build vocabulary and vectorize profiles
  const vocab = buildVocabulary(userProfiles);
  const userVectors = userProfiles.map((profile) => vectorizeProfile(profile, vocab));
  const tensorData = tf.tensor2d(userVectors);

  // Get the index of the target user profile
  const targetIndex = userProfiles.findIndex((u) => u.userId.toString() === userId);
  if (targetIndex === -1) {
    return NextResponse.json(
      { error: "Target user index not found" },
      { status: 404 }
    );
  }

  const targetVector = tensorData
    .slice([targetIndex, 0], [1, vocab.length])
    .squeeze() as tf.Tensor1D;

  // Compute cosine similarity between target user and every other profile
  const similarities = userProfiles.map((profile, index) => {
    if (index === targetIndex) return { profile, similarity: 0 };
    const currentVector = tensorData
      .slice([index, 0], [1, vocab.length])
      .squeeze() as tf.Tensor1D;
    const similarity = cosineSimilarityTensor(targetVector, currentVector);
    return { profile, similarity };
  });

  // Sort recommendations by similarity, pick top 5 and join with the User model data
  const recommendations = similarities
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, 5)
    .map((rec) => {
      // Find the corresponding user from the User model using userId
      const correspondingUser = users.find(
        (u) => u._id.toString() === rec.profile.userId.toString()
      );
      return {
        // Return all recommendation info, and add username from the User model.
        ...rec,
        username: correspondingUser ? correspondingUser.username : null
      };
    });

  return NextResponse.json({ recommendations });
}
