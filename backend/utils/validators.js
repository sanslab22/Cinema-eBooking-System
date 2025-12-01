// utils/validators.js

function isNonEmptyString(v) {
  return typeof v === "string" && v.trim().length > 0;
}

export function validateCreateMovie(body) {
  const errors = [];

  if (!isNonEmptyString(body.movieTitle)) errors.push("movieTitle is required.");
  if (!isNonEmptyString(body.category)) errors.push("category is required.");
  if (!isNonEmptyString(body.cast)) errors.push("cast is required.");
  if (!isNonEmptyString(body.director)) errors.push("director is required.");
  if (!isNonEmptyString(body.producer)) errors.push("producer is required.");
  if (!isNonEmptyString(body.filmRating)) errors.push("filmRating is required.");

  // Validate duration explicitly
  if (body.duration == null) {
    errors.push("duration is required.");
  } else {
    const dur = Number(body.duration);
    if (!Number.isInteger(dur) || dur <= 0) {
      errors.push("duration must be a positive integer.");
    }
  }

  if (errors.length) return { ok: false, errors };

  const data = {
    movieTitle: String(body.movieTitle).trim(),
    category: String(body.category).trim(),
    cast: String(body.cast).trim(),
    director: String(body.director).trim(),
    producer: String(body.producer).trim(),
    filmRating: String(body.filmRating).trim(),
    duration: Number(body.duration),  // Add parsed duration here
  };

  if (body.synopsis != null)   data.synopsis = String(body.synopsis);
  if (body.trailerURL != null) data.trailerURL = String(body.trailerURL);
  if (body.imagePoster != null) data.imagePoster = String(body.imagePoster);
  if (body.isActive != null) data.isActive = !!body.isActive;

  return { ok: true, data };
}


export function validateUpdateMovie(body) {
  const errors = [];
  const data = {};

  // Only accept known fields. All optional.
  const fields = ["movieTitle","category","cast","director","producer","synopsis","trailerURL","filmRating","imagePoster","isActive", "duration"];
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

  // FIX 2: Handle Duration Validation logic
  if ("duration" in body) {
    const dur = Number(body.duration);
    if (!Number.isInteger(dur) || dur <= 0) {
      errors.push("duration must be a positive integer.");
    } else {
      data.duration = dur;
    }
  }
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

// --- add to utils/validators.js ---

function isIsoDateString(s) {
  if (typeof s !== "string") return false;
  const d = new Date(s);
  return !Number.isNaN(d.getTime());
}

/** Create show: auditoriumID (number), showStartTime (ISO), optional noAvailabileSeats (number), optional showID (number) */
export function validateCreateShow(body) {
  const errors = [];
  const data = {};

  if (typeof body.auditoriumID !== "number" || body.auditoriumID <= 0) {
    errors.push("auditoriumID (number) is required.");
  } else {
    data.auditoriumID = body.auditoriumID;
  }

  if (!isIsoDateString(body.showStartTime)) {
    errors.push("showStartTime (ISO string) is required.");
  } else {
    data.showStartTime = body.showStartTime;
  }

  if (body.noAvailabileSeats != null) {
    if (typeof body.noAvailabileSeats !== "number" || body.noAvailabileSeats < 0) {
      errors.push("noAvailabileSeats must be a non-negative number.");
    } else {
      data.noAvailabileSeats = body.noAvailabileSeats;
    }
  }

  if (body.showID != null) {
    if (typeof body.showID !== "number" || body.showID <= 0) {
      errors.push("showID must be a positive number when provided.");
    } else {
      data.showID = body.showID;
    }
  }

  if (errors.length) return { ok: false, errors };
  return { ok: true, data };
}

/** List shows query: optional date=YYYY-MM-DD */
function isIsoDateTime(s){ return typeof s==="string" && !Number.isNaN(new Date(s).getTime()); }

export function validateListShowsQuery(query) {
  const errors = [];
  const filters = {};

  if (query.date != null) {
    const s = String(query.date);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) errors.push("date must be YYYY-MM-DD.");
    else filters.date = s;
  }

  if (query.from != null) {
    const s = String(query.from);
    if (!isIsoDateTime(s)) errors.push("from must be ISO datetime.");
    else filters.from = s;
  }

  if (query.to != null) {
    const s = String(query.to);
    if (!isIsoDateTime(s)) errors.push("to must be ISO datetime.");
    else filters.to = s;
  }

  if (filters.from && filters.to && new Date(filters.from) > new Date(filters.to)) {
    errors.push("from must be <= to.");
  }

  if (errors.length) return { ok:false, errors };
  return { ok:true, filters };
}


