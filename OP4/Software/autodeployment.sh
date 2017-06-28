cd OP4/Software
npm install --production
npm update
kill -9 $(lsof -t -i:8081)
cd Back-end/       
node Back-end/main.js &
exit 0