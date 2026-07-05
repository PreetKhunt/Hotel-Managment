import { supabase } from '../config/supabase';
import { v4 as uuidv4 } from 'uuid';

const imageSets = {
  standard: [
    "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800",
    "https://images.unsplash.com/photo-1590490359683-658d3d23f972?w=800",
    "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800",
    "https://images.unsplash.com/photo-1560067174-c5a3a8f37060?w=800",
    "https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800"
  ],
  deluxe: [
    "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=1200",
    "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=1200",
    "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=1200",
    "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=1200",
    "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1200"
  ],
  suite: [
    "https://images.unsplash.com/photo-1574643156929-51fa098b0394?w=1200",
    "https://images.unsplash.com/photo-1631049552057-403cdb8f0658?w=1200",
    "https://images.unsplash.com/photo-1505693314120-0d443867891c?w=1200",
    "https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=1200",
    "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=1200"
  ],
  villa: [
    "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1200",
    "https://images.unsplash.com/photo-1510798831971-661eb04b3739?w=1200",
    "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?w=1200",
    "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200",
    "https://images.unsplash.com/photo-1572120360610-d971b9d7767c?w=1200"
  ],
  family: [
    "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=1200",
    "https://images.unsplash.com/photo-1540518614846-7eded433c457?w=1200",
    "https://images.unsplash.com/photo-1598928506311-c55d43f9241f?w=1200",
    "https://images.unsplash.com/photo-1502005097973-6a7082348e28?w=1200",
    "https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=1200"
  ],
  royal: [
    "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200",
    "https://images.unsplash.com/photo-1583847268964-b28ce8f99283?w=1200",
    "https://images.unsplash.com/photo-1581404176472-a1f0a9972bba?w=1200",
    "https://images.unsplash.com/photo-1616486028424-697dc957c5f8?w=1200",
    "https://images.unsplash.com/photo-1591825729269-caeb344f6df2?w=1200"
  ]
};

// Create a small helper to generate random variations of the image arrays
function getImages(baseArray: string[]) {
  // Shuffle array and return a subset of 4-5 images
  const shuffled = [...baseArray].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.floor(Math.random() * 2) + 4);
}

const amenitiesPool = [
  "Ocean View", "City View", "Mountain View", "Balcony", "Private Pool", 
  "Jacuzzi", "Bathtub", "Smart TV", "Mini Bar", "Coffee Machine", 
  "Workspace", "High-Speed WiFi", "Air Conditioning", "Butler Service", 
  "Kitchenette", "Dining Area", "Walk-in Closet", "Luxury Bathroom", 
  "Rain Shower", "Complimentary Breakfast", "Lounge Access"
];

function getRandomAmenities(min: number, max: number, mustHave: string[] = []) {
  const count = Math.floor(Math.random() * (max - min + 1)) + min;
  const pool = amenitiesPool.filter(a => !mustHave.includes(a));
  const shuffled = pool.sort(() => 0.5 - Math.random());
  const selected = [...mustHave, ...shuffled.slice(0, count - mustHave.length)];
  return selected;
}

