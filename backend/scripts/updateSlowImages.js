require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const placeUpdates = {
  'Hidimba Devi Temple': 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a3/Hidimba_Devi_Temple%2C_Dhungri_Manali_3.jpg/1280px-Hidimba_Devi_Temple%2C_Dhungri_Manali_3.jpg',
  'Rohtang Pass': 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/35/Chandra_Tributary_Rohtang_Lahaul_Jul19_D72_10383.jpg/1280px-Chandra_Tributary_Rohtang_Lahaul_Jul19_D72_10383.jpg'
};

async function updateImages() {
  console.log('Starting place image performance update...');
  let successCount = 0;
  
  for (const [name, url] of Object.entries(placeUpdates)) {
    const { data, error } = await supabase
      .from('manali_places')
      .update({ image: url })
      .ilike('name', `%${name}%`)
      .select('id, name');
      
    if (error) {
      console.error(`Failed to update ${name}:`, error);
    } else {
      console.log(`Updated place: ${name} -> Success (${data?.length || 0} rows)`);
      if (data && data.length > 0) {
        successCount++;
      }
    }
  }

  console.log(`Finished update! Updated ${successCount} places.`);
}

updateImages();
