"use client"

import { useState } from "react"

interface ProductDescriptionSuggestionProps {
  productName: string
  category: string
}

export function useProductDescriptionSuggestion() {
  const [suggestedDescription, setSuggestedDescription] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Nigerian food descriptions database
  const nigerianFoodDescriptions: Record<string, string> = {
    // Rice dishes
    "jollof rice":
      "Delicious Nigerian jollof rice made with rich tomato sauce, aromatic spices, and perfectly cooked long-grain rice. Served with your choice of protein for a complete, satisfying meal.",
    "fried rice":
      "Flavorful Nigerian fried rice prepared with mixed vegetables, seasoned to perfection and stir-fried with your choice of protein. A colorful and tasty delight.",
    "coconut rice":
      "Aromatic coconut rice cooked with fresh coconut milk, giving it a rich, creamy texture and subtle sweetness. Perfectly seasoned with Nigerian spices.",

    // Soups and stews
    "egusi soup":
      "Traditional Nigerian egusi soup made with ground melon seeds, leafy vegetables, and assorted meat or fish. Rich, thick, and perfect with swallow.",
    "ogbono soup":
      "Hearty ogbono soup prepared with ground ogbono seeds, creating a distinctive slippery texture. Loaded with protein and vegetables for a nutritious meal.",
    "efo riro":
      "Savory vegetable soup made with spinach or other leafy greens, palm oil, and assorted meat or fish. Seasoned with traditional Nigerian spices.",
    "okra soup":
      "Fresh okra soup with a pleasant viscosity, prepared with palm oil, assorted meat, fish, and traditional spices. A nutritious Nigerian favorite.",
    "banga soup":
      "Rich palm fruit soup with a distinctive flavor, prepared with traditional spices and herbs. Served with your choice of protein.",
    "afang soup":
      "Delicious afang soup made with a combination of afang leaves and waterleaf, cooked with palm oil and assorted meat or seafood.",

    // Swallows
    "pounded yam":
      "Smooth, stretchy pounded yam made from fresh yam tubers. The perfect accompaniment to any Nigerian soup.",
    eba: "Smooth garri (cassava flour) swallow with the perfect consistency. An excellent accompaniment to any Nigerian soup.",
    amala:
      "Soft, smooth amala made from yam flour with a distinctive dark color. Pairs perfectly with any traditional Nigerian soup.",
    fufu: "Soft, stretchy fufu made from fermented cassava. A classic Nigerian swallow that pairs well with any traditional soup.",

    // Snacks and small chops
    "meat pie":
      "Flaky pastry filled with seasoned minced meat, potatoes, and carrots. Baked to golden perfection for a satisfying snack.",
    "puff puff":
      "Sweet, fluffy Nigerian doughnuts made from a yeast dough and deep-fried to golden perfection. A popular street food and snack.",
    "chin chin": "Crunchy, sweet fried pastry snack made from flour, sugar, and butter. Perfect for snacking anytime.",
    akara:
      "Crispy bean cakes made from peeled black-eyed peas, blended with onions and peppers, then deep-fried to perfection.",
    "moi moi":
      "Steamed bean pudding made from peeled black-eyed peas, blended with onions, peppers, and spices. Soft, moist, and nutritious.",

    // Proteins and sides
    suya: "Spicy grilled meat skewers seasoned with a unique blend of ground peanuts and spices. A popular Nigerian street food.",
    asun: "Spicy peppered goat meat, grilled and then sautéed with hot peppers and onions. A flavorful delicacy.",
    "pepper soup":
      "Hot and spicy broth made with a unique blend of Nigerian spices and herbs, with your choice of meat or fish.",
    dodo: "Sweet, ripe plantains fried to golden perfection. A delicious side dish that complements many Nigerian meals.",
    "moin moin":
      "Steamed bean pudding made from peeled black-eyed peas, blended with onions, peppers, and spices. Soft, moist, and nutritious.",

    // Drinks
    zobo: "Refreshing hibiscus drink made from dried zobo leaves, sweetened and flavored with pineapple, ginger, and other fruits.",
    kunu: "Nutritious Nigerian millet drink, lightly sweetened and flavored with spices. Served chilled for a refreshing experience.",
    chapman:
      "Refreshing Nigerian cocktail made with a blend of soft drinks, fruit juice, and sliced fruits. A colorful and delicious non-alcoholic beverage.",
  }

  // Generic descriptions by category
  const categoryDescriptions: Record<string, string> = {
    "Food & Beverages":
      "Delicious and satisfying food prepared with quality ingredients and authentic recipes. Made fresh to order for the best taste experience.",
    Electronics:
      "High-quality electronic device designed for reliability and performance. Features modern technology and user-friendly operation.",
    Clothing:
      "Stylish and comfortable clothing made with quality materials for durability. Perfect for everyday wear or special occasions.",
    "Health & Beauty":
      "Premium quality health and beauty product designed to enhance your natural features and promote wellbeing.",
    "Home & Garden":
      "Quality home and garden item designed to improve your living space with both functionality and style.",
    "Sports & Outdoors":
      "Durable sports and outdoor equipment designed for performance and comfort during your favorite activities.",
    "Books & Media": "Engaging and informative content that provides entertainment, knowledge, and inspiration.",
    Other: "Quality product designed to meet your specific needs with reliability and value.",
  }

  const generateDescription = async (productName: string, category: string) => {
    if (!productName) {
      setError("Product name is required")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Simulate API call with a delay
      await new Promise((resolve) => setTimeout(resolve, 800))

      const productNameLower = productName.toLowerCase()
      let description = ""

      // Check if it's a known Nigerian food item
      for (const [key, value] of Object.entries(nigerianFoodDescriptions)) {
        if (productNameLower.includes(key)) {
          description = value
          break
        }
      }

      // If no specific food match, use category-based description
      if (!description) {
        // For food items that aren't in our database
        if (category === "Food & Beverages") {
          description = `Delicious ${productName} prepared with fresh ingredients and authentic Nigerian recipes. A flavorful dish that satisfies your cravings with every bite.`
        } else {
          // For non-food items, use category description
          description = categoryDescriptions[category] || categoryDescriptions["Other"]
        }
      }

      setSuggestedDescription(description)
      return description
    } catch (error) {
      console.error("Error generating description:", error)
      setError("Failed to generate description")
      return null
    } finally {
      setIsLoading(false)
    }
  }

  return {
    suggestedDescription,
    isLoading,
    error,
    generateDescription,
    setSuggestedDescription,
  }
}
