#!/bin/bash
CMD="systemctl restart bt-pan"

while true;
do
	result=`ip a |awk '{print $2}' | sed 's/://' | grep bnep`
	if [ "$result" ]
	then
        	echo bnep0 is working.
	else
		echo bnep0 is not working. Restart bt-pan.
		${CMD}
    	fi
    	sleep 20;
done
