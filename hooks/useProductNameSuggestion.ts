"use client"

export interface ProductSuggestion {
  id: string
  name: string
  category: string
  estimatedPrice?: number
  description?: string
}

// Nigerian product database with correct backend categories
const PRODUCT_DATABASE: ProductSuggestion[] = [
  // Rice Dishes
  {
    id: "jollof-rice",
    name: "Jollof Rice",
    category: "Rice Dishes",
    estimatedPrice: 1500,
    description:
      "Delicious Nigerian one-pot rice dish cooked with tomatoes, peppers, onions, and aromatic spices. A party favorite that's perfectly seasoned and colorful.",
  },
  {
    id: "fried-rice",
    name: "Fried Rice",
    category: "Rice Dishes",
    estimatedPrice: 1400,
    description:
      "Colorful Nigerian-style fried rice with mixed vegetables, curry powder, and your choice of protein. A festive dish that's both nutritious and flavorful.",
  },
  {
    id: "coconut-rice",
    name: "Coconut Rice",
    category: "Rice Dishes",
    estimatedPrice: 1600,
    description:
      "Aromatic rice cooked in coconut milk with spices. A rich and creamy dish that pairs perfectly with Nigerian stews and grilled proteins.",
  },

  // Soup
  {
    id: "egusi-soup",
    name: "Egusi Soup",
    category: "Soup",
    estimatedPrice: 2000,
    description:
      "Traditional Nigerian soup made with ground melon seeds, leafy vegetables, and your choice of meat or fish. Rich, nutritious, and full of authentic flavors.",
  },
  {
    id: "pepper-soup",
    name: "Pepper Soup",
    category: "Soup",
    estimatedPrice: 1800,
    description:
      "Aromatic and spicy Nigerian soup made with fresh fish or meat, traditional herbs, and hot peppers. Perfect for cold weather or when you need comfort food.",
  },
  {
    id: "banga-soup",
    name: "Banga Soup",
    category: "Soup",
    estimatedPrice: 2200,
    description:
      "Rich Delta State soup made from palm nut extract, fresh fish, and traditional spices. A delicacy that's creamy, flavorful, and authentically Nigerian.",
  },
  {
    id: "okro-soup",
    name: "Okro Soup",
    category: "Soup",
    estimatedPrice: 1500,
    description:
      "Traditional Nigerian soup made with fresh okra, meat, fish, and local seasonings. Naturally thick and nutritious, perfect with any swallow.",
  },
  {
    id: "afang-soup",
    name: "Afang Soup",
    category: "Soup",
    estimatedPrice: 2500,
    description:
      "Exotic Calabar soup made with afang leaves, waterleaf, assorted meat, and seafood. A premium delicacy that's rich in nutrients and flavor.",
  },
  {
    id: "bitter-leaf-soup",
    name: "Bitter Leaf Soup",
    category: "Soup",
    estimatedPrice: 1800,
    description:
      "Traditional Igbo soup (Ofe Onugbu) made with bitter leaf vegetables, meat, fish, and authentic seasonings. Medicinal and delicious.",
  },
  {
    id: "efo-riro",
    name: "Efo Riro",
    category: "Soup",
    estimatedPrice: 1600,
    description:
      "Nutritious Yoruba spinach stew cooked with assorted meat, fish, and traditional seasonings. Packed with vegetables and bursting with authentic flavors.",
  },

  // Swallow
  {
    id: "pounded-yam",
    name: "Pounded Yam",
    category: "Swallow",
    estimatedPrice: 1200,
    description:
      "Smooth and stretchy Nigerian swallow made from freshly pounded yam. Perfect companion for soups and stews. Prepared fresh and served hot.",
  },
  {
    id: "amala",
    name: "Amala",
    category: "Swallow",
    estimatedPrice: 1000,
    description:
      "Traditional Yoruba swallow made from yam flour. Dark, smooth, and perfect for pairing with Nigerian soups. Freshly prepared and served warm.",
  },
  {
    id: "garri",
    name: "Garri (Eba)",
    category: "Swallow",
    estimatedPrice: 800,
    description:
      "Popular Nigerian swallow made from processed cassava flakes. Quick to prepare and perfect for dipping in soups and stews.",
  },
  {
    id: "fufu",
    name: "Fufu",
    category: "Swallow",
    estimatedPrice: 1000,
    description:
      "Smooth cassava-based swallow that's perfect for dipping in soups. Prepared fresh and served at the right consistency for easy swallowing.",
  },
  {
    id: "wheat",
    name: "Wheat",
    category: "Swallow",
    estimatedPrice: 900,
    description:
      "Nutritious swallow made from wheat flour. Light, smooth texture that pairs well with all Nigerian soups. A healthier alternative to other swallows.",
  },

  // Protein
  {
    id: "suya",
    name: "Suya",
    category: "Protein",
    estimatedPrice: 800,
    description:
      "Spicy grilled meat skewers seasoned with traditional Nigerian suya spice blend. A popular street food that's smoky, spicy, and absolutely delicious.",
  },
  {
    id: "asun",
    name: "Asun",
    category: "Protein",
    estimatedPrice: 2000,
    description:
      "Spicy grilled goat meat cut into small pieces and seasoned with peppers and spices. A Yoruba delicacy that's perfect for special occasions.",
  },
  {
    id: "grilled-fish",
    name: "Grilled Fish",
    category: "Protein",
    estimatedPrice: 1500,
    description:
      "Fresh fish grilled to perfection with Nigerian spices and peppers. Served hot with a side of spicy sauce and vegetables.",
  },
  {
    id: "fried-chicken",
    name: "Fried Chicken",
    category: "Protein",
    estimatedPrice: 1200,
    description:
      "Crispy fried chicken seasoned with Nigerian spices. Golden brown and juicy, perfect as a main dish or side protein.",
  },
  {
    id: "beef-stew",
    name: "Beef Stew",
    category: "Protein",
    estimatedPrice: 1800,
    description:
      "Tender beef cooked in rich tomato stew with onions, peppers, and traditional seasonings. A hearty protein dish that goes with rice or swallow.",
  },

  // Beans Combo
  {
    id: "rice-beans",
    name: "Rice and Beans",
    category: "Beans Combo",
    estimatedPrice: 1000,
    description:
      "Nutritious combination of rice and beans cooked together with spices. A healthy, protein-rich meal that's both satisfying and affordable.",
  },
  {
    id: "beans-plantain",
    name: "Beans and Plantain",
    category: "Beans Combo",
    estimatedPrice: 1200,
    description:
      "Classic Nigerian combination of cooked beans with fried plantain. A complete meal that's nutritious, filling, and delicious.",
  },
  {
    id: "moi-moi",
    name: "Moi Moi",
    category: "Beans Combo",
    estimatedPrice: 600,
    description:
      "Steamed bean pudding made from blended black-eyed peas, peppers, and spices. Soft, protein-rich, and perfect as a side dish or snack.",
  },
  {
    id: "akara",
    name: "Akara",
    category: "Beans Combo",
    estimatedPrice: 400,
    description:
      "Crispy fried bean cakes made from black-eyed peas batter. A popular Nigerian breakfast item that's crunchy outside and soft inside.",
  },

  // Fast Food
  {
    id: "meat-pie",
    name: "Meat Pie",
    category: "Fast Food",
    estimatedPrice: 500,
    description:
      "Flaky pastry filled with seasoned minced meat, potatoes, and carrots. A popular Nigerian snack that's perfect for any time of day.",
  },
  {
    id: "sausage-roll",
    name: "Sausage Roll",
    category: "Fast Food",
    estimatedPrice: 400,
    description:
      "Crispy pastry wrapped around seasoned sausage filling. A convenient and tasty snack that's perfect for on-the-go eating.",
  },
  {
    id: "chicken-pie",
    name: "Chicken Pie",
    category: "Fast Food",
    estimatedPrice: 600,
    description:
      "Golden pastry filled with tender chicken, vegetables, and aromatic spices. A hearty snack that's both filling and flavorful.",
  },
  {
    id: "fish-roll",
    name: "Fish Roll",
    category: "Fast Food",
    estimatedPrice: 450,
    description:
      "Soft bread roll filled with seasoned fish, vegetables, and sauce. A popular Nigerian fast food that's both nutritious and delicious.",
  },

  // Drinks
  {
    id: "zobo",
    name: "Zobo Drink",
    category: "Drinks",
    estimatedPrice: 400,
    description:
      "Refreshing hibiscus drink blended with natural fruits and spices. A healthy, vitamin-rich beverage that's perfect for any time of day.",
  },
  {
    id: "kunu",
    name: "Kunu Drink",
    category: "Drinks",
    estimatedPrice: 300,
    description:
      "Traditional Northern Nigerian drink made from millet, ginger, and spices. Creamy, nutritious, and naturally refreshing.",
  },
  {
    id: "chapman",
    name: "Chapman",
    category: "Drinks",
    estimatedPrice: 800,
    description:
      "Popular Nigerian cocktail made with fruit juices, grenadine, and soda. A colorful and refreshing drink perfect for celebrations.",
  },
  {
    id: "fresh-juice",
    name: "Fresh Fruit Juice",
    category: "Drinks",
    estimatedPrice: 500,
    description:
      "Freshly squeezed fruit juice from local fruits like orange, pineapple, or watermelon. Natural, healthy, and refreshing.",
  },

  // African Dishes
  {
    id: "yam-porridge",
    name: "Yam Porridge (Asaro)",
    category: "African Dishes",
    estimatedPrice: 1200,
    description:
      "Hearty one-pot meal made with yam, tomatoes, peppers, and spices. Comfort food that's filling, nutritious, and full of home-cooked flavor.",
  },
  {
    id: "plantain-porridge",
    name: "Plantain Porridge",
    category: "African Dishes",
    estimatedPrice: 1100,
    description:
      "Delicious one-pot meal made with ripe plantains, vegetables, and spices. A satisfying dish that's both sweet and savory.",
  },
  {
    id: "ofada-rice",
    name: "Ofada Rice",
    category: "African Dishes",
    estimatedPrice: 1800,
    description:
      "Local Nigerian brown rice served with spicy ofada stew. An authentic dish that showcases traditional Nigerian flavors.",
  },

  // Mashed Meals
  {
    id: "yam-egg-sauce",
    name: "Boiled Yam with Egg Sauce",
    category: "Mashed Meals",
    estimatedPrice: 800,
    description:
      "Soft boiled yam served with scrambled eggs in tomato and pepper sauce. A simple, nutritious meal that's perfect for breakfast or lunch.",
  },
  {
    id: "plantain-egg",
    name: "Fried Plantain with Egg",
    category: "Mashed Meals",
    estimatedPrice: 700,
    description:
      "Sweet fried plantain served with scrambled eggs. A popular Nigerian breakfast combination that's both satisfying and delicious.",
  },

  // Main Course
  {
    id: "chicken-stew",
    name: "Chicken Stew",
    category: "Main Course",
    estimatedPrice: 2000,
    description:
      "Rich tomato-based stew with tender chicken pieces, onions, and peppers. A classic Nigerian dish that pairs perfectly with rice or swallow.",
  },
  {
    id: "fish-stew",
    name: "Fish Stew",
    category: "Main Course",
    estimatedPrice: 1800,
    description:
      "Flavorful stew made with fresh fish, tomatoes, peppers, and traditional spices. A protein-rich main course that's both healthy and delicious.",
  },
]

export function getProductSuggestions(query: string): ProductSuggestion[] {
  if (!query || query.length < 2) return []

  const normalizedQuery = query.toLowerCase().trim()

  // Filter products that match the query
  const matches = PRODUCT_DATABASE.filter((product) => product.name.toLowerCase().includes(normalizedQuery))

  // Sort by relevance (exact matches first)
  return matches
    .sort((a, b) => {
      const aStartsWith = a.name.toLowerCase().startsWith(normalizedQuery)
      const bStartsWith = b.name.toLowerCase().startsWith(normalizedQuery)

      if (aStartsWith && !bStartsWith) return -1
      if (!aStartsWith && bStartsWith) return 1
      return a.name.localeCompare(b.name)
    })
    .slice(0, 8) // Limit to 8 suggestions
}
