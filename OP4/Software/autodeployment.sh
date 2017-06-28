cd OP4/Software
npm install --production
npm update
cd Back-end/       
lsof -i :8081 | grep "nodejs" | cut -d " " -f3 | xargs kill -9
nodejs main.js &