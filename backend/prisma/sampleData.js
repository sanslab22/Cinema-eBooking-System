// sampleData.js

const mockDate = new Date().toISOString();

// --- 1. Reference Data (No dependencies, must be seeded first) ---

export const userTypes = [
  { id: 1, name: 'Admin' },
  { id: 2, name: 'Customer' },
];

export const userStatuses = [
  { id: 1, name: 'Active' },
  { id: 2, name: 'Inactive' },
  { id: 3, name: 'Suspended' },
];

export const addressTypes = [
  { id: 1, name: 'Home' },
  { id: 2, name: 'Billing' },
];

export const seatStatus = [
  {id: 1, name: 'Temp'},
  {id: 2, name: 'Available'},
  {id: 3, name: 'Booked'},
]

// --- 2. Core Entities (Independent) ---

export const theaters = [
  { id: 1, theaterName: 'Grand Cinema City' },
  { id: 2, theaterName: 'Silver Screen Palace' },
];

export const movies = [
  {
    id: 1,
    movieTitle: 'The Shawshank Redemption',
    duration: 142,
    category: 'Drama',
    cast: 'Tim Robbins, Morgan Freeman',
    director: 'Frank Darabont',
    producer: 'Niki Marvin',
    synopsis: 'Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.',
    trailerURL: 'https://www.youtube.com/watch?v=NmzuHjWmXOc',
    filmRating: 'R',
    imagePoster: 'shawshank.jpg',
    isActive: true

  },
  {
    id: 2,
    movieTitle: 'The Godfather',
    duration: 175,
    category: 'Crime, Drama',
    cast: 'Marlon Brando, Al Pacino',
    director: 'Francis Ford Coppola',
    producer: 'Albert S. Ruddy',
    synopsis: 'The aging patriarch of an organized crime dynasty transfers control of his clandestine empire to his reluctant son.',
    trailerURL: 'https://www.youtube.com/watch?v=sY1S34973zA',
    filmRating: 'R',
    imagePoster: 'godfather.jpg',
    isActive: true
  },
  {
    id: 3,
    movieTitle: 'Inception',
    duration: 148,
    category: 'Action, Sci-Fi',
    cast: 'Leonardo DiCaprio, Elliot Page',
    director: 'Christopher Nolan',
    producer: 'Christopher Nolan, Emma Thomas',
    synopsis: 'A skilled thief, Dom Cobb, enters people’s dreams to steal corporate secrets...',
    trailerURL: 'https://www.youtube.com/watch?v=YoHD9XEInc0',
    filmRating: 'PG-13',
    imagePoster: 'inception.jpg',
    isActive: false
  },
  {
    id: 4,
    movieTitle: 'Spirited Away',
    duration: 125,
    category: 'Animation, Fantasy',
    cast: 'Rumi Hiiragi, Miyu Irino',
    director: 'Hayao Miyazaki',
    producer: 'Toshio Suzuki',
    synopsis: 'A 10-year-old girl, Chihiro, becomes trapped in a magical world ruled by spirits, witches, and monsters...',
    trailerURL: 'https://www.youtube.com/watch?v=ByXuk9QqQkk',
    filmRating: 'PG',
    imagePoster: 'spiritedaway.jpg',
    isActive: false
  },
];

// --- 3. Relational Entities (Ties to UserTypes, UserStatuses, Theaters) ---

