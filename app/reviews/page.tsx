"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Star, MessageSquare, ThumbsUp } from "lucide-react";

export default function ReviewsPage() {
  const [activeTab, setActiveTab] = useState("all");

  // Mock reviews data
  const reviews = [
    {
      id: "1",
      customer: "John Doe",
      rating: 5,
      comment:
        "Amazing food! The jollof rice was perfectly cooked and very tasty. Will definitely order again.",
      product: "Jollof Rice",
      date: "2024-01-15",
      helpful: 12,
    },
    {
      id: "2",
      customer: "Jane Smith",
      rating: 4,
      comment:
        "Good food but delivery was a bit slow. Overall satisfied with the quality.",
      product: "Fried Rice",
      date: "2024-01-14",
      helpful: 8,
    },
    {
      id: "3",
      customer: "Mike Johnson",
      rating: 2,
      comment:
        "Food was cold when it arrived. Not what I expected for the price.",
      product: "Amala & Ewedu",
      date: "2024-01-13",
      helpful: 3,
    },
    {
      id: "4",
      customer: "Sarah Wilson",
      rating: 5,
      comment:
        "Excellent service and delicious food. The portion size was generous too!",
      product: "Pounded Yam",
      date: "2024-01-12",
      helpful: 15,
    },
  ];

  const filteredReviews = reviews.filter((review) => {
    if (activeTab === "all") return true;
    if (activeTab === "positive") return review.rating >= 4;
    if (activeTab === "negative") return review.rating <= 2;
    return true;
  });

  const averageRating =
    reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`w-4 h-4 ${
          index < rating ? "text-yellow-400 fill-current" : "text-gray-300"
        }`}
      />
    ));
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-3">
            <Link href="/dashboard">
              <button className="p-2 hover:bg-gray-100 rounded-lg">
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
            </Link>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Reviews</h1>
              <p className="text-sm text-gray-500">Customer feedback</p>
            </div>
          </div>
        </div>
      </header>

      <main className="p-4 space-y-6">
        {/* Rating Summary */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <span className="text-3xl font-bold text-gray-900">
                {averageRating.toFixed(1)}
              </span>
              <div className="flex items-center">
                {renderStars(Math.round(averageRating))}
              </div>
            </div>
            <p className="text-gray-600">Based on {reviews.length} reviews</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab("all")}
              className={`flex-1 py-3 px-4 text-sm font-medium ${
                activeTab === "all"
                  ? "text-orange-600 border-b-2 border-orange-600"
                  : "text-gray-500"
              }`}
            >
              All Reviews
            </button>
            <button
              onClick={() => setActiveTab("positive")}
              className={`flex-1 py-3 px-4 text-sm font-medium ${
                activeTab === "positive"
                  ? "text-orange-600 border-b-2 border-orange-600"
                  : "text-gray-500"
              }`}
            >
              Positive
            </button>
            <button
              onClick={() => setActiveTab("negative")}
              className={`flex-1 py-3 px-4 text-sm font-medium ${
                activeTab === "negative"
                  ? "text-orange-600 border-b-2 border-orange-600"
                  : "text-gray-500"
              }`}
            >
              Negative
            </button>
          </div>

          {/* Reviews List */}
          <div className="p-4 space-y-4">
            {filteredReviews.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No reviews found</p>
              </div>
            ) : (
              filteredReviews.map((review) => (
                <div key={review.id} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-semibold text-gray-900">
                          {review.customer}
                        </h3>
                        <div className="flex items-center">
                          {renderStars(review.rating)}
                        </div>
                      </div>
                      <p className="text-gray-600 text-sm">{review.product}</p>
                      <p className="text-gray-500 text-xs">{review.date}</p>
                    </div>
                  </div>

                  <p className="text-gray-700 mb-3">{review.comment}</p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <ThumbsUp className="w-4 h-4" />
                      <span>{review.helpful} found this helpful</span>
                    </div>
                    <button className="text-orange-600 text-sm font-medium">
                      Reply
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
