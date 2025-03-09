require("dotenv").config();
const express = require("express");
const session = require("express-session");
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const passport = require("passport");
const GitHubStrategy = require("passport-github2").Strategy;
const projectRoutes = require("./routes/projectRoutes");
const taskRoutes = require("./routes/taskRoutes.js");
const uploadRoutes = require("./routes/projectUploadRoutes");





const app = express();
app.use(express.json());
app.use(cors({ origin: "http://localhost:5173", credentials: true }));

// ✅ Add session middleware BEFORE Passport initialization
app.use(
  session({
    secret: "bc9d9c244f8ec38a4cf0753e7bf6c5eaad9232016662cf224211b6e8a9866411",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
  })
);

// ✅ Initialize Passport and use session middleware
app.use(passport.initialize());
app.use(passport.session());

// ✅ MongoDB Connection
mongoose.connect("mongodb://localhost:27017/projexDB")
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.log("❌ MongoDB Connection Error:", err));

// ✅ User Schema
const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  githubId: String,
});
const User = mongoose.model("User", UserSchema);

// ✅ GitHub OAuth Setup (UNCHANGED)
passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: "http://localhost:5001/auth/github/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      let user = await User.findOne({ githubId: profile.id });

      if (!user) {
        const email = profile.emails?.[0]?.value || null;
        user = new User({ name: profile.displayName, email, githubId: profile.id });
        await user.save();
      }

      return done(null, user);
    }
  )
);
passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  const user = await User.findById(id);
  done(null, user);
});

// ✅ GitHub Auth Routes (UNCHANGED)
app.get("/auth/github", passport.authenticate("github", { scope: ["user:email"] }));

app.get(
  "/auth/github/callback",
  passport.authenticate("github", { failureRedirect: "/" }),
  (req, res) => {
    res.redirect("http://localhost:5173/dashboard");
  }
);

// ✅ Sign Up Route (NEW)
app.post("/api/signup", async (req, res) => {
  const { name, email, password } = req.body;
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    return res.status(400).json({ message: "Email already exists!" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = new User({ name, email, password: hashedPassword });
  await newUser.save();
  res.json({ message: "Account created successfully!" });
});

// ✅ Sign In Route (NEW)
app.post("/api/signin", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ message: "Invalid Credentials" });
  }

  const token = jwt.sign({ userId: user._id, email: user.email }, "secret_key", { expiresIn: "1h" });
  res.json({ token, email: user.email });
});

// ✅ Reset Password Route (NEW)
app.post("/api/reset-password", async (req, res) => {
  const { email, newPassword } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    return res.status(404).json({ message: "User not found!" });
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  user.password = hashedPassword;
  await user.save();

  res.json({ message: "Password reset successfully!" });
});

// ✅ Test Route (UNCHANGED)
app.get("/auth/logout", (req, res) => {
    req.logout(function(err) {
      if (err) { 
        return res.status(500).json({ error: "Logout failed" }); 
      }
      req.session.destroy();
      res.clearCookie('connect.sid');
      res.status(200).json({ message: "Logged out successfully" });
    });
  });
  const path = require("path");
  app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

  
  app.use("/api/projects", projectRoutes);
  app.use("/api/tasks", taskRoutes);
  app.use("/api/uploads", uploadRoutes);

// ✅ Start the Server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
