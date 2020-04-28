
versionget(){
    if [[ -s /etc/redhat-release ]]; then
        grep -oE  "[0-9.]+" /etc/redhat-release
    else
        grep -oE  "[0-9.]+" /etc/issue
    fi
}

centosversion(){
    if check_sys sysRelease centos; then
        local code=${1}
        local version="$(versionget)"
        local main_ver=${version%%.*}
        if [ "$main_ver" == "$code" ]; then
            return 0
        else
            return 1
        fi
    else
        return 1
    fi
}

get_centosversion(){
    if check_sys sysRelease centos; then
        local version="$(versionget)"
        echo ${version%%.*}
    else
        echo ""
    fi
}

get_debianversion(){
    if check_sys sysRelease debian; then
        local version=$( get_opsy )
        local main_ver=$( echo ${version} | grep -oE  "[0-9.]+")
        echo ${main_ver%%.*}
    else
        echo ""
    fi
}

get_ubuntuversion(){
    if check_sys sysRelease ubuntu; then
        local version=$( get_opsy )
        local main_ver=$( echo ${version} | grep -oE  "[0-9.]+")
        echo ${main_ver%%.*}
    else
        echo ""
    fi
}


#Check system
check_sys(){
    local checkType="$1"
    local value="$2"
    local release=''
    local systemPackage=''
    if [[ -f /etc/redhat-release ]]; then
        release="centos"
        systemPackage="yum"
    elif grep -Eqi "debian" /etc/issue; then
        release="debian"
        systemPackage="apt"
    elif grep -Eqi "ubuntu" /etc/issue; then
        release="ubuntu"
        systemPackage="apt"
    elif grep -Eqi "centos|red hat|redhat" /etc/issue; then
        release="centos"
        systemPackage="yum"
    elif grep -Eqi "debian" /proc/version; then
        release="debian"
        systemPackage="apt"
    elif grep -Eqi "ubuntu" /proc/version; then
        release="ubuntu"
        systemPackage="apt"
    elif grep -Eqi "centos|red hat|redhat" /proc/version; then
        release="centos"
        systemPackage="yum"
    fi

    if [[ "${checkType}" == "sysRelease" ]]; then
        if [ "${value}" == "${release}" ]; then
            return 0
        else
            return 1
        fi
    elif [[ "${checkType}" == "packageManager" ]]; then
        if [ "${value}" == "${systemPackage}" ]; then
            return 0
        else
            return 1
        fi
    fi
}

check_os(){
    local is_support_flg=0
    if check_sys packageManager yum || check_sys packageManager apt; then
        # Not support CentOS prior to 6 & Debian prior to 8 & Ubuntu prior to 14 versions
        if [ -n "$(get_centosversion)" ] && [ $(get_centosversion) -lt 6 ]; then
            is_support_flg=1
        fi
        if [ -n "$(get_debianversion)" ] && [ $(get_debianversion) -lt 8 ]; then
            is_support_flg=1
        fi
        if [ -n "$(get_ubuntuversion)" ] && [ $(get_ubuntuversion) -lt 14 ]; then
            is_support_flg=1
        fi
    else
        is_support_flg=1
    fi
    if [ ${is_support_flg} -eq 1 ]; then
        echo "Not supported OS, please change OS to CentOS 6+ or Debian 8+ or Ubuntu 14+ and try again."
        exit 1
    fi
}