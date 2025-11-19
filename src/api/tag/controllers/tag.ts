/**
 * tag controller
 */

import { factories } from '@strapi/strapi'

export default factories.createCoreController('api::tag.tag', ({ strapi }) => ({
  async getFlatlist(ctx) {
    const { data } = await super.find(ctx)

    const flatList = data.map((item: any) => item.label)

    return { data: flatList }
  }
}));

// SNIPPET FOR JAN
// const existing = await strapi.db
//         .query("api::user-question.user-question")
//         .findOne({
//           where: {
//             users_permissions_user: userId,
//             questions: questions,
//           },
//         });