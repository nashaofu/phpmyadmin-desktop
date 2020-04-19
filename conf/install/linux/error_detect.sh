error_detect(){
    local command="$1"
    local work_dir=$(pwd)
    local cur_soft=$(echo ${work_dir#$cur_dir} | awk -F'/' '{print $3}')
    ${command}
    if [ $? -ne 0 ]; then
        echo
        echo "+------------------+"
        echo "|  ERROR DETECTED  |"
        echo "+------------------+"
        echo "Installation ${cur_soft} failed."
        exit 1
    fi
}

error_detect_depends(){
    local command="$1"
    local depend=$(echo "$1" | awk '{print $4}')
    echo "Starting to install package ${depend}"
    ${command} > /dev/null 2>&1
    if [ $? -ne 0 ]; then
        echo
        echo "+------------------+"
        echo "|  ERROR DETECTED  |"
        echo "+------------------+"
        echo "Installation package ${depend} failed."
        exit 1
    fi
}
