module.exports = function(grunt){
    //load plugin
    [
        'grunt-contrib-jshint',
        'grunt-mocha-test',
    ].forEach(function(task){
        grunt.loadNpmTasks(task);
    });

    //set plugin
    grunt.initConfig({
        jshint: {
            app: ['meadowlark.js', 'routes.js', 'public/js/**/*.js', 'lib/**/*.js', 'handlers/**/*.js'],
            qa: ['Gruntfile.js', 'public/qa/**/*.js', 'qa/**/*.js'],
        },
        mochaTest: {
            test: {
                src: 'qa/tests-*.js',
                options: { ui: 'tdd'},
            }
        }
    });

    //register task
    grunt.registerTask('default', ['jshint', 'mochaTest']);
};