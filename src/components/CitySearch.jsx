import React from 'react';
import Autocomplete from 'react-google-autocomplete';

const CitySearch = ({ onLocationSelect }) => {
  return (
    <div className="w-full max-w-xl animate-slideUp">
      <h2 className="text-3xl font-bold mb-2 text-white">Birth City</h2>
      <p className="text-zinc-400 mb-6">Search for your birth place (we'll auto-calculate coordinates)</p>
      
      <div className="relative">
        <Autocomplete
          apiKey={import.meta.env.PUBLIC_GOOGLE_MAPS_KEY || "YOUR_KEY_HERE_IF_NO_ENV"}
          onPlaceSelected={(place) => {
            if (!place.geometry) return;
            
            // 1. Extract Lat/Long
            const lat = place.geometry.location.lat();
            const lng = place.geometry.location.lng();
            
            // 2. Extract City/Country
            let city = "";
            let country = "";
            
            place.address_components.forEach(component => {
              if (component.types.includes("locality")) city = component.long_name;
              if (component.types.includes("country")) country = component.long_name;
            });
            
            // Fallback if city is missing (e.g. it's just a region)
            if (!city && place.formatted_address) {
               city = place.formatted_address.split(',')[0];
            }

            // 3. Send back to parent
            onLocationSelect({ city, country, lat, lng });
          }}
          options={{
            types: ['(cities)'],
          }}
          className="w-full bg-zinc-900 border-b-2 border-zinc-700 p-4 text-xl text-white focus:border-cyan-400 outline-none transition-colors placeholder-zinc-600"
          placeholder="Start typing city..."
        />
        <div className="absolute right-4 top-4 text-zinc-500 pointer-events-none">
           🔍
        </div>
      </div>
    </div>
  );
};

export default CitySearch;
