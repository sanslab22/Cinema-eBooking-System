import React from "react";
import "./MovieReviews.css";

const MovieReviews = ({ reviews }) => {
  if (!reviews || reviews.length === 0) {
    return (
      <div className="reviews-container">
        <h3>Reviews</h3>
        <p>There are no reviews for this movie yet.</p>
      </div>
    );
  }

  return (
    <div className="reviews-container">
      <h3>Reviews</h3>
      <ul className="reviews-list">
        {reviews.map((review) => (
          <li key={review.id} className="review-item">
            <p className="review-text">{review.reviewText}</p>
            <p className="review-date">
              Posted on: {new Date(review.createdAt).toLocaleDateString()}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MovieReviews;
