require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const foodUpdates = {
  'Siddu': 'https://upload.wikimedia.org/wikipedia/commons/4/4e/Traditional_Kulluvi_Siddu.jpg',
  'Babru': 'https://upload.wikimedia.org/wikipedia/commons/e/ec/Kachori_with_Chutney.jpg',
  'Trout Fish': 'https://upload.wikimedia.org/wikipedia/commons/a/aa/Indian_style_pan_fried_Trout_Fish_masala_from_Himalayas.jpg',
  'Dham': 'https://upload.wikimedia.org/wikipedia/commons/2/29/DHAM_AT_MATA_SHRI_NAINA_DEVI_TEMPLE.jpg',
  'Tudkiya Bhath': 'https://upload.wikimedia.org/wikipedia/commons/7/7b/Daal_Khichdi.jpg',
  'Momos': 'https://upload.wikimedia.org/wikipedia/commons/8/87/TibetanFood.JPG',
  'Local Cafes': 'https://upload.wikimedia.org/wikipedia/commons/e/e4/Sam_Litvin%2C_Israeli_Restaurant_in_Manali.jpg',
};

async function updateImages() {
  console.log('Starting food image update...');
  let successCount = 0;
  
  for (const [name, url] of Object.entries(foodUpdates)) {
    const { data, error } = await supabase
      .from('manali_food_recommendations')
      .update({ image: url })
      .ilike('name', `%${name}%`)
      .select('id, name');
      
    if (error) {
      console.error(`Failed to update ${name}:`, error);
    } else {
      console.log(`Updated food: ${name} -> Success (${data?.length || 0} rows)`);
      if (data && data.length > 0) {
        successCount++;
      }
    }
  }

  console.log(`Finished update! Updated ${successCount} foods.`);
}

updateImages();
