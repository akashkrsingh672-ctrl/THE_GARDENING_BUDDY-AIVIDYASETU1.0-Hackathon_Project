/* ==========================================================================
   Crop + farm-profile data (shared by the home page, crop library and farm pages)
   Edit a crop's details here and its growing-guide panel updates everywhere.
   NOTE: the crop cards in crops.html and the crop lists on the farm pages repeat
   each crop's name, photo and growing period as static HTML - keep those in sync
   if you change them here.
   ========================================================================== */
(function (GB) {
  "use strict";

  GB.crops = [
    {
      "name": "Tomato",
      "scientificName": "Solanum lycopersicum",
      "image": "https://images.unsplash.com/photo-1529159942819-334f07de4fe5?auto=format&fit=crop&w=900&q=85",
      "intro": "A warm-season fruiting crop that thrives with full sun, rich soil, and steady care.",
      "uses": "Fresh salads, sauces, preserves, and everyday cooking.",
      "watering": "Deeply 2–3 times weekly; keep the soil evenly moist and leaves dry.",
      "feasibility": "Excellent for raised beds, fields, greenhouses, and large containers.",
      "difficulty": "Moderate · staking and regular feeding help",
      "sowing": "February–April",
      "harvest": "June–October",
      "period": "90–120 days",
      "yield": "3–5 kg per healthy plant",
      "spacingCm": 50,
      "yieldKgPerSqM": [6, 10],
      "waterMmPerWeek": [20, 30]
    },
    {
      "name": "Wheat",
      "scientificName": "Triticum aestivum",
      "image": "https://images.unsplash.com/photo-1590933582783-be57939a1e7e?auto=format&fit=crop&w=900&q=85",
      "intro": "A dependable cereal crop grown for its nutritious grain and useful straw.",
      "uses": "Flour, bread, animal feed, and straw for bedding or mulch.",
      "watering": "Moderate; most important at crown-root, flowering, and grain-fill stages.",
      "feasibility": "Best suited to open plots and fields with well-drained loamy soil.",
      "difficulty": "Easy–moderate · needs space and timely harvest",
      "sowing": "October–December",
      "harvest": "March–May",
      "period": "120–150 days",
      "yield": "3–6 tonnes per hectare",
      "spacingCm": 15,
      "yieldKgPerSqM": [0.3, 0.6],
      "waterMmPerWeek": [15, 25]
    },
    {
      "name": "Sweet Corn",
      "scientificName": "Zea mays",
      "image": "https://images.unsplash.com/photo-1649251037566-6881b4956615?auto=format&fit=crop&w=900&q=85",
      "intro": "A tall, sun-loving crop that grows best in blocks so wind can pollinate each ear.",
      "uses": "Fresh cobs, soups, flour, livestock feed, and silage.",
      "watering": "About 25–35 mm weekly, with extra attention during tasseling.",
      "feasibility": "Very good in sunny, sheltered plots with fertile soil and room to grow.",
      "difficulty": "Easy · direct sow in warm soil",
      "sowing": "April–June",
      "harvest": "July–September",
      "period": "70–100 days",
      "yield": "1–2 ears per plant",
      "spacingCm": 35,
      "yieldKgPerSqM": [1.5, 3],
      "waterMmPerWeek": [25, 35]
    },
    {
      "name": "Potato",
      "scientificName": "Solanum tuberosum",
      "image": "https://images.unsplash.com/photo-1619005586470-fc4a985709ea?auto=format&fit=crop&w=900&q=85",
      "intro": "A versatile underground tuber crop that rewards loose soil and regular earthing up.",
      "uses": "Boiling, roasting, frying, starch, and reliable winter storage.",
      "watering": "Consistent moisture once tubers form; avoid waterlogging.",
      "feasibility": "Excellent in beds, ridges, grow bags, and deep containers.",
      "difficulty": "Easy · protect young growth from late frost",
      "sowing": "February–April",
      "harvest": "June–September",
      "period": "90–140 days",
      "yield": "1.5–3 kg per seed potato",
      "spacingCm": 30,
      "yieldKgPerSqM": [3, 6],
      "waterMmPerWeek": [20, 30]
    },
    {
      "name": "Rice",
      "scientificName": "Oryza sativa",
      "image": "https://images.unsplash.com/photo-1728895604559-a4e16081504e?auto=format&fit=crop&w=900&q=85",
      "intro": "A staple grain crop that enjoys warm conditions and dependable water through growth.",
      "uses": "Table grain, flour, noodles, bran oil, and animal feed.",
      "watering": "High; maintain shallow flooding or consistently saturated soil.",
      "feasibility": "Best in warm lowlands or controlled paddies with a secure water supply.",
      "difficulty": "Advanced · water and field preparation are key",
      "sowing": "May–June",
      "harvest": "October–November",
      "period": "120–150 days",
      "yield": "4–7 tonnes per hectare",
      "spacingCm": 20,
      "yieldKgPerSqM": [0.4, 0.7],
      "waterMmPerWeek": [60, 100]
    },
    {
      "name": "Soybean",
      "scientificName": "Glycine max",
      "image": "https://images.unsplash.com/photo-1635562985686-4f8bb9c0d3bf?auto=format&fit=crop&w=900&q=85",
      "intro": "A protein-rich legume that can improve soil by fixing nitrogen around its roots.",
      "uses": "Tofu, soy milk, oil, flour, and high-protein animal feed.",
      "watering": "Moderate; critical during flowering and pod filling.",
      "feasibility": "Good for warm fields with neutral, free-draining soil.",
      "difficulty": "Moderate · inoculated seed improves results",
      "sowing": "May–June",
      "harvest": "September–October",
      "period": "100–140 days",
      "yield": "2–4 tonnes per hectare",
      "spacingCm": 10,
      "yieldKgPerSqM": [0.2, 0.4],
      "waterMmPerWeek": [20, 30]
    },
    {
      "name": "Carrot",
      "scientificName": "Daucus carota",
      "image": "https://images.unsplash.com/photo-1573119798379-011dfedae008?auto=format&fit=crop&w=900&q=85",
      "intro": "A cool-season root crop that forms the straightest roots in fine, stone-free soil.",
      "uses": "Fresh eating, roasting, soups, juices, and pickles.",
      "watering": "Light and frequent while germinating, then deep weekly watering.",
      "feasibility": "Excellent for deep beds and containers at least 30 cm tall.",
      "difficulty": "Easy–moderate · slow germination needs patience",
      "sowing": "February–July",
      "harvest": "May–November",
      "period": "70–100 days",
      "yield": "3–5 kg per square metre",
      "spacingCm": 8,
      "yieldKgPerSqM": [3, 5],
      "waterMmPerWeek": [20, 30]
    },
    {
      "name": "Sunflower",
      "scientificName": "Helianthus annuus",
      "image": "https://images.unsplash.com/photo-1599369553272-29f89a9d4696?auto=format&fit=crop&w=900&q=85",
      "intro": "A bold flowering crop that feeds pollinators before producing oil-rich edible seeds.",
      "uses": "Seeds, cooking oil, wildlife feed, cut flowers, and windbreaks.",
      "watering": "Deeply once weekly; increase during bud and flower development.",
      "feasibility": "Very good in sunny borders or fields with protection from strong wind.",
      "difficulty": "Easy · direct sow and protect seedlings",
      "sowing": "March–May",
      "harvest": "August–October",
      "period": "80–120 days",
      "yield": "0.5–1.5 kg seed per 10 plants",
      "spacingCm": 30,
      "yieldKgPerSqM": [0.2, 0.5],
      "waterMmPerWeek": [15, 25]
    },
    {
      "name": "Lettuce",
      "scientificName": "Lactuca sativa",
      "image": "https://images.unsplash.com/photo-1582757793483-e407049be006?auto=format&fit=crop&w=900&q=85",
      "intro": "A fast, cool-weather leafy crop ideal for repeat sowings and small growing spaces.",
      "uses": "Salads, wraps, sandwiches, and tender baby leaves.",
      "watering": "Frequent light watering; prevent dry spells and wet foliage overnight.",
      "feasibility": "Excellent in beds, window boxes, containers, and partial shade.",
      "difficulty": "Easy · one of the best beginner crops",
      "sowing": "February–September",
      "harvest": "April–November",
      "period": "35–70 days",
      "yield": "6–10 heads per square metre",
      "spacingCm": 25,
      "yieldKgPerSqM": [2, 4],
      "waterMmPerWeek": [20, 30]
    },
    {
      "name": "Strawberry",
      "scientificName": "Fragaria × ananassa",
      "image": "https://images.unsplash.com/photo-1787218645339-0678a89a4305?auto=format&fit=crop&w=900&q=85",
      "intro": "A compact perennial fruit crop that delivers fragrant berries for several seasons.",
      "uses": "Fresh fruit, desserts, jam, preserves, and freezing.",
      "watering": "Regularly at the base, especially from flowering through fruiting.",
      "feasibility": "Excellent for beds, pots, towers, hanging baskets, and polytunnels.",
      "difficulty": "Easy–moderate · mulch and bird protection help",
      "sowing": "Plant runners August–October",
      "harvest": "May–July",
      "period": "Fruit from 8–12 months",
      "yield": "0.5–1 kg per established plant",
      "spacingCm": 30,
      "yieldKgPerSqM": [1, 3],
      "waterMmPerWeek": [20, 30]
    }
  ];

  /* Options shown in the home page's "Let's start with your growing space" dialog. */
  GB.farmProfiles = [
    {
      "option": "Kitchen garden",
      "page": "kitchen-garden.html"
    },
    {
      "option": "Smallholding",
      "page": "smallholding.html"
    },
    {
      "option": "Working farm",
      "page": "working-farm.html"
    }
  ];
})((window.GB = window.GB || {}));
