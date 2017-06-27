cd OP4/Software/Back-end
pm2 stop all
pm2 start main.js -i max
pm2 show main
pm2 list
