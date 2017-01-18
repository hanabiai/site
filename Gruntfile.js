module.exports = function(grunt){
    //load plugin
    [
        'grunt-contrib-jshint',
        'grunt-mocha-test',
        'grunt-contrib-less',        
        'grunt-contrib-cssmin',
        'grunt-contrib-uglify',
        'grunt-hashres',
    ].forEach(function(task){
        grunt.loadNpmTasks(task);
    });

    //set plugin
    grunt.initConfig({
        // default task
        jshint: {
            options: {
                ignores: ['public/js/meadowlark*.js'],
            },
            app: ['meadowlark.js', 'routes.js', 'public/js/**/*.js', 'lib/**/*.js', 'controllers/**/*.js'],
            qa: ['Gruntfile.js', 'public/qa/**/*.js', 'qa/**/*.js'],
        },
        mochaTest: {
            test: {
                src: 'qa/tests-*.js',
                options: { ui: 'tdd'},
            }
        },
        // static task for bundling, minifying, and fingerprinting
        less: {
            development: {
                options: {
                    customFunctions: {
                        static: function(lessObject, name){
                            return 'url("' + require('./lib/static.js').map(name.value) + '")';
                        }
                    }
                },
                files: {
                    'public/css/main.css': 'less/main.less',
                    'public/css/cart.css': 'less/cart.less',
                }
            }
        },
        cssmin: {
            combine: {
                files: {
                    'public/css/meadowlark.css': ['public/css/**/*.css', '!public/css/meadowlark*.css']
                }
            },
            minify: {
                src: 'public/css/meadowlark.css',
                dest: 'public/css/meadowlark.min.css',
            }
        },
        uglify: {            
            all: {
                files: {
                    'public/js/meadowlark.min.js': ['public/js/**/*.js', '!public/js/meadowlark*.js']
                }
            }
        },
        hashres: {
            options: {
                fileNameFormat: '${name}.${hash}.${ext}'
            },
            all: {
                src: [
                    'public/js/meadowlark.min.js',
                    'public/css/meadowlark.min.css',
                ],
                dest: [
                    'views/layouts/main.hbs',
                    //'config.js',
                ]
            }
        }
    });

    //register task
    grunt.registerTask('default', ['jshint', 'mochaTest']);
    grunt.registerTask('static', ['less', 'cssmin', 'uglify', 'hashres']);
};