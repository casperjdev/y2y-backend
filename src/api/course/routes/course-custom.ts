export default {
  routes: [
    {
      method: "GET",
      path: "/courses/search",
      handler: "course.search"
    },
    {
      method: "GET",
      path: "/course",
      handler: "course.getCourse"
    },
  ]
}