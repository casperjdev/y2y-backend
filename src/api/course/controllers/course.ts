'use strict';

/**
 * course controller
 */

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::course.course', ({ strapi }) => ({
  async search(ctx) {
    const { q } = ctx.query;

    if (!q) {
      return ctx.badRequest('Search query is required');
    }

    try {
      const knex = strapi.db.connection;
      const model = strapi.getModel('api::course.course');
      const tableName = model.collectionName;

      const cleanQuery = q.trim();
      const safeQuery = cleanQuery.substring(0, 255);
      const distanceThreshold = 5; 

      const results = await knex(tableName)
        .select('document_id') 
        .whereNotNull('published_at')
        .whereRaw(
          `
            (
              COALESCE(title, '') ILIKE ? 
              
              OR COALESCE(description, '') ILIKE ?
              
              OR levenshtein(LOWER(LEFT(COALESCE(title, ''), 255)), LOWER(?)) <= ?
            )
          `,
          [`%${safeQuery}%`, `%${safeQuery}%`, safeQuery, distanceThreshold]
        )
        .orderByRaw(
          `
            levenshtein(LOWER(LEFT(COALESCE(title, ''), 255)), LOWER(?)) ASC,
            (COALESCE(description, '') ILIKE ?) DESC
          `,
          [safeQuery, `%${safeQuery}%`]
        );

      if (results.length === 0) {
        return { data: [], meta: { count: 0 } };
      }

      const matchingDocumentIds = [...new Set(results.map((row) => row.document_id))];
      
      const fullCourses = await strapi.documents('api::course.course').findMany({
        filters: {
          documentId: {
            $in: matchingDocumentIds,
          },
        },
        status: 'published', // Explicitly fetch published versions
        populate: ['cover', 'authors', 'tags', 'lessons'], 
      });

      const sortedCourses = matchingDocumentIds
        .map(docId => fullCourses.find(c => c.documentId === docId))
        .filter(Boolean);

      const contentType = strapi.contentType('api::course.course');
      const sanitizedEntity = await strapi.contentAPI.sanitize.output(
        sortedCourses,
        contentType,
        { auth: ctx.state.auth }
      );

      return { 
        data: sanitizedEntity, 
        meta: { count: sanitizedEntity.length } 
      };

    } catch (err) {
      if (err.message && err.message.includes('function levenshtein')) {
        return ctx.internalServerError('Missing Database Extension. Please run: CREATE EXTENSION IF NOT EXISTS fuzzystrmatch;');
      }
      console.error(err);
      ctx.body = err;
      ctx.status = 500;
    }
  },
  async getCourse(ctx){
      const { id } = ctx.query

      if (!id) {
        return ctx.badRequest("Missing id");
      }

      try {
        const course = await strapi.db
        .query("api::course.course")
        .findOne({
          where: {
            id: {
              $eq: id
            },
            publishedAt: {
              $notNull: true
            }
          },
          populate: true,
        })

        if(!course){
          return ctx.notFound("Course not found")
        }
        return {
          data: course
        }
      } catch (error) {
        console.error(error)
        return ctx.internalServerError("Something went wrong")
      }
  },
}));