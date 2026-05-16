const mongoose = require('mongoose');
const Project  = require('../models/Project');
const Task     = require('../models/Task');

const getDashboard = async (req, res) => {
  try {
    const userId = req.user._id;
    const now    = new Date();