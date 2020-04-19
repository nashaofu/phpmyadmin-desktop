#!/usr/bin/env bash
cur_dir=$(cd -P -- "$(dirname -- "$0")" && pwd -P)

cd $cur_dir

include(){
    local path=${1}
    if [ -s ${cur_dir}/${path}.sh ];then
        . ${cur_dir}/${path}.sh
    else
        echo "Error: ${cur_dir}/${path}.sh not found, shell can not be executed."
        exit 1
    fi
}

if [[ ${EUID} -ne 0 ]]; then
    echo "This script must be run as root"
    exit 1
fi

# 导入脚本
include "get_opsy"
include "get_os_info"
include "check_os"
include "error_detect"
include "install_tools"
include "install_php"

get_os_info
check_os

# disable_selinux
if [ -s /etc/selinux/config ] && grep 'SELINUX=enforcing' /etc/selinux/config; then
    sed -i 's/SELINUX=enforcing/SELINUX=disabled/g' /etc/selinux/config
    setenforce 0
fi

# 安装编译工具
install_tools

install_php ${1} ${2}

echo
echo "--------------------- Install Success ----------------------------"
echo
