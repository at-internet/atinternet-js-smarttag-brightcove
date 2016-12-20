module.exports = function(grunt) {
    var fileName = 'dist/videojs.atinternet.'+require('./package.json').version+'.min.js';
    var gruntTasks = {
        uglify: {
            videojs: {
                files: {}
            }
        },
        clean: ["dist"]
    };
    gruntTasks.uglify.videojs.files[fileName] = ['src/videojs.atinternet.js'];
    grunt.initConfig(gruntTasks);

    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-clean');

    grunt.registerTask('Generate uglify file',['clean','uglify:videojs']);
};