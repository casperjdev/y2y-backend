module.exports = (plugin) => {
  plugin.controllers.user.search = async (ctx) => {
    if (!ctx.state.user || !ctx.state.user.id) {
      return (ctx.status = 401);
    }
    const { q } = ctx.query;
    
    if (!q) {
      return (ctx.status = 200, ctx.body = []); 
    }

    try {
      const searchRes = await strapi.db
      .query("plugin::users-permissions.user")
      .findMany({
        where: { 
          username: { $containsi: q.trim() },
        },
        select: ['id', 'username'] ,
        populate: {
          tags: true
        }
      });

      ctx.body = searchRes;
        
    } catch (err) { 
      strapi.log.error('User search query failed', err);
      ctx.status = 500;
      ctx.body = { error: 'Internal server error' };
    }
}

  plugin.controllers.user.updateMe = async (ctx) => {
    if (!ctx.state.user || !ctx.state.user.id) {
      return (ctx.status = 401);
    }

    try {
      const userUpdateRes = await strapi.db
        .query("plugin::users-permissions.user")
        .update({
          where: { id: ctx.state.user.id },
          data: ctx.request.body,
        })
        .then((res) => {
          ctx.body = "OK";
          ctx.status = 200;
        });
    } catch (err) {
      ctx.body = err
    }
  };

  plugin.controllers.user.getCourses = async (ctx) => {
    if (!ctx.state.user || !ctx.state.user.id) {
      return (ctx.response.status = 401);
    }
    const { id } = ctx.params
    
    const courses = await strapi.db
      .query("api::course.course")
      .findMany({
        where: {
          authors: {
            id: {
              $eq: id
            }
          },
          publishedAt: {
            $notNull: true
          }
        }
      })
      ctx.body = { courses }
  }
  plugin.controllers.user.getRecCourses = async (ctx) => {
    if (!ctx.state.user || !ctx.state.user.id) {
      return (ctx.response.status = 401);
    }
    const { id } = ctx.params
    const user = await strapi.db
    .query("plugin::users-permissions.user")
    .findOne({
      where: {
        id: {
          $eq: id
        }
      },
      populate: {
        tags: {
          where: {
            publishedAt: {
              $notNull: true
            }
          }
        }
      }
    })
    if(!user){
      return ctx.notFound("No tags found on this user")
    }
    const userTags = user.tags.map(tag => tag.label)
    const recommendedCourses = await strapi.db
    .query("api::course.course")
    .findMany({
      where: {
        tags: {
          label: {
            $in: userTags
          }
        },
        publishedAt: {
          $notNull: true
        }
      },
      populate: true
    })
    console.log(recommendedCourses)
    if(recommendedCourses.length===0){
      return { data: [], message: "No courses with similar tags found" }
    }
    return {data: recommendedCourses}
  }

    plugin.routes["content-api"].routes.push({
    method: "POST",
    path: "/user/me",
    handler: "user.updateMe",
    config: {
      prefix: "",
      policies: [],
    },
  });

  plugin.routes["content-api"].routes.push({
    method: "GET",
    path: "/user/:id/courses",
    handler: "user.getCourses",
    config: {
      prefix: "",
      policies: [],
    },
  });

  plugin.routes["content-api"].routes.push({
    method: "GET",
    path: "/user/search",
    handler: "user.search",
    config: {
      prefix: "",
      policies: [],
    },
  })

  plugin.routes["content-api"].routes.push({
    method: "GET",
    path: "/user/:id/recommended",
    handler: "user.getRecCourses",
    config: {
      prefix: "",
      policies: [],
    },
  })

  return plugin;
}