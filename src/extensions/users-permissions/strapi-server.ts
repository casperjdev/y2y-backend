// !TODO - fix 500 res code when trying to /api/user/me

module.exports = (plugin) => {
  plugin.controllers.user.updateMe = async (ctx) => {
    if (!ctx.state.user || !ctx.state.user.id) {
      return (ctx.response.status = 401);
    }

    console.log(JSON.stringify(ctx, null, 2))

    await strapi
      .query("plugin::users-permissions.user")
      .update({
        where: { id: ctx.state.user.id },
        data: ctx.request.body.data,
      })
      .then((res) => {
        ctx.response.status = 200;
      });
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