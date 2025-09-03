import { ProfileCard } from "@/components/profile-card";
import { otherUsers, matchedUsers } from "@/lib/mock-data";

export default function DiscoverPage() {
  // In a real app, we would call the matchUsersByPersonality AI flow here.
  // For this example, we use mock data.
  const usersWithData = matchedUsers.map(match => {
    const user = otherUsers.find(u => u.id === match.userId);
    return { ...user, ...match };
  }).filter(u => u.id); // Filter out any potential mismatches

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {usersWithData.map((user) => (
         // We can safely assert user is not undefined due to filter
        <ProfileCard key={user.id} user={user!} compatibilityScore={user.compatibilityScore} />
      ))}
    </div>
  );
}
