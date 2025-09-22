// seed.js

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const sampleData = require('./sampleData');

async function main() {
  // 1. Insert rooms
  const roomRecords = await Promise.all(
    sampleData.rooms.map(r => prisma.theaterRooms.create({
      data: {
        seatCapacity: r.seatCapacity,
        isAvailable: r.isAvailable,
      }
    }))
  );

  // we want to map roomIndex in showTimings to real room_id
  // so build an array or map
  // roomIndex is 1‐based in sampleData, and roomRecords are in same order
  const roomIdByIndex = {};
  roomRecords.forEach((room, idx) => {
    roomIdByIndex[idx + 1] = room.room_id;
  });

  // 2. Insert movies
  const movieRecords = await Promise.all(
    sampleData.movies.map(m => prisma.movies.create({
      data: {
        title: m.title,
        description: m.description,
        duration: m.duration,
        genre: m.genre,
        movie_rating: m.movie_rating,
        language: m.language,
        isActive: m.isActive,
        trailer: m.trailer,
        movieImage: m.movieImage,
      }
    }))
  );
  // map movieTitle → movie_id
  const movieIdByTitle = {};
  movieRecords.forEach(movie => {
    movieIdByTitle[movie.title] = movie.movie_id;
  });

  // 3. Insert show timings
  await Promise.all(
    sampleData.showTimings.map(st => {
      return prisma.showTimings.create({
        data: {
          showDate: new Date(st.showDate),
          startTime: st.startTime,
          endTime: st.endTime,
          room_id: roomIdByIndex[st.roomIndex],
          movie_id: movieIdByTitle[st.movieTitle],
        }
      });
    })
  );

  console.log('Seeding done.');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
