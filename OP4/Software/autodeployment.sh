cd OP4/Software/Back-end
pm2 stop all
pm2 delete all
pm2 start main.js -i max --watch
pm2 show main
pm2 logs main &