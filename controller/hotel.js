import Hotels from "../models/Hotels.js";
import Rooms from "../models/Rooms.js";
import Room from "../models/Rooms.js";

export const createHotel = async (req, res, next) => {
  const newHotel = new Hotels(req.body);
  try {
    const savedHotel = await newHotel.save();
    res.status(200).json(savedHotel);
  } catch (err) {
    next(err);
  }
};

export const updateHotel = async (req, res, next) => {
  try {
    const updatedHotel = await Hotels.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    if (!updatedHotel) {
      return res.status(404).json({ message: "Hotel not found" });
    }
    res.status(200).json(updatedHotel);
  } catch (err) {
    next(err);
  }
};

export const deleteHotel = async (req, res, next) => {
  try {
    const deleteHotel = await Hotels.findByIdAndDelete(req.params.id);
    if (!deleteHotel) {
      return res.status(404).json({ message: "Hotel not found" });
    }
    res.status(200).json("Hotel has been deleted");
  } catch (err) {
    next(err);
  }
};

export const getHotel = async (req, res, next) => {
  try {
    const hotel = await Hotels.findById(req.params.id);
    if (!hotel) {
      return res.status(404).json({ message: "Hotel not found" });
    }
    res.status(200).json(hotel);
  } catch (err) {
    next(err);
  }
};

export const featuredHotels = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 4;
    const filters = { ...req.query };
    delete filters.limit;

    const hotels = await Hotels.find(filters).limit(limit);

    res.status(200).json(hotels);
  } catch (err) {
    next(err);
  }
};

export const getAllHotels = async (req, res, next) => {
  try {
    const { min = 100, max = 100000, city } = req.query;

    const minPrice = parseInt(min, 10) || 100;
    const maxPrice = parseInt(max, 10) || 100000;

    const query = {
      cheapestPrice: { $gte: minPrice, $lte: maxPrice },
    };

    // Case-insensitive city filter
    if (city) {
      query.city = { $regex: new RegExp(`^${city}$`, "i") };
    }

    const hotels = await Hotels.find(query);

    if (!hotels.length) {
      return res.status(404).json({ message: "No hotels found" });
    }

    res.status(200).json(hotels);
  } catch (err) {
    next(err);
  }
};

export const countByCity = async (req, res, next) => {
  const cities = req.query.cities.split(",");
  try {
    const list = await Promise.all(
      cities.map((city) => {
        return Hotels.countDocuments({
          city: { $regex: new RegExp(`^${city}$`, "i") },
        });
      })
    );
    res.status(200).json(list);
  } catch (err) {
    next(err);
  }
};

export const countByType = async (req, res, next) => {
  try {
    const hotelCount = await Hotels.countDocuments({
      type: { $regex: /^hotel$/i },
    });
    const apartmentCount = await Hotels.countDocuments({
      type: { $regex: /^apartment$/i },
    });
    const resortCount = await Hotels.countDocuments({
      type: { $regex: /^resort$/i },
    });
    const villaCount = await Hotels.countDocuments({
      type: { $regex: /^villa$/i },
    });
    const cabinCount = await Hotels.countDocuments({
      type: { $regex: /^cabin$/i },
    });

    res.status(200).json([
      { type: "hotels", count: hotelCount },
      { type: "apartments", count: apartmentCount },
      { type: "resorts", count: resortCount },
      { type: "villas", count: villaCount },
      { type: "cabins", count: cabinCount },
    ]);
  } catch (err) {
    next(err);
  }
};

export const getHotelRooms = async (req, res, next) => {
  try {
    const hotel = await Hotels.findById(req.params.id);
    if (!hotel) {
      return res.status(404).json({ message: "Hotel not found" });
    }
    const list = await Promise.all(
      hotel.rooms.map((room) => {
        return Room.findById(room);
      })
    );
    res.status(200).json(list);
  } catch (err) {
    next(err);
  }
};

export const totalHotelCount = async (req, res, next) => {
  try {
    const totalCount = await Hotels.countDocuments();
    res.status(200).json(totalCount);
  } catch (err) {
    next(err);
  }
};

export const searchHotelsForChatBot = async (req, res) => {
  try {
    const { city, checkIn, checkOut, adults, children } = req.query;

    if (!city || !checkIn || !checkOut || !adults) {
      return res
        .status(400)
        .json({ message: "Missing required search parameters." });
    }

    // Find hotels by city
    const hotels = await Hotels.find({
      city: { $regex: new RegExp(city, "i") },
      status: "active", // Only active hotels
    });

    const desiredCheckIn = new Date(checkIn);
    const desiredCheckOut = new Date(checkOut);

    const filteredHotels = [];

    // For each hotel, check its rooms availability
    for (const hotel of hotels) {
      const roomIds = hotel.rooms;

      // Load all rooms of the hotel
      const rooms = await Rooms.find({ _id: { $in: roomIds } });

      let hasAvailableRoom = false;

      for (const room of rooms) {
        for (const roomNumber of room.roomNumbers) {
          const isAvailable = roomNumber.unavailableDates.every(
            (bookedDate) => {
              const booked = new Date(bookedDate);
              return booked < desiredCheckIn || booked >= desiredCheckOut;
            }
          );

          if (isAvailable) {
            hasAvailableRoom = true;
            break;
          }
        }
        if (hasAvailableRoom) break;
      }

      if (hasAvailableRoom) {
        filteredHotels.push(hotel);
      }
    }

    res.status(200).json(filteredHotels);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Something went wrong." });
  }
};
