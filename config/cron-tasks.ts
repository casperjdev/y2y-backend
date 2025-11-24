const { deleteUnusedTag } = require("../src/utils/tagCleanup")

export default {
    cleanupTagsDaily: {
        task: async () => {
            const allTags = await strapi.db
                .query("api::tag.tag")
                .findMany({})

            for(const tag of allTags){
                await deleteUnusedTag(tag.id)
            }
        },
        options: {
            rule: "0 3 * * *",
        }
    }
}