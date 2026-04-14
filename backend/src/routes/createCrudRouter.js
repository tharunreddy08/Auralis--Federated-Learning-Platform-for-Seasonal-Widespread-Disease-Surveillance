import { Router } from 'express';
import mongoose from 'mongoose';

const parseQuery = (query) => {
  const { page = 1, limit = 20, sort = '-createdAt', ...filters } = query;

  const pageNumber = Math.max(Number(page) || 1, 1);
  const pageSize = Math.min(Math.max(Number(limit) || 20, 1), 100);

  return {
    filters,
    sort,
    pageNumber,
    pageSize,
    skip: (pageNumber - 1) * pageSize
  };
};

export const createCrudRouter = (Model) => {
  const router = Router();

  router.post('/', async (req, res, next) => {
    try {
      const doc = await Model.create(req.body);
      res.status(201).json(doc);
    } catch (error) {
      next(error);
    }
  });

  router.get('/', async (req, res, next) => {
    try {
      const { filters, sort, pageNumber, pageSize, skip } = parseQuery(req.query);
      const [items, total] = await Promise.all([
        Model.find(filters).sort(sort).skip(skip).limit(pageSize),
        Model.countDocuments(filters)
      ]);

      res.json({
        items,
        pagination: {
          total,
          page: pageNumber,
          limit: pageSize,
          totalPages: Math.max(Math.ceil(total / pageSize), 1)
        }
      });
    } catch (error) {
      next(error);
    }
  });

  router.get('/:id', async (req, res, next) => {
    try {
      const { id } = req.params;
      if (!mongoose.isValidObjectId(id)) {
        return res.status(400).json({ message: 'Invalid id format.' });
      }

      const item = await Model.findById(id);
      if (!item) {
        return res.status(404).json({ message: 'Record not found.' });
      }

      return res.json(item);
    } catch (error) {
      next(error);
    }
  });

  router.put('/:id', async (req, res, next) => {
    try {
      const { id } = req.params;
      if (!mongoose.isValidObjectId(id)) {
        return res.status(400).json({ message: 'Invalid id format.' });
      }

      const updated = await Model.findByIdAndUpdate(id, req.body, {
        new: true,
        runValidators: true
      });

      if (!updated) {
        return res.status(404).json({ message: 'Record not found.' });
      }

      return res.json(updated);
    } catch (error) {
      next(error);
    }
  });

  router.delete('/:id', async (req, res, next) => {
    try {
      const { id } = req.params;
      if (!mongoose.isValidObjectId(id)) {
        return res.status(400).json({ message: 'Invalid id format.' });
      }

      const deleted = await Model.findByIdAndDelete(id);
      if (!deleted) {
        return res.status(404).json({ message: 'Record not found.' });
      }

      return res.status(204).send();
    } catch (error) {
      next(error);
    }
  });

  return router;
};
