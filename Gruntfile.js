module.exports = function(grunt){
    //load plugin
    [
        'grunt-cafe-mocha',
        'grunt-contrib-jshint',
        'grunt-exec',
    ].forEach(function(task){
        grunt.loadNpmTasks(task);
    });
    //set plugin
    grunt.initConfig({
        cafemocha:{
            all: { src : 'qa/tests-*.js', options : { ui: 'tdd'}, }
        },
        jshint: {
            app: [ 'meadowlark.js', 'public/js/**/*.js', 'lib/**/*.js'],
            qa: [ 'Gruntfile.js', 'public/qa/**/*.js', 'qa/**/*.js'],
        },
        exec: {
            options : { port: 3000 },
            linkchecker: { cmd:'linkchecker http://localhost:' + port }
        },
    });
    //register task
    grunt.registerTask('default', ['cafemocha', 'jshint', 'exec']);
};