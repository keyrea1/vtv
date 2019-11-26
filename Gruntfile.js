module.exports = function(grunt){

       "use strict";

        grunt.initConfig({

            pkg: grunt.file.readJSON('package.json'),

            watch: {
                js: {
                    files: ['js/base.js'],
                    tasks: ['uglify']
                },

                font:{
                    files: ['icons/*.svg'],
                    tasks: ['webfonts']
                }

            },

            uglify: {
                build: {
                    files: {
                        'js/base.min.js': 'js/base.js'
                    }
                }
            },

            webfont:{
                icons:{
                    src: 'icons/*.svg',
                    dest: 'fonts'
                }
            }

        });

        grunt.registerTask('default', 'watch');
    };