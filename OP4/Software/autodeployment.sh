cd OP4/Software
npm install --production
npm update
kill -9 $(lsof -t -i:8081)     
BUILD_ID=dontKillMe nodejs Back-end/main.js &
netstat -ntlp | grep LISTEN
MOCHA_FILE=jenkins-test-results.xml ./node_modules/.bin/mocha Tests/** --reporter mocha-junit-reporter
