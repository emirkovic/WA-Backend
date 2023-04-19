const express = require('express');
const Auth = require('../middleware/auth');
const Users = require('../models/Korisnik');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { cloudinary } = require('../config/cloudinary');
const { loginValidator, registerValidator } = require('../validate/validator');

const router = express.Router();

// Login route
router.post('/login', async (req, res) => {
    const { errors, isValid } = loginValidator(req.body);
    if (!isValid) {
      return res.json({ success: false, errors });
    }
    try {
      const user = await Users.findOne({ email: req.body.email });
      if (!user) {
        return res.json({ success: false, message: 'Email does not exist' });
      }
      const success = await bcrypt.compare(req.body.password, user.password);
      if (!success) {
        return res.json({ success: false, message: 'Invalid password' });
      }
      const payload = {
        id: user._id,
        name: user.firstName,
      };
      const token = jwt.sign(payload, process.env.APP_SECRET, { expiresIn: 2345678 });
      res.json({ user, token: 'Bearer token: ' + token, success: true });
    } catch (err) {
      console.log(err);
      res.json({ success: false, message: 'Try again' });
    }
  })


// Register route
router.post('/register', async (req, res) => {
    const { errors, isValid } = registerValidator(req.body);
    if (!isValid) {
      return res.json({ success: false, errors });
    }
    try {
      const userData = req.body;
      const registerUser = new Users({
        ...userData,
        password: await bcrypt.hash(userData.password, 10),
        createdAt: new Date(),
      });
      await registerUser.save();
      res.json({ message: 'User created successfully', success: true });
    } catch (err) {
      console.log(err);
      res.json({ success: false, message: 'Try again' });
    }
  })


// Get user by ID
router.get('/:id', Auth, async (req, res) => {
    try {
      const user = await Users.findOne({ _id: req.params.id });
      res.json({ user, success: true });
    } catch (err) {
      console.log(err);
      res.json({ success: false, message: 'Try again' });
    }
  })

  
// Upload image
router.post('/upload-image', Auth, async (req, res) => {
    try {
        const fileStr = req.body.data;
        const uploadedResponse = await cloudinary.uploader.upload(fileStr);

        const user = await Users.findOne({ _id: req.body._id });
        user.avatar = { url: uploadedResponse.url, publicId: uploadedResponse.public_id };
        if (user.images) user.images.push({ url: uploadedResponse.url, publicId: uploadedResponse.public_id });
        else user.images = [{ url: uploadedResponse.url, publicId: uploadedResponse.public_id }];
        await user.save();
        
        res.json({ success: true });

    } catch (err) {
        console.log(err);
        res.json({ success: false, message: 'Try again' });
    }
})

module.exports = router;