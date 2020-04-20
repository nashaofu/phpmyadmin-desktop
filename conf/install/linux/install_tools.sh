check_command_exist(){
    local cmd="$1"
    if eval type type > /dev/null 2>&1; then
        eval type "$cmd" > /dev/null 2>&1
    elif command > /dev/null 2>&1; then
        command -v "$cmd" > /dev/null 2>&1
    else
        which "$cmd" > /dev/null 2>&1
    fi
    rt=$?
    if [ ${rt} -ne 0 ]; then
        echo "$cmd is not installed, please install it and try again."
        exit 1
    fi
}

#Install tools
install_tools(){
    echo "Starting to install development tools..."
    if check_sys packageManager apt; then
        apt-get -y update > /dev/null 2>&1
        apt_tools=(gcc g++ make)
        for tool in ${apt_tools[@]}; do
            error_detect_depends "apt-get -y install ${tool}"
        done
    elif check_sys packageManager yum; then
        yum makecache > /dev/null 2>&1
        yum_tools=(yum-utils gcc gcc-c++ make)
        for tool in ${yum_tools[@]}; do
            error_detect_depends "yum -y install ${tool}"
        done
        if centosversion 6 || centosversion 7; then
            error_detect_depends "yum -y install epel-release"
            yum-config-manager --enable epel > /dev/null 2>&1
        fi
    fi
    echo "Install development tools completed..."

    check_command_exist "gcc"
    check_command_exist "g++"
    check_command_exist "make"
}
