import { GuideCard } from "../GuideCard";
import guideAvatar from "@assets/generated_images/latina_female_tour_guide_portrait.png";

export default function GuideCardExample() {
  return (
    <div className="w-full max-w-xs">
      <GuideCard
        id="guide-1"
        name="María González"
        location="Cancún, México"
        avatarUrl={guideAvatar}
        rating={4.8}
        reviewCount={85}
        tourCount={12}
        specialties={["Playa", "Snorkel", "Cultura Maya"]}
        verified
      />
    </div>
  );
}
