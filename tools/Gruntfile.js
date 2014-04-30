module.exports = function(grunt) {
    var md5 = require('blueimp-md5').md5;
    var fs = require('fs');
    var path = require('path');

    grunt.initConfig({
        
    });
    
    grunt.registerTask('checksum','Generate checksum', function(){
        var input = grunt.option('input');
        if (!input) {
            console.log("Please enter an input file.")
            return false;
        }
        var output = grunt.option('output')||input;
        
        input = path.resolve(__dirname, input);
        output = path.resolve(__dirname, output);
        
        var scriptList = grunt.file.readJSON(input);
        //concat the file lists
        var fileList = scriptList.bgScripts.concat(scriptList.contentScripts).concat(scriptList.otherFiles);
        //sort by A-Z order
        fileList = fileList.sort();
        
        var allContent = "";
        var dirname = path.dirname(input);
        for (var i = 0; i< fileList.length; i++) {
            var filename = path.resolve(dirname, fileList[i]);
            var fileContent = grunt.file.read(filename, {encoding: 'UTF8'} );
	    console.log(fileList[i] + ": " + fileContent.length);
            allContent += fileContent;
        }
        
        console.log("Total length: " + allContent.length);
        var checksum = md5(allContent);
        console.log("Checksum: ", checksum);
        
        scriptList.lastUpdate = new Date().getTime();
        scriptList.checksum = checksum;
        
        grunt.file.write(output, JSON.stringify(scriptList, null, '\t'));
        return true;
    });
    
    grunt.registerTask('default', ['checksum']);
};