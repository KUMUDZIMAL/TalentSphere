import { useEffect, useState } from 'react';

export default function Profile({ userId }: { userId: string }) {
  const [profilePicture, setProfilePicture] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfilePicture = async () => {
      const response = await fetch(`/api/auth/userprofile`);
      const data = await response.json();
      console.log(data.exists)
      setProfilePicture(data. profilePicture);
    };

    fetchProfilePicture();''
  }, [userId]);

  return (
    <div>
    
      {profilePicture ? (
        <img
          src={profilePicture}
          alt="Profile"
          style={{ width: '150px', height: '150px', borderRadius: '50%' }}
        />
      ) : (
        <p>No profile picture set</p>
      )}
    </div>
  );
}