// utils/validators.js

function isNonEmptyString(v) {
  return typeof v === "string" && v.trim().length > 0;
}

export function validateCreateMovie(body) {
  const errors = [];

  if (!isNonEmptyString(body.movieTitle)) errors.push("movieTitle is required.");
  if (!isNonEmptyString(body.category))   errors.push("category is required.");
  if (!isNonEmptyString(body.cast))       errors.push("cast is required.");
  if (!isNonEmptyString(body.director))   errors.push("director is required.");
  if (!isNonEmptyString(body.producer))   errors.push("producer is required.");
  if (!isNonEmptyString(body.filmRating)) errors.push("filmRating is required.");

  // Optional fields: synopsis, trailerURL, imagePoster, isActive
  if (errors.length) return { ok: false, errors };

  const data = {
    movieTitle: String(body.movieTitle).trim(),
    category:   String(body.category).trim(),
    cast:       String(body.cast).trim(),
    director:   String(body.director).trim(),
    producer:   String(body.producer).trim(),
    filmRating: String(body.filmRating).trim(),
  };

  if (body.synopsis != null)   data.synopsis   = String(body.synopsis);
  if (body.trailerURL != null) data.trailerURL = String(body.trailerURL);
  if (body.imagePoster != null) data.imagePoster = String(body.imagePoster);
  if (body.isActive != null)   data.isActive   = !!body.isActive;

  return { ok: true, data };
}

export function validateUpdateMovie(body) {
  const errors = [];
  const data = {};

  // Only accept known fields. All optional.
  const fields = ["movieTitle","category","cast","director","producer","synopsis","trailerURL","filmRating","imagePoster","isActive"];
  for (const k of Object.keys(body)) {
    if (!fields.includes(k)) {
      errors.push(`Unknown field: ${k}`);
    }
  }

  if ("movieTitle" in body)   data.movieTitle  = isNonEmptyString(body.movieTitle) ? String(body.movieTitle).trim() : "";
  if ("category" in body)     data.category    = isNonEmptyString(body.category) ? String(body.category).trim() : "";
  if ("cast" in body)         data.cast        = isNonEmptyString(body.cast) ? String(body.cast).trim() : "";
  if ("director" in body)     data.director    = isNonEmptyString(body.director) ? String(body.director).trim() : "";
  if ("producer" in body)     data.producer    = isNonEmptyString(body.producer) ? String(body.producer).trim() : "";
  if ("synopsis" in body)     data.synopsis    = body.synopsis == null ? null : String(body.synopsis);
  if ("trailerURL" in body)   data.trailerURL  = body.trailerURL == null ? null : String(body.trailerURL);
  if ("filmRating" in body)   data.filmRating  = isNonEmptyString(body.filmRating) ? String(body.filmRating).trim() : "";
  if ("imagePoster" in body)  data.imagePoster = body.imagePoster == null ? null : String(body.imagePoster);
  if ("isActive" in body)     data.isActive    = !!body.isActive;

  // Basic checks for non-empty strings if provided
  for (const k of ["movieTitle","category","cast","director","producer","filmRating"]) {
    if (k in body && !isNonEmptyString(body[k])) {
      errors.push(`${k} cannot be empty.`);
    }
  }

  if (errors.length) return { ok: false, errors };
  return { ok: true, data };
}

export function validateStatusToggle(body) {
  const errors = [];
  if (typeof body.isActive !== "boolean") {
    errors.push("isActive (boolean) is required.");
    return { ok: false, errors };
  }
  return { ok: true, data: { isActive: !!body.isActive } };
}
