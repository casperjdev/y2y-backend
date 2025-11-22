module.exports = (plugin) => {
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

  return plugin;
}