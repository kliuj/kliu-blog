#!/bin/bash
#
# node      Start up node server daemon
#
# chkconfig: 345 85 15
# description: Forever for Node.js
#
PATH=/home/wsliu/.nvm/versions/node/v0.12.7/bin
DEAMON=/home/wsliu/kliu/webApp/app.js
LOG=/home/wsliu/kliu/webApp/access
PID=/home/wsliu/kliu/webApp/forever.pid
case "$1" in
    start)
        forever start -l $LOG/forever.log -o $LOG/forever_out.log -e $LOG/forever_err.log --pidFile $PID -a $DEAMON

    stop)
        forever stop --pidFile $PID $DEAMON

    stopall)
        forever stopall --pidFile $PID

    restartall)
        forever restartall --pidFile $PID

    reload|restart)
        forever restart -l $LOG/forever.log -o $LOG/forever_out.log -e $LOG/forever_err.log --pidFile $PID -a $DEAMON

    list)
        forever list

    *)
        echo "Usage: /etc.init.d/node {start|stop|restart|reload|stopall|restartall|list}"
        exit 1

esac
exit 0