cd OP4/Software/Back-end
/usr/local/lib/node_modules/pm2 stop all
/usr/local/lib/node_modules/pm2 delete all
/usr/local/lib/node_modules/pm2 start main.js -i max --watch
/usr/local/lib/node_modules/pm2 show main