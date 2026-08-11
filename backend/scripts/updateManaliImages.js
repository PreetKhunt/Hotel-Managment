const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

// Load env vars
dotenv.config({ path: path.join(__dirname, '../.env') });

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY, // Use service role for admin access
  { auth: { persistSession: false } }
);

const placeUpdates = {
  'Mall Road': 'https://upload.wikimedia.org/wikipedia/commons/f/f8/Mall_Road_-_Manali_01.jpg',
  'Hidimba Devi Temple': 'https://upload.wikimedia.org/wikipedia/commons/a/a3/Hidimba_Devi_Temple%2C_Dhungri_Manali_3.jpg',
  'Old Manali': 'https://upload.wikimedia.org/wikipedia/commons/e/eb/Old_Manali_2.jpg',
  'Manu Temple': 'https://upload.wikimedia.org/wikipedia/commons/c/cf/Vineet_Timble%2C_Manu_Temple%2C_Manali_%283%29.jpg',
  'Vashisht Temple': 'https://upload.wikimedia.org/wikipedia/commons/f/f9/Vashisht_Manali.jpg',
  'Jogini Waterfall': 'https://upload.wikimedia.org/wikipedia/commons/2/2d/Jogini_Falls_surroundings.jpg',
  'Solang Valley': 'https://upload.wikimedia.org/wikipedia/commons/2/2c/Solang_valley_under_snow%2C_2015.jpg',
  'Rohtang Pass': 'https://upload.wikimedia.org/wikipedia/commons/3/35/Chandra_Tributary_Rohtang_Lahaul_Jul19_D72_10383.jpg'
};

const activityUpdates = {
  'River Crossing': 'https://upload.wikimedia.org/wikipedia/commons/d/d8/A_woman_crossing_the_River_Beas_in_Manali_in_2009.jpg',
  'Trekking': 'https://upload.wikimedia.org/wikipedia/commons/9/94/Triund-trek-mcleodganj-himachal-pradesh-india.jpg',
  'Paragliding': 'https://upload.wikimedia.org/wikipedia/commons/b/b2/Solang_Valley_%2CParagliding_view%2C_Manali%2C_Himachal_Pardes%2Cindia.JPG',
  'River Rafting': 'https://upload.wikimedia.org/wikipedia/commons/f/fe/Tourists_Rafting_on_the_Beas_River.jpg',
  'Skiing': 'https://upload.wikimedia.org/wikipedia/commons/7/72/Skiing_manali.jpg',
  'Snow Activities': 'https://upload.wikimedia.org/wikipedia/commons/d/d0/Yaks_on_Manali%2C_Himachal_Pradesh.jpg'
};

async function run() {
  console.log('Starting image update...');
  let totalPlaces = 0;
  for (const [name, url] of Object.entries(placeUpdates)) {
    const { data, error } = await supabase
      .from('manali_places')
      .update({ image: url })
      .ilike('name', `%${name}%`)
      .select('id, name');
    
    if (error) {
      console.error(`Error updating place ${name}:`, error);
    } else {
      console.log(`Updated place: ${name} -> ${data.length > 0 ? 'Success' : 'No match found'}`);
      totalPlaces += data.length;
    }
  }
  
  let totalActivities = 0;
  for (const [name, url] of Object.entries(activityUpdates)) {
    const { data, error } = await supabase
      .from('manali_activities')
      .update({ image: url })
      .ilike('name', `%${name}%`)
      .select('id, name');
      
    if (error) {
      console.error(`Error updating activity ${name}:`, error);
    } else {
      console.log(`Updated activity: ${name} -> ${data.length > 0 ? 'Success' : 'No match found'}`);
      totalActivities += data.length;
    }
  }
  
  console.log(`Finished update! Updated ${totalPlaces} places and ${totalActivities} activities.`);
}

run();