export const users = [
  {
    id: 1,
    firstName: 'Site',
    lastName: 'Admin',
    email: 'admin@cinema.com',
    passwordHash: '$2b$10$kB4h3OAdzFADEIpmiPPbqenzzF1P1i0q8oECopUJYg3R/YnmUUdoi', // Aaa1234
    phoneNumber: '555-123-4567',
    EnrollforPromotions: true,
    userTypeId: 1, // Admin
    userStatusId: 2, // inactive
  },
  {
    id: 2,
    firstName: 'Jane',
    lastName: 'Doe',
    email: 'jane.doe@example.com',
    passwordHash: '$2b$10$jvUdIkYgameUo46UsY73o.lB0R3eGq37HEnhRR4fSSUrv9cOlEG7W', // Aaa1234! 
    phoneNumber: '555-987-6543',
    EnrollforPromotions: true,
    userTypeId: 2, // Customer
    userStatusId: 2, // inactive
  },
  {
    id: 3,
    firstName: 'John',
    lastName: 'Smith',
    email: 'john.smith@example.com',
    passwordHash: '$2b$10$DMO071q6n0VzcPdsuWQLOee/r958476uGN.9m1nLwslmsbJPfToTG', // Qwerty123
    phoneNumber: null,
    EnrollforPromotions: false,
    userTypeId: 2, // Customer
    userStatusId: 2, // Inactive
  },
];

// --- 4. Relational Entities (Ties to Theaters, Movies, Users, AddressTypes) ---

export const auditoriums = [
  // Theater 1
  { id: 1, AuditoriumName: 'Screen A', noOfSeats: 100, theaterId: 1 },
  { id: 2, AuditoriumName: 'Screen B', noOfSeats: 80, theaterId: 1 },
  // Theater 2
  { id: 3, AuditoriumName: 'Screen C', noOfSeats: 120, theaterId: 2 },
];

export const seats = [
  // Auditorium 1 (10 seats)
  { id: 1, auditoriumID: 1, rowNum: 'A', colNum: 1 },
  { id: 2, auditoriumID: 1, rowNum: 'A', colNum: 2 },
  { id: 3, auditoriumID: 1, rowNum: 'A', colNum: 3 },
  { id: 4, auditoriumID: 1, rowNum: 'A', colNum: 4 },
  { id: 5, auditoriumID: 1, rowNum: 'A', colNum: 5 },
  { id: 6, auditoriumID: 1, rowNum: 'B', colNum: 1 },
  { id: 7, auditoriumID: 1, rowNum: 'B', colNum: 2 },
  { id: 8, auditoriumID: 1, rowNum: 'B', colNum: 3 },
  { id: 9, auditoriumID: 1, rowNum: 'B', colNum: 4 },
  { id: 10, auditoriumID: 1, rowNum: 'B', colNum: 5 },

  // Auditorium 2 (10 seats)
  { id: 1, auditoriumID: 2, rowNum: 'A', colNum: 1 },
  { id: 2, auditoriumID: 2, rowNum: 'A', colNum: 2 },
  { id: 3, auditoriumID: 2, rowNum: 'A', colNum: 3 },
  { id: 4, auditoriumID: 2, rowNum: 'A', colNum: 4 },
  { id: 5, auditoriumID: 2, rowNum: 'A', colNum: 5 },
  { id: 6, auditoriumID: 2, rowNum: 'B', colNum: 1 },
  { id: 7, auditoriumID: 2, rowNum: 'B', colNum: 2 },
  { id: 8, auditoriumID: 2, rowNum: 'B', colNum: 3 },
  { id: 9, auditoriumID: 2, rowNum: 'B', colNum: 4 },
  { id: 10, auditoriumID: 2, rowNum: 'B', colNum: 5 },

  // Auditorium 3 (10 seats)
  { id: 1, auditoriumID: 3, rowNum: 'A', colNum: 1 },
  { id: 2, auditoriumID: 3, rowNum: 'A', colNum: 2 },
  { id: 3, auditoriumID: 3, rowNum: 'A', colNum: 3 },
  { id: 4, auditoriumID: 3, rowNum: 'A', colNum: 4 },
  { id: 5, auditoriumID: 3, rowNum: 'A', colNum: 5 },
  { id: 6, auditoriumID: 3, rowNum: 'B', colNum: 1 },
  { id: 7, auditoriumID: 3, rowNum: 'B', colNum: 2 },
  { id: 8, auditoriumID: 3, rowNum: 'B', colNum: 3 },
  { id: 9, auditoriumID: 3, rowNum: 'B', colNum: 4 },
  { id: 10, auditoriumID: 3, rowNum: 'B', colNum: 5 },
];

