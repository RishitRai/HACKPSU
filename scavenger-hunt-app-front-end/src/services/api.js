// src/services/api.js
export const fetchScavengerHunt = (city, budget) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        {
          id: 1,
          name: "Museum of Modern Art",
          shortDescription: "Explore world-class art exhibits.",
          description: "A wonderful place to enjoy modern art from around the world.",
          address: `123 Art St, ${city}`,
          image: "https://source.unsplash.com/600x400/?museum,art", // Random art-related image
        },
        {
          id: 2,
          name: "Central Park",
          shortDescription: "Relax in a peaceful, natural setting.",
          description: "A large urban park perfect for walks, picnics, and sightseeing.",
          address: `456 Park Ave, ${city}`,
          image: "https://source.unsplash.com/600x400/?park,nature", // Random park image
        },
        {
          id: 3,
          name: "Historic District",
          shortDescription: "Step back in time and explore history.",
          description: "Visit historic sites and landmarks from different eras.",
          address: `789 History Rd, ${city}`,
          image: "https://source.unsplash.com/600x400/?historic,building", // Random historic building
        },
      ]);
    }, 2000);
  });
};
