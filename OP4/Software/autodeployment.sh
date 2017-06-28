cd OP4/Software
npm install --production
npm update
kill -9 $(lsof -t -i:8081)     
node Back-end/main.js &