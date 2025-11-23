export default {
  routes: [
    {
      method: "GET",
      path: "/courses/search/:q",
      handler: "course.search"
    }
  ]
}