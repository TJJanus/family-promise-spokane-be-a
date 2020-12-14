const express = require('express');

const Notes = require('./notesModel');
const router = express.Router();

router.get('/', function (req, res) {
  Notes.findAll()
    .then((notes) => {
      res.status(200).json(notes);
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({ message: err.message });
    });
});

router.get('/:id', function (req, res) {
  const family_id = String(req.params.id);
  Notes.findById(family_id)
    .then((notes) => {
      if (notes) {
        res.status(200).json(notes);
      } else {
        res.status(404).json({ error: 'notes NotFound' });
      }
    })
    .catch((err) => {
      res.status(500).json({ error: err.message });
    });
});

router.post('/', async (req, res) => {
  const notes = req.body;
  if (notes) {
    const id = notes['family_id'] || 0;
    try {
      await Notes.findByfamilyId(id).then(async (pf) => {
        if (pf) {
          //notes not found so lets insert it
          await Notes.create(notes).then((notes) =>
            res.status(200).json({ message: 'notes created', notes: notes[0] })
          );
        } else {
          res.status(400).json({ message: 'family id doesnt exist!' });
        }
      });
    } catch (e) {
      console.error(e);
      res.status(500).json({ message: e.message });
    }
  } else {
    res.status(404).json({ message: 'notes missing' });
  }
});

router.put('/', (req, res) => {
  const notes = req.body;
  if (notes) {
    const id = notes['family_id'] || 0;
    Notes.indById(id)
      .then(
        Notes.update(id, notes)
          .then((updated) => {
            res
              .status(200)
              .json({ message: 'notes created', notes: updated[0] });
          })
          .catch((err) => {
            res.status(500).json({
              message: `Could not update notes '${id}'`,
              error: err.message,
            });
          })
      )
      .catch((err) => {
        res.status(404).json({
          message: `Could not find notes '${id}'`,
          error: err.message,
        });
      });
  }
});

router.delete('/:id', (req, res) => {
  const id = req.params.id;
  try {
    Notes.findById(id).then((notes) => {
      Notes.remove(notes['family_id']).then(() => {
        res
          .status(200)
          .json({ message: `notes '${id}' was deleted.`, notes: notes });
      });
    });
  } catch (err) {
    res.status(500).json({
      message: `Could not delete notes with ID: ${id}`,
      error: err.message,
    });
  }
});

module.exports = router;