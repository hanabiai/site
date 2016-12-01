module.exports = function(grunt){
    //load plugin
    [
        'grunt-contrib-jshint'
    ].forEach(function(task){
        grunt.loadNpmTasks(task);
    });

    //set plugin
    grunt.initConfig({
        jshint: {
            app: ['meadowlark.js', 'public/js/**/*.js', 'lib/**/*.js'],
            qa: ['Gruntfile.js', 'qa/**/*.js'],
        },
    });

    //register task
    grunt.registerTask('default', ['jshint']);
};