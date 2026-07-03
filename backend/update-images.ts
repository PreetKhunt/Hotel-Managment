import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '.env') });

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const roomImages: Record<string, string[]> = {
  'Deluxe Ocean View': [
    'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=1200',
    'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=1200',
    'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=1200',
    'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=1200',
    'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1200'
  ],
  'Premium Suite': [
    'https://images.unsplash.com/photo-1574643156929-51fa098b0394?w=1200',
    'https://images.unsplash.com/photo-1631049552057-403cdb8f0658?w=1200',
    'https://images.unsplash.com/photo-1505693314120-0d443867891c?w=1200',
    'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=1200',
    'https://images.unsplash.com/photo-1590490359683-658d3d23f972?w=1200'
  ],
  'Standard Double': [
    'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=1200',
    'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=1200',
    'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=1200',
    'https://images.unsplash.com/photo-1560067174-c5a3a8f37060?w=1200',
    'https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=1200'
  ],
  'Presidential Villa': [
    'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1200',
    'https://images.unsplash.com/photo-1510798831971-661eb04b3739?w=1200',
    'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?w=1200',
    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200',
    'https://images.unsplash.com/photo-1572120360610-d971b9d7767c?w=1200'
  ],
  'Family Suite': [
    'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=1200',
    'https://images.unsplash.com/photo-1540518614846-7eded433c457?w=1200',
    'https://images.unsplash.com/photo-1598928506311-c55d43f9241f?w=1200',
    'https://images.unsplash.com/photo-1502005097973-6a7082348e28?w=1200',
    'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=1200'
  ]
};

async function updateImages() {
  const { data: rooms, error: fetchError } = await supabase.from('rooms').select('id, name');
  if (fetchError) {
    console.error('Error fetching rooms:', fetchError);
    return;
  }

  for (const room of rooms) {
    const images = roomImages[room.name];
    if (images) {
      console.log(`Updating ${room.name} with ${images.length} images...`);
      const { error: updateError } = await supabase
        .from('rooms')
        .update({ images })
        .eq('id', room.id);
      
      if (updateError) {
        console.error(`Error updating ${room.name}:`, updateError);
      } else {
        console.log(`Successfully updated ${room.name}.`);
      }
    }
  }
}

updateImages().catch(console.error);
