const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const passport = require("passport");
const session = require("express-session");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const MongoStore = require("connect-mongo");
const bodyParser = require("body-parser");
const {cookieParser} = require("cookie-parser");
const {
  Addtocart,
  Getcart,
  Deletecart,
  DeletecartId,
  Incrementcart,
  Decrementcart,
  Cart,
} = require("./cart/cart");
const User = require("./userSchema");
const { Schema, model } = mongoose;
dotenv.config();

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(cookieParser());
// CORS setup
const allowedOrigins = [
  "http://localhost:3000",
  "https://planty-beige.vercel.app",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        return callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);
app.use(express.json());

// Session setup
app.use(
  session({
    secret: process.env.SESSION_SECRET, // Replace with your own secret
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URL, // Ensure this is a valid MongoDB connection string
      mongooseConnection: mongoose.connection,
    }),
    cookie: {
      maxAge: 14 * 24 * 60 * 60 * 1000, // 14 days
      secure: process.env.NODE_ENV === "production", // true for HTTPS
    },
  })
);

// Passport initialization
app.use(passport.initialize());
app.use(passport.session());

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${
        "http://localhost:8000" || process.env.NEXT_PUBLIC_BASE_URL
      }/auth/google/callback`,
    },
    (accessToken, refreshToken, profile, done) => {
      const user = {
        googleId: profile.id,
        name: profile.displayName,
        email: profile.emails[0].value,
        avatar: profile.photos[0].value,
      };
      if (
        User.findOne({ googleId: user.googleId }) === null ||
        User.findOne({ googleId: user.googleId }) === ""
      ) {
        const cart = new User({
          googleId: user.googleId,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          createdAt: Date.now(),
        });
        cart.save();
      }
      return done(null, profile);
    }
  )
);

// Serialize user
passport.serializeUser((user, done) => {
  done(null, user);
});

// Deserialize user
passport.deserializeUser((user, done) => {
  done(null, user);
});

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => console.log(err));

// OAuth Routes
app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

app.get(
  "/auth/google/callback",
  (req, res, next) => {
    console.log("Google OAuth callback hit!");
    next();
  },
  passport.authenticate("google", {
    failureRedirect: "https://planty-beige.vercel.app/login",
  }),
  (req, res) => {
    console.log("User", req.body);
    res.cookie("user", req.body);
    res.redirect("https://planty-beige.vercel.app" || "http://localhost:3000");
  }
);

app.get("/logout", (req, res) => {
  req.logout((err) => {
    if (err) return next(err);
    res.redirect(process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000");
  });
});

app.post("/addtocart", Addtocart);
app.get("/getcart", Getcart);
app.delete("/deletecart", Deletecart);
app.delete("/deletecart/:id", DeletecartId);
app.put("/incrementcart/:id", Incrementcart);
app.put("/decrementcart/:id", Decrementcart);

// Cart Functionalities End

// Plant routes
const {
  addPlant,
  getPlants,
  deleteAllPlants,
  deletePlantById,
  updatePlantById,
} = require("./plants/Plants");

app.post("/plant", addPlant);
app.get("/plants", getPlants);
app.delete("/plants", deleteAllPlants);
app.delete("/plant/:id", deletePlantById);
app.put("/plant/:id", updatePlantById);

app.listen(8000, () => {
  console.log("Server is running on port 8000");
});