export const reviews = [
  { 
    id: 1,
    reviewText: 'An absolute masterpiece of hope and friendship. A must-watch.',
    movieTitle: 'The Shawshank Redemption',
  },
  {
    id: 2,
    reviewText: 'The ending still leaves me wondering. A true Sci-Fi epic.',
    movieTitle: 'Inception',
  },
];

export const addresses = [
  {
    id: 1,
    street: '123 Main St',
    city: 'Atlanta',
    state: 'GA',
    zipCode: '30303',
    addressTypeId: 1, // Home
    userID: 2, // Jane Doe
  },
  {
    id: 2,
    street: '456 Billing Ave',
    city: 'Atlanta',
    state: 'GA',
    zipCode: '30303',
    addressTypeId: 2, // Billing
    userID: 2, // Jane Doe
  },
];

export const paymentCards = [
  {
    id: 1,
    cardNo: '$2b$10$WjwXBJ5St0NoBHb9cAYmBO2asD3i8Ac9Bi3ajA/pKm.AiyKDnKGZO', // Tokenized/Encrypted representation
    maskedCardNo: '1234',
    expirationDate: '12/26',
    userID: 2, // Jane Doe
    billingAddressID: 2,

  },
];

// --- 5. Show and Booking Data (Ties to Movies, Auditoriums, Seats) ---

export const movieShows = [
  {
    id: 1,
    showID: 101, // Unique ID for this specific show
    movieID: 1, // The Shawshank Redemption
    auditoriumID: 1, // Screen A
    showStartTime: '2025-11-23T18:00:00Z',
    noAvailabileSeats: 10,  // All available
  },
  {
    id: 2,
    showID: 201, // Another show ID, unique per show/movie/auditorium/time combination
    movieID: 2, // Godfather
    auditoriumID: 3, // Grand Hall
    showStartTime: '2025-11-23T21:00:00Z',
    noAvailabileSeats: 10, // All available
  },
];

export const showSeats = [
  // Auditorium 1 seats (IDs 1–10)
  { seatID: 1, auditoriumID: 1, showID: 1, seatStatusId: '2' },
  { seatID: 2, auditoriumID: 1, showID: 1, seatStatusId: '2' },
  { seatID: 3, auditoriumID: 1, showID: 1, seatStatusId: '2' },
  { seatID: 4, auditoriumID: 1, showID: 1, seatStatusId: '2' },
  { seatID: 5, auditoriumID: 1, showID: 1, seatStatusId: '2' },
  { seatID: 6, auditoriumID: 1, showID: 1, seatStatusId: '2' },
  { seatID: 7, auditoriumID: 1, showID: 1, seatStatusId: '2' },
  { seatID: 8, auditoriumID: 1, showID: 1, seatStatusId: '2' },
  { seatID: 9, auditoriumID: 1, showID: 1, seatStatusId: '2' },
  { seatID: 10, auditoriumID: 1, showID: 1, seatStatusId: '2' },

  // Auditorium 2 seats (IDs 11–20)
  { seatID: 11, auditoriumID: 2, showID: 2, seatStatusId: '2' },
  { seatID: 12, auditoriumID: 2, showID: 2, seatStatusId: '2' },
  { seatID: 13, auditoriumID: 2, showID: 2, seatStatusId: '2' },
  { seatID: 14, auditoriumID: 2, showID: 2, seatStatusId: '2' },
  { seatID: 15, auditoriumID: 2, showID: 2, seatStatusId: '2' },
  { seatID: 16, auditoriumID: 2, showID: 2, seatStatusId: '2' },
  { seatID: 17, auditoriumID: 2, showID: 2, seatStatusId: '2' },
  { seatID: 18, auditoriumID: 2, showID: 2, seatStatusId: '2' },
  { seatID: 19, auditoriumID: 2, showID: 2, seatStatusId: '2' },
  { seatID: 20, auditoriumID: 2, showID: 2, seatStatusId: '2' },
];
