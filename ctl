#!/bin/bash

CONF_FILE="ctl.conf"

# default variables..
#  -- log files
LOG_DIR="./"
# -- polling interval
POLL_INTERVAL_SECS=5


if [ -f $CONF_FILE ]; then
	source $CONF_FILE
fi


if [ -z $APP ]; then
	echo "# $0 needs variable 'app' to be set in configuration file '$CONF_FILE'"
	exit
fi


app_id="ctl-id-$APP"

errlog="${LOG_DIR}error.log"
applog="${LOG_DIR}application.log"
ctllog="${LOG_DIR}ctl.log"


PID_DIR="./"
PID_FILE_CTL="${PID_DIR}pid-$app_id.ctl"
PID_FILE_CMD="${PID_DIR}pid-$app_id.cmd"

cmd=$1

function iso_date() {
	date "+%Y-%m-%d %H:%M:%S"
}

function usage() {
	echo "Usage: $0 start|stop|show"
}

function get_pid() {
	which="$1"
	if [[ "cmd" == $which ]]; then
		file=$PID_FILE_CMD
	elif [[ "ctl" == $which ]]; then
		file=$PID_FILE_CTL
	fi
	if [ -f $file ]; then
		cat $file	
	else
		echo ""
	fi
}

function show() {
	pid_ctl=$(get_pid "ctl")
	pid_cmd=$(get_pid "cmd")
	if [[ -z $pid_ctl ]] ; then
		echo "No pid for ctl script: $0"
	else
		echo "#ctl pid $pid_ctl"
	fi
	if [[ -z $pid_cmd ]] ; then
		echo "No pid for cmd script: $APP"
	else
		echo "#cmd pid $pid_cmd"
	fi
}

function check_pid() {
	pid=$1
	status=$(ps -p $pid | egrep $pid)
	if [ -z "$status" ]; then # TODO: check for other problems too
		echo "dead"
	else
		echo "alive"
	fi
}

function watch_pid() {
	pid=$1
	echo "[ $(iso_date) ] Keeping pid $pid alive, running app: [ $APP ]" > $ctllog
	while [[ "alive" == "$(check_pid $pid)" ]]; do
		sleep $POLL_INTERVAL_SECS
	done
	echo "[ $(iso_date) ] App '$APP' (pid $pid) died. Bringing it up again" > $ctllog
	node $APP > $applog 2> $errlog &
	cmd_pid="$!"
	watch_pid $cmd_pid &
	ctl_pid="$!"
	echo "[ $(iso_date) ] Restarted app: $APP" > $ctllog
	persist_pids $ctl_pid $cmd_pid &
}


function persist_pids() {
	echo "[ $(iso_date) ] Writing pids for $app_id: ctl: $1, cmd: $2" > $ctllog
	echo "$1" > $PID_FILE_CTL
	echo "$2" > $PID_FILE_CMD
}

function purge_pid() {
	which="$1"
	if [[ "cmd" == $which ]]; then
		file=$PID_FILE_CMD
	elif [[ "ctl" == $which ]]; then
		file=$PID_FILE_CTL
	else
		# unknown token
		echo "purge_pid: unknown pid for token: [$which]"
		exit
	fi

	echo "[ $(iso_date) ] Purging $which pid for $app_id" > $ctllog
	rm -f $file
}

function stop() {
	echo "[ $(iso_date) ] stopping app: $APP"
	pid_ctl=$(get_pid "ctl")
	pid_cmd=$(get_pid "cmd")
	if [[ -z $pid_ctl ]] ; then
		echo "No pid for ctl script: $0"
	else
		kill $pid_ctl
		purge_pid "ctl"
		echo "..killed $0 (pid $pid_ctl)"
	fi
	rm -f $PID_FILE_CTL

	if [[ -z $pid_cmd ]] ; then
		echo "No pid for cmd script: $APP"
	else
		kill $pid_cmd
		purge_pid "cmd"
		echo "..killed node $APP (pid $pid_cmd)"
	fi
	rm -f $PID_FILE_CMD
}


# parse cmd
if [ -z $1 ]; then

	usage
	exit

elif [[ $cmd == "stop" ]]; then

	stop
	exit

elif [[ $cmd == "show" ]]; then

	show
	exit

elif [[ $cmd == "start" ]]; then

	node $APP > $applog 2> $errlog &
	cmd_pid="$!"
	watch_pid $cmd_pid &
	ctl_pid="$!"
	persist_pids $ctl_pid $cmd_pid
	echo "[ $(iso_date) ] Started app: $APP"
	$0 show
	exit

fi

usage
exit
