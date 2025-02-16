import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import jwt, { JwtPayload } from 'jsonwebtoken'; 
import User from '@/models/User'; 
import UserProfileModel from '@/models/userProfile';

export async function GET(req: NextRequest) {
  // Retrieve the token from cookies
  
  const token = req.cookies.get('token')?.value;
  if (!token) {
    
    return NextResponse.json({ error: "No token found" }, { status: 401 });
  }

  try {
    // Decode the JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;

    // Ensure the decoded token has the id property
    if (!decoded || !decoded.id) {
    
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // Find user and user profile in the database
    const users = await User.find({}); // Fetch all user data

 
    const user = await User.findById(decoded.id);
    
    const userProfile = await UserProfileModel.findOne({ userId: decoded.id });

    if (user) {
      return NextResponse.json({ 
        username: user.username, 
        age: user.age, 
        _id: user._id, 
        skills: userProfile?.skills || [], 
        experiences: userProfile?.experiences || [], 
        about: userProfile?.about || "",
       professions: userProfile?.professions || [],
       interests: userProfile?.interests || [],
       profilePicture: userProfile?.profilePicture ||"",
       users 
        
      });
    } else {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
  } catch (error) {

    return NextResponse.json({ error: "Invalid token" }, { status: 401 });

  }
}
