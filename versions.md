# TinyApp Version History

Following link send you back to README: [README](README.md)

Following list contains summary of update and bug fixes for each version update. It also may contain information regarding why and/or how such changes were made.

#### 1.0.1
- nodemon added to dependancy in package.json and checked npm start has value of "nodemon -L express_server.js"
- fixed issue where entering URL in 'create new URL' page in certain condition, anything other than 'http://', even 'https://' to be specific, resulted in loading indefinately
- replaced arrExtractSearch function in helpers.js with simpler and easy to understand findParentObjectName
- added description of screenshots in README
- for sake of consistancy, input with 'https://' was also made into 'http://' along with those with no protocol identifier, in order to avoid creating two URL links that are basically the same

## 1.0.0
- TinyApp was made and uploaded to github.