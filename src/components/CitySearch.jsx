import React from 'react';
import Autocomplete from 'react-google-autocomplete';

const CitySearch = ({ onLocationSelect }) => {
  return (
    <div className="w-full max-w-xl animate-slide-up space-y-8">
      <div className="text-center md:text-left">
        <h2 className="text-3xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-white to-zinc-400">Birth City</h2>
        <p className="text-zinc-400 text-lg font-light tracking-wide">Search for your birth place (we'll auto-calculate coordinates)</p>
      </div>

      <div className="relative group">
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
          className="w-full bg-zinc-900/40 border border-white/5 rounded-xl p-5 text-xl text-white focus:border-cyan-400/50 focus:bg-zinc-800/40 outline-none transition-all duration-500 placeholder-zinc-600 backdrop-blur-md focus:shadow-[0_0_20px_rgba(34,211,238,0.05)]"
          placeholder="Start typing city..."
        />
        <div className="absolute right-5 top-5 text-zinc-600 pointer-events-none group-focus-within:text-cyan-400/50 transition-colors duration-500">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
        </div>
      </div>
    </div>
  );
};

export default CitySearch;
