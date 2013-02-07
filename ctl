#!/bin/bash

app_id="mc-envall-se-expressjs"
app="app.js"
poll_interval_secs=5

PID_DIR="./"
LOG_DIR="./"
errlog="${LOG_DIR}stderr.log"
stdlog="${LOG_DIR}stdout.log"
applog="${LOG_DIR}appctl.log"


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
		echo "No pid for cmd script: $app"
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
	echo "[ $(iso_date) ] Keeping pid $pid alive, running app: [ $app ]" > $applog
	while [[ "alive" == "$(check_pid $pid)" ]]; do
		sleep $poll_interval_secs
	done
	echo "[ $(iso_date) ] App '$app' (pid $pid) died. Bringing it up again" > $applog
	node $app > $stdlog 2> $errlog &
	cmd_pid="$!"
	watch_pid $cmd_pid &
	ctl_pid="$!"
	echo "[ $(iso_date) ] Restarted app: $app" > $applog
	persist_pids $ctl_pid $cmd_pid &
}


function persist_pids() {
	echo "[ $(iso_date) ] Writing pids for $app_id: ctl: $1, cmd: $2" > $applog
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

	echo "[ $(iso_date) ] Purging $which pid for $app_id" > $applog
	rm -f $file
}

function stop() {
	echo "[ $(iso_date) ] stopping app: $app"
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
		echo "No pid for cmd script: $app"
	else
		kill $pid_cmd
		purge_pid "cmd"
		echo "..killed node $app (pid $pid_cmd)"
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

	node $app > $stdlog 2> $errlog &
	cmd_pid="$!"
	watch_pid $cmd_pid &
	ctl_pid="$!"
	persist_pids $ctl_pid $cmd_pid
	echo "[ $(iso_date) ] Started app: $app"
	$0 show
	exit

fi

usage
exit
	