const rooms = [
  // STANDARD (4)
  {
    name: 'Classic Standard Room', type: 'Standard', price: 20000, capacity: 2, size: 280,
    bed_type: 'Queen Bed', floor: 2, rating: 4.6, review_count: 245, featured: false,
    description: 'A cozy and elegantly designed standard room perfect for short stays.',
    long_description: 'Our Classic Standard Room offers a harmonious blend of comfort and style. Featuring a plush Queen Bed dressed in premium linens, a functional workspace, and a modern en-suite bathroom with a rain shower. Enjoy seamless connectivity with complimentary high-speed Wi-Fi and a 42-inch Smart TV for your entertainment.',
    images: getImages(imageSets.standard), amenities: getRandomAmenities(4, 6, ["High-Speed WiFi", "Air Conditioning", "Smart TV"])
  },
  {
    name: 'City View Standard', type: 'Standard', price: 23000, capacity: 2, size: 300,
    bed_type: 'Queen Bed', floor: 3, rating: 4.7, review_count: 312, featured: false,
    description: 'Enjoy vibrant city views from this comfortable and modern standard room.',
    long_description: 'Wake up to the energetic pulse of the city in our City View Standard room. Designed with the modern traveler in mind, this room features large soundproof windows, a cozy Queen Bed, and an ergonomic work area. The contemporary bathroom includes bespoke toiletries and a refreshing walk-in shower.',
    images: getImages(imageSets.standard), amenities: getRandomAmenities(4, 6, ["City View", "High-Speed WiFi", "Air Conditioning"])
  },
  {
    name: 'Standard Twin Room', type: 'Standard', price: 21000, capacity: 2, size: 320,
    bed_type: 'Twin Beds', floor: 2, rating: 4.5, review_count: 189, featured: false,
    description: 'Ideal for friends or colleagues traveling together with two comfortable twin beds.',
    long_description: 'The Standard Twin Room is perfectly appointed for two guests requiring separate sleeping arrangements. It offers two luxurious Twin Beds, a relaxed seating area, and all essential modern amenities. The bright and airy space ensures a restful stay after a busy day of exploring or meetings.',
    images: getImages(imageSets.standard), amenities: getRandomAmenities(4, 6, ["High-Speed WiFi", "Air Conditioning", "Mini Bar"])
  },
  {
    name: 'Superior Standard', type: 'Standard', price: 25000, capacity: 2, size: 340,
    bed_type: 'King Bed', floor: 4, rating: 4.8, review_count: 420, featured: false,
    description: 'An upgraded standard experience featuring a king-size bed and extra space.',
    long_description: 'Experience an elevated level of comfort in our Superior Standard room. Boasting a spacious layout and a magnificent King Bed, this room is designed for absolute relaxation. Enjoy premium coffee from the in-room machine while catching up on work or streaming your favorite shows on the 55-inch Smart TV.',
    images: getImages(imageSets.standard), amenities: getRandomAmenities(5, 7, ["High-Speed WiFi", "Coffee Machine", "Smart TV"])
  },

  // DELUXE (5)
  {
    name: 'Deluxe City View', type: 'Deluxe', price: 28000, capacity: 2, size: 400,
    bed_type: 'King Bed', floor: 5, rating: 4.8, review_count: 512, featured: false,
    description: 'Spacious deluxe room offering stunning panoramic city skyline views.',
    long_description: 'Our Deluxe City View room places you high above the bustling streets with floor-to-ceiling windows showcasing the impressive skyline. The room features a lavish King Bed, a dedicated lounge area, and a marble bathroom complete with a deep soaking tub and separate rain shower.',
    images: getImages(imageSets.deluxe), amenities: getRandomAmenities(6, 8, ["City View", "Bathtub", "Mini Bar"])
  },
  {
    name: 'Deluxe Ocean View', type: 'Deluxe', price: 32000, capacity: 2, size: 420,
    bed_type: 'King Bed', floor: 6, rating: 4.9, review_count: 842, featured: true,
    description: 'Experience breathtaking ocean views in our premium deluxe room featuring a king-size bed and private balcony.',
    long_description: 'Wake up to the sound of crashing waves in our Deluxe Ocean View room. Step out onto your private furnished balcony to take in the endless horizon. Inside, the room is a sanctuary of coastal luxury with a plush King Bed, elegant furnishings, and a spa-inspired bathroom.',
    images: getImages(imageSets.deluxe), amenities: getRandomAmenities(7, 9, ["Ocean View", "Balcony", "Bathtub", "Rain Shower"])
  },
  {
    name: 'Deluxe Garden Terrace', type: 'Deluxe', price: 30000, capacity: 2, size: 450,
    bed_type: 'King Bed', floor: 1, rating: 4.7, review_count: 275, featured: false,
    description: 'A serene deluxe room opening directly onto our lush landscaped gardens.',
    long_description: 'Perfect for nature lovers, the Deluxe Garden Terrace room offers direct access to our manicured botanical gardens from your private patio. The tranquil interior matches the outdoor serenity, featuring natural wood accents, a luxurious King Bed, and an oversized bathroom with a soaking tub.',
    images: getImages(imageSets.deluxe), amenities: getRandomAmenities(6, 8, ["Balcony", "Coffee Machine", "Bathtub"])
  },
  {
    name: 'Grand Deluxe Double', type: 'Deluxe', price: 31000, capacity: 4, size: 480,
    bed_type: 'Two Queen Beds', floor: 4, rating: 4.8, review_count: 388, featured: false,
    description: 'Ideal for small families or groups, featuring two queen beds and generous living space.',
    long_description: 'The Grand Deluxe Double is our most spacious deluxe offering, providing ample room for up to four guests. Two extremely comfortable Queen Beds ensure everyone rests well. The expansive layout includes a generous sitting area, dual vanities in the bathroom, and extensive closet space.',
    images: getImages(imageSets.deluxe), amenities: getRandomAmenities(6, 8, ["High-Speed WiFi", "Smart TV", "Mini Bar", "Walk-in Closet"])
  },
  {
    name: 'Corner Deluxe Room', type: 'Deluxe', price: 34000, capacity: 2, size: 500,
    bed_type: 'King Bed', floor: 7, rating: 4.9, review_count: 410, featured: false,
    description: 'Enjoy dual-aspect views and wrap-around windows in this bright and airy corner room.',
    long_description: 'Flooded with natural light, the Corner Deluxe Room offers spectacular dual-aspect views through expansive wrap-around windows. This highly sought-after room provides a remarkably spacious feel, featuring a premium King Bed, a chic lounging sofa, and an opulent bathroom bathed in sunlight.',
    images: getImages(imageSets.deluxe), amenities: getRandomAmenities(6, 8, ["City View", "Mountain View", "Bathtub", "Luxury Bathroom"])
  },

  // PREMIUM DELUXE (3)
  {
    name: 'Premium Horizon Deluxe', type: 'Premium', price: 40000, capacity: 2, size: 550,
    bed_type: 'King Bed', floor: 9, rating: 4.9, review_count: 220, featured: false,
    description: 'Elevated luxury on the higher floors with unparalleled horizon views and lounge access.',
    long_description: 'Situated on our premium floors, the Horizon Deluxe room offers sweeping, unobstructed views. Guests enjoy exclusive access to the Executive Lounge for complimentary breakfast and evening cocktails. The room itself is a masterpiece of design, featuring fine linens, state-of-the-art automation, and a spa-grade bathroom.',
    images: getImages(imageSets.suite), amenities: getRandomAmenities(8, 10, ["Lounge Access", "Complimentary Breakfast", "Ocean View", "Smart TV"])
  },
  {
    name: 'Premium Spa Deluxe', type: 'Premium', price: 46000, capacity: 2, size: 580,
    bed_type: 'King Bed', floor: 3, rating: 4.8, review_count: 145, featured: false,
    description: 'A wellness-focused retreat featuring an in-room jacuzzi and aromatherapy menu.',
    long_description: 'Designed for ultimate relaxation, the Premium Spa Deluxe is a wellness sanctuary. The highlight is the oversized in-room Jacuzzi and a curated aromatherapy menu to help you unwind. The deeply comfortable King Bed, ambient lighting controls, and premium organic bath amenities complete the rejuvenating experience.',
    images: getImages(imageSets.suite), amenities: getRandomAmenities(8, 10, ["Jacuzzi", "Luxury Bathroom", "Rain Shower"])
  },
  {
    name: 'Premium Club Room', type: 'Premium', price: 43000, capacity: 2, size: 520,
    bed_type: 'King Bed', floor: 10, rating: 4.9, review_count: 310, featured: true,
    description: 'Sophisticated design meets personalized service with Club level benefits and butler service.',
    long_description: 'The Premium Club Room is tailored for the discerning traveler. Enjoy dedicated Butler Service to handle your every need, from unpacking to dinner reservations. The refined interior features rich textures, a spacious work area, and breathtaking views, along with full access to the exclusive Club Lounge.',
    images: getImages(imageSets.suite), amenities: getRandomAmenities(8, 10, ["Butler Service", "Lounge Access", "Workspace", "City View"])
  },

  // EXECUTIVE ROOM (2)
  {
    name: 'Executive City Suite', type: 'Executive', price: 50000, capacity: 2, size: 650,
    bed_type: 'King Bed', floor: 11, rating: 4.8, review_count: 280, featured: false,
    description: 'A brilliantly designed open-plan suite offering sophisticated style for business or leisure.',
    long_description: 'The Executive City Suite offers an expansive open-plan layout that seamlessly divides the sleeping and living areas. Designed with business executives in mind, it features a large ergonomic workspace, high-speed connectivity, and a comfortable seating area for informal meetings, all wrapped in modern luxury.',
    images: getImages(imageSets.suite), amenities: getRandomAmenities(9, 11, ["Workspace", "City View", "Lounge Access", "Coffee Machine"])
  },
  {
    name: 'Executive Studio', type: 'Executive', price: 48000, capacity: 2, size: 600,
    bed_type: 'King Bed', floor: 12, rating: 4.7, review_count: 165, featured: false,
    description: 'A spacious studio layout with a dedicated dining area and panoramic views.',
    long_description: 'Our Executive Studio maximizes space and comfort. It includes a plush King Bed, a sophisticated dining area for two, and a well-equipped kitchenette. Perfect for extended stays or guests who appreciate the convenience of in-room dining with a view, supported by top-tier hotel services.',
    images: getImages(imageSets.suite), amenities: getRandomAmenities(8, 11, ["Kitchenette", "Dining Area", "Mountain View"])
  },

  // FAMILY SUITE (3)
  {
    name: 'Grand Family Suite', type: 'Suite', price: 56000, capacity: 5, size: 850,
    bed_type: 'King & Two Twins', floor: 5, rating: 4.9, review_count: 520, featured: true,
    description: 'Expansive two-bedroom suite designed for perfect family vacations with separate kids room.',
    long_description: 'The Grand Family Suite provides the perfect balance of togetherness and privacy. It features a luxurious master bedroom with a King Bed and a connecting second bedroom with two Twin Beds. The shared living room is spacious enough for family game nights, and the suite includes two full bathrooms and a kitchenette.',
    images: getImages(imageSets.family), amenities: getRandomAmenities(10, 13, ["Kitchenette", "Dining Area", "Smart TV", "Bathtub", "Complimentary Breakfast"])
  },
  {
    name: 'Family Ocean Suite', type: 'Suite', price: 64000, capacity: 4, size: 800,
    bed_type: 'Two Queen Beds', floor: 6, rating: 4.8, review_count: 215, featured: false,
    description: 'Enjoy quality family time with stunning ocean views and a large private balcony.',
    long_description: 'Create unforgettable family memories in the Family Ocean Suite. This spacious accommodation features two comfortable Queen Beds, a large open-plan living area, and an expansive private balcony overlooking the ocean. The suite is equipped with a dining area and entertainment options for guests of all ages.',
    images: getImages(imageSets.family), amenities: getRandomAmenities(9, 12, ["Ocean View", "Balcony", "Dining Area", "Smart TV"])
  },
  {
    name: 'Royal Family Suite', type: 'Suite', price: 70000, capacity: 6, size: 1100,
    bed_type: 'King & Two Queens', floor: 8, rating: 5.0, review_count: 112, featured: false,
    description: 'Our largest family accommodation offering three beds, two bathrooms, and ultimate comfort.',
    long_description: 'The Royal Family Suite is the epitome of family luxury. Spanning an impressive 1100 sq.ft, it offers a master suite with a King Bed and a sprawling second bedroom with two Queen Beds. Highlights include a massive living and dining area, a fully equipped kitchenette, and panoramic views from every room.',
    images: getImages(imageSets.family), amenities: getRandomAmenities(11, 14, ["Kitchenette", "Dining Area", "Walk-in Closet", "Lounge Access", "Bathtub"])
  },

  // JUNIOR SUITE (2)
  {
    name: 'Junior Garden Suite', type: 'Suite', price: 54000, capacity: 3, size: 700,
    bed_type: 'King Bed', floor: 1, rating: 4.8, review_count: 180, featured: false,
    description: 'An elegant suite with a separate lounge area and direct access to tropical gardens.',
    long_description: 'The Junior Garden Suite blends elegant indoor living with the beauty of nature. The suite features a distinct living room separated from the serene bedroom. Step through the sliding glass doors onto your private terrace, which provides direct, exclusive access to the hotel’s lush tropical gardens.',
    images: getImages(imageSets.suite), amenities: getRandomAmenities(8, 10, ["Balcony", "Coffee Machine", "Bathtub", "Smart TV"])
  },
  {
    name: 'Junior Skyline Suite', type: 'Suite', price: 58000, capacity: 3, size: 720,
    bed_type: 'King Bed', floor: 14, rating: 4.9, review_count: 315, featured: true,
    description: 'High-floor suite offering dramatic skyline views, chic decor, and luxurious amenities.',
    long_description: 'Perched on our highest standard floors, the Junior Skyline Suite offers dramatic, sweeping views of the city. The chic, contemporary decor creates a stylish ambiance. The suite includes a comfortable lounge area, a sumptuous King Bed, and an opulent marble bathroom with a deep soaking tub positioned by the window.',
    images: getImages(imageSets.suite), amenities: getRandomAmenities(9, 11, ["City View", "Bathtub", "Lounge Access", "Mini Bar"])
  },

  // PRESIDENTIAL & ROYAL SUITES (1 each)
  {
    name: 'The Presidential Suite', type: 'Suite', price: 96000, capacity: 4, size: 1800,
    bed_type: 'King Bed', floor: 15, rating: 5.0, review_count: 85, featured: true,
    description: 'The pinnacle of luxury. A vast, opulent suite featuring a private dining room, office, and unmatched service.',
    long_description: 'The Presidential Suite is designed for those who demand the very best. This palatial 1800 sq.ft suite features a grand foyer, a lavish living room, a formal dining room for eight, and a private executive office. The master bedroom is a sanctuary of comfort, complemented by an extravagant bathroom with a jacuzzi and sauna. Enjoy dedicated 24-hour butler service.',
    images: getImages(imageSets.royal), amenities: getRandomAmenities(14, 16, ["Jacuzzi", "Butler Service", "Dining Area", "Walk-in Closet", "Lounge Access", "City View"])
  },
  {
    name: 'The Royal Suite', type: 'Suite', price: 98000, capacity: 4, size: 2100,
    bed_type: 'King Bed', floor: 16, rating: 5.0, review_count: 42, featured: false,
    description: 'Fit for royalty. Exquisite classical design, private terraces, and panoramic 360-degree views.',
    long_description: 'Step into a world of regal elegance in The Royal Suite. Adorned with classical art, crystal chandeliers, and bespoke furnishings, this suite is breathtaking. It features massive wrap-around private terraces offering 360-degree views. The suite includes a grand piano, a private library, a dining room, and an impossibly luxurious master bedroom.',
    images: getImages(imageSets.royal), amenities: getRandomAmenities(14, 16, ["Balcony", "Ocean View", "City View", "Butler Service", "Jacuzzi", "Walk-in Closet"])
  },

  // HONEYMOON SUITE (1)
  {
    name: 'Romantic Honeymoon Suite', type: 'Suite', price: 72000, capacity: 2, size: 850,
    bed_type: 'King Bed', floor: 12, rating: 4.9, review_count: 425, featured: false,
    description: 'Designed for romance. Features a heart-shaped jacuzzi, romantic ambient lighting, and ocean views.',
    long_description: 'Celebrate your love in the Romantic Honeymoon Suite, meticulously designed for couples. Enjoy stunning ocean sunsets from your private balcony. The suite boasts a plush four-poster King Bed, romantic ambient lighting controls, and a spectacular bathroom featuring a large two-person jacuzzi overlooking the horizon. Complimentary champagne awaits upon arrival.',
    images: getImages(imageSets.suite), amenities: getRandomAmenities(10, 12, ["Ocean View", "Jacuzzi", "Balcony", "Complimentary Breakfast", "Luxury Bathroom"])
  },

  // PRIVATE VILLA (1)
  {
    name: 'Exclusive Beachfront Villa', type: 'Villa', price: 92000, capacity: 6, size: 2800,
    bed_type: 'Two Kings, One Queen', floor: 1, rating: 5.0, review_count: 63, featured: true,
    description: 'An ultra-luxury standalone villa with a private infinity pool and direct beach access.',
    long_description: 'Experience the ultimate secluded luxury in our Exclusive Beachfront Villa. This expansive standalone property features three stunning bedrooms, a massive open-plan indoor/outdoor living space, and a fully equipped chef’s kitchen. Step outside to your private infinity pool, sprawling sun deck, and private pathway directly to the pristine beach. Includes a dedicated 24/7 villa host.',
    images: getImages(imageSets.villa), amenities: getRandomAmenities(15, 18, ["Private Pool", "Ocean View", "Butler Service", "Kitchenette", "Dining Area", "Walk-in Closet", "Jacuzzi"])
  },

  // PENTHOUSE SUITE (1)
  {
    name: 'The Crown Penthouse', type: 'Penthouse', price: 100000, capacity: 4, size: 3200,
    bed_type: 'Two King Beds', floor: 18, rating: 5.0, review_count: 28, featured: false,
    description: 'The absolute height of luxury spanning the entire top floor with a private rooftop terrace and pool.',
    long_description: 'The Crown Penthouse occupies the entire top floor of the hotel, offering unparalleled privacy, space, and luxury. Floor-to-ceiling glass walls provide breathtaking, uninterrupted views of the city and ocean. The suite features two magnificent master bedrooms, a private cinema room, a state-of-the-art kitchen, and a private rooftop terrace complete with a plunge pool and entertainment deck.',
    images: getImages(imageSets.royal), amenities: getRandomAmenities(16, 20, ["Private Pool", "City View", "Ocean View", "Butler Service", "Dining Area", "Walk-in Closet", "Lounge Access"])
  }
];

async function seed() {
  try {
    console.log('Connecting to database...');
    
    // Clear existing rooms
    console.log('Clearing existing rooms (and cascading bookings)...');
    await supabase.from('rooms').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    
    console.log('Inserting 24 new luxury rooms...');
    
    for (const room of rooms) {
      const { error } = await supabase.from('rooms').insert([{
        id: uuidv4(),
        name: room.name,
        type: room.type,
        price_per_night: room.price,
        capacity: room.capacity,
        status: 'available',
        description: room.description,
        long_description: room.long_description,
        size: room.size,
        bed_type: room.bed_type,
        floor: room.floor,
        rating: room.rating,
        review_count: room.review_count,
        featured: room.featured,
        amenities: room.amenities,
        images: room.images
      }]);
      
      if (error) {
        console.error(`Failed to insert ${room.name}:`, error.message);
      } else {
        console.log(`Inserted: ${room.name}`);
      }
    }

    console.log('Successfully seeded 24 rooms!');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
}

seed();
