const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const images = {
  'Deluxe Ocean View': [
    'https://images.unsplash.com/photo-1582719478250-c894e4dc240e?w=1200&q=80',
    'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&q=80',
    'https://images.unsplash.com/photo-1618773928120-2c1473659eb8?w=1200&q=80',
    'https://images.unsplash.com/photo-1590490359683-658d3d23f972?w=1200&q=80',
    'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=1200&q=80'
  ],
  'Premium Suite': [
    'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1200&q=80',
    'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=1200&q=80',
    'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=1200&q=80',
    'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=1200&q=80',
    'https://images.unsplash.com/photo-1505691938895-1758d7bef511?w=1200&q=80'
  ],
  'Standard Double': [
    'https://images.unsplash.com/photo-1560067174-e553b3647603?w=1200&q=80',
    'https://images.unsplash.com/photo-1505693314120-0d443867891c?w=1200&q=80',
    'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=1200&q=80',
    'https://images.unsplash.com/photo-1618773928120-2c1473659eb8?w=1200&q=80',
    'https://images.unsplash.com/photo-1598928636135-d146006ff4be?w=1200&q=80'
  ],
  'Presidential Villa': [
    'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?w=1200&q=80',
    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&q=80',
    'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=1200&q=80',
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80',
    'https://images.unsplash.com/photo-1600566753086-00f18efc2291?w=1200&q=80',
    'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=1200&q=80'
  ],
  'Family Suite': [
    'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200&q=80',
    'https://images.unsplash.com/photo-1505692952047-1a78307da8f2?w=1200&q=80',
    'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=1200&q=80',
    'https://images.unsplash.com/photo-1560185016-bp93f45209?w=1200&q=80',
    'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=1200&q=80'
  ]
};

async function updateImages() {
  const { data: rooms } = await supabase.from('rooms').select('*');
  for (const room of rooms) {
    if (images[room.name]) {
      await supabase.from('rooms').update({ images: images[room.name] }).eq('id', room.id);
      console.log(`Updated images for ${room.name}`);
    }
  }
}

updateImages().catch(console.error);