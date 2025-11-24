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

