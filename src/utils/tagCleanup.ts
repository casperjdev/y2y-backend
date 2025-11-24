module.exports = {
    async deleteUnusedTag(tagId){
        const defaultTags: string[] = [
            "education",
            "personal growth",
            "creativity",
            "technology",
            "artificial intelligence",
            "mental health",
            "cybersecurity",
            "media literacy",
            "ecology",
            "digital culture",
            "future skills",
            "productivity",
            "art & photography",
            "music",
            "programming",
            "science & curiosity",
            "society",
            "creative expression",
            "soft skills",
            "career & competencies",
        ];
        const coursesUsingTag = await strapi.db
            .query("api::course.course")
            .count({
                where: {
                    tags: {
                        id:{
                            $eq: tagId
                        }
                    }
                }
            })
        const usersUsingTag = await strapi.db
            .query("plugin::users-permissions.user")
            .count({
                where: {
                    tags: {
                        id:{
                            $eq: tagId
                        }
                    }
                }
            })

        if (coursesUsingTag===0 && usersUsingTag===0) {
            await strapi.db
                .query("api::tag.tag")
                .delete({
                    where: {
                        id: {
                            $eq: tagId
                        },
                        label: {
                            $notIn: defaultTags
                        }
                    }
                })
                return true
        }
        return false
    }
}