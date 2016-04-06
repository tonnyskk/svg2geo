module.exports = function(grunt) {
  require('load-grunt-tasks')(grunt);
  configs = require('load-grunt-configs')(grunt);
  grunt.initConfig(configs);
  grunt.file.setBase("./");

  // Following tasks are specific to BIM 360
  grunt.registerTask('s2g-js', ['concat:s2g_js']);
  grunt.registerTask('s2g-babel', ['babel:s2g']);
  grunt.registerTask('s2g-uglify', ['uglify:s2g']);

  grunt.registerTask('build', ['s2g-js', 's2g-babel', 's2g-uglify']);
};
