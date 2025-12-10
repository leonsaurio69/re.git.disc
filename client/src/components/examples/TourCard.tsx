import { TourCard } from "../TourCard";
import machuPicchu from "@assets/generated_images/machu_picchu_dramatic_sunrise.png";
import guideAvatar from "@assets/generated_images/latino_male_tour_guide_portrait.png";

export default function TourCardExample() {
  return (
    <div className="w-full max-w-sm">
      <TourCard
        id="tour-1"
        title="Aventura Épica en Machu Picchu - Camino del Inca"
        location="Cusco, Perú"
        price={299}
        duration="4 días"
        maxGroupSize={12}
        rating={4.9}
        reviewCount={128}
        imageUrl={machuPicchu}
        guideAvatarUrl={guideAvatar}
        guideName="Carlos Mendoza"
        featured
      />
    </div>
  );
}
