// seed.js
import { PrismaClient } from "@prisma/client";
import * as sampleData from './sampleData.js';


const prisma = new PrismaClient();


async function main() {
    console.log('Starting database seeding...');

    // ----------------------------------------------------
    // 1. Seed Lookup Tables (Manual IDs: UserType, UserStatus, AddressType)
    // ----------------------------------------------------

    await Promise.all(
        sampleData.userTypes.map(t => prisma.userType.upsert({
            where: { id: t.id },
            update: {}, 
            create: t,
        }))
    );
    await Promise.all(
        sampleData.userStatuses.map(s => prisma.userStatus.upsert({
            where: { id: s.id },
            update: {}, 
            create: s,
        }))
    );
    await Promise.all(
        sampleData.addressTypes.map(t => prisma.addressType.upsert({
            where: { id: t.id },
            update: {}, 
            create: t,
        }))
    );
    console.log('Seeded Lookup Tables (Types & Statuses).');

    await Promise.all(
        sampleData.ticketCategory.map(t => prisma.ticketCategory.upsert({
            where: { id: t.id },
            update: {}, 
            create: t,
        }))
    );
    console.log('Seeded TicketCategory.');



    // ----------------------------------------------------
    // 2. Seed Independent Entities (Theater, Movie)
    // ----------------------------------------------------

    // Theaters
    const theaterRecords = await Promise.all(
        sampleData.theaters.map(t => {
            const { id, ...data } = t; // Ensure auto-incrementing 'id' is ignored
            return prisma.theater.create({ data });
        })
    );
    const theaterIdByName = Object.fromEntries(theaterRecords.map(t => [t.theaterName, t.id]));
    console.log('Seeded Theaters.');
    
    // Movies
    const movieRecords = await Promise.all(
        sampleData.movies.map(m => {
            const { id, ...data } = m; // Ensure auto-incrementing 'id' is ignored
            return prisma.movie.create({
                data: {
                    movieTitle: data.movieTitle,
                    duration: data.duration,
                    category: data.category,
                    cast: data.cast,
                    director: data.director,
                    producer: data.producer,
                    synopsis: data.synopsis,
                    trailerURL: data.trailerURL,
                    filmRating: data.filmRating,
                    imagePoster: data.imagePoster,
                    isActive: data.isActive,
                }
            })
        })
    );
    const movieIdByTitle = Object.fromEntries(movieRecords.map(m => [m.movieTitle, m.id]));
    console.log('Seeded Movies.');

    // ----------------------------------------------------
    // 3. Seed Users (Requires UserType, UserStatus)
    // ----------------------------------------------------
    
    const userRecords = await Promise.all(
        sampleData.users.map(u => {
            // FIX: Destructure 'id', 'userTypeId', and 'userStatusId' to pass the rest as 'userData'
            const { id, userTypeId, userStatusId, ...userData } = u; 

            return prisma.user.create({
                data: {
                    ...userData, // Only spread fields like firstName, email, passwordHash, etc.
                    userType: { connect: { id: u.userTypeId } },
                    userStatus: { connect: { id: u.userStatusId } },
                }
            });
        })
    );
    const userIdByEmail = Object.fromEntries(userRecords.map(u => [u.email, u.id]));
    console.log('Seeded Users.');

    // ----------------------------------------------------
    // 4. Seed Theater Structure (Auditorium, Seat)
    // ----------------------------------------------------

    // Auditoriums (Requires Theater IDs)
    const auditoriumRecords = await Promise.all(
        sampleData.auditoriums.map(a => {
            const { id, theaterId, ...data } = a;
            return prisma.auditorium.create({
                data: {
                    ...data,
                    theater: { connect: { id: theaterId } }
                }
            });
        })
    );
    const auditoriumIdByName = Object.fromEntries(auditoriumRecords.map(a => [a.AuditoriumName, a.id]));
    console.log('Seeded Auditoriums.');

    // Seats (Requires Auditorium IDs) - Create one seat record at a time to manage complex keys
    const seatRecords = [];
    for (const data of sampleData.seats) {
        const { id, auditoriumID, ...rest } = data;
        const seat = await prisma.seat.create({
            data: {
                ...rest,
                auditorium: { connect: { id: auditoriumID } }
            }
        });
        seatRecords.push(seat);
    }
    const seatIdByDetails = Object.fromEntries(seatRecords.map(s => [`${s.auditoriumID}-${s.rowNum}-${s.colNum}`, s.id]));
    console.log('Seeded Seats.');
    
    // ----------------------------------------------------
    // 5. Seed User Details (Address, PaymentCard)
    // ----------------------------------------------------

    // Addresses (Requires User and AddressType IDs)
    await Promise.all(
        sampleData.addresses.map(a => {
            const { id, addressTypeId, userID, ...data } = a;
            return prisma.address.create({
                data: {
                    ...data,
                    addressType: { connect: { id: addressTypeId } },
                    user: { connect: { id: userID } }
                }
            });
        })
    );
    console.log('Seeded Addresses.');

    // Payment Cards (Requires User ID)
    await Promise.all(
        sampleData.paymentCards.map((c) => {
            const { id, userID, billingAddressID, ...data } = c;
            return prisma.paymentCard.create({
            data: {
                ...data,
                user: { connect: { id: userID } },
                billingAddress: { connect: { id: billingAddressID } }, // connect to billing address by correct field
            },
            });
        })
    );

    console.log('Seeded Payment Cards.');
    
    // ----------------------------------------------------
    // 6. Seed Movie Shows & Reviews
    // ----------------------------------------------------

    // Reviews (Requires Movie Title)
    await Promise.all(
        sampleData.reviews.map(r => {
            const { id, movieTitle, ...data } = r;
            return prisma.review.create({
                data: {
                    ...data,
                    movie: { connect: { movieTitle: movieTitle } }
                }
            });
        })
    );
    console.log('Seeded Reviews.');

    // MovieShow (Requires Movie ID, Auditorium ID)
    const movieShowRecords = await Promise.all(
        sampleData.movieShows.map(ms => {
            const { id, movieID, auditoriumID, ...data } = ms;
            return prisma.movieShow.create({
                data: {
                    ...data,
                    showStartTime: new Date(data.showStartTime),
                    movie: { connect: { id: movieID } },
                    auditorium: { connect: { id: auditoriumID } }
                }
            });
        })
    );
    // Map to find the MovieShow ID later
    const movieShowIdByShowID = Object.fromEntries(movieShowRecords.map(ms => [ms.showID, ms.id]));
    console.log('Seeded Movie Shows.');

    // ShowSeats (Requires Seat ID, MovieShow ID)
    await Promise.all(
        sampleData.showSeats.map(ss => {
            const { seatID, showID, ...data } = ss;
            return prisma.showSeats.create({
                data: {
                    ...data,
                    seat: { connect: { id: seatID } },
                    movieShow: { connect: { id: showID } }
                }
            });
        })
    );
    console.log('Seeded Show Seats.');


    console.log('\nSeeding Complete.');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
