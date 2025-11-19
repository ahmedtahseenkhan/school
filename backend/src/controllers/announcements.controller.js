const announcementService = require('../services/announcement.service');

exports.list = async (req, res, next) => {
  try {
    const announcements = await announcementService.listPublished();
    res.json({ announcements });
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try {
    const ann = await announcementService.create(req.body, req.user);
    res.status(201).json({ announcement: ann });
  } catch (err) { next(err); }
};
